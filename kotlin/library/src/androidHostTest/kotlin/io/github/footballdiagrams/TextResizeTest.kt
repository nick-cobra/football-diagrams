package io.github.footballdiagrams

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.requiredWidth
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.unit.dp
import kotlin.math.hypot
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
import android.graphics.Bitmap
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.font.createFontFamilyResolver
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import java.io.File
import org.robolectric.RuntimeEnvironment
import androidx.compose.ui.unit.IntSize
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.test.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36], qualifiers = "w1000dp-h1400dp-mdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@OptIn(ExperimentalTestApi::class)
class TextResizeTest {
    @Test fun continuousResizeReusesParagraphsThenSettlesToExactMetrics() = runAndroidComposeUiTest<DiagramTestActivity> {
        val area = DiagramArea(40.0, 30.0)
        val g = diagramGeometry(area)
        val frame = DiagramFrame("f", "Dense", (1..60).map {
            DiagramObject(DiagramObjectKind.Player, 2.0 + it % 10 * 3.8, 2.0 + it / 10 * 4.2, number = it, label = "Player $it")
        }, emptyList())
        val labels = layoutDiagramLabels(area, frame, g)
        lateinit var resize: DiagramTextResizeState
        lateinit var measurer: TextMeasurer
        setContent { resize = rememberDiagramTextResizeState(g); measurer = rememberDiagramTextMeasurer(labels) }
        mainClock.autoAdvance = false
        fun scale(size: IntSize) = g.pixelsPerMetre(size.width.toFloat(), size.height.toFloat())
        fun paragraphs(actual: Float) = labels.map { measureDiagramLabel(it, g, resize.scaleForDraw(actual), 1f, 1f, measurer).multiParagraph }
        val firstSize = IntSize(600, 472)
        runOnIdle { resize.onSizeChanged(firstSize) }
        mainClock.advanceTimeByFrame()
        val firstScale = scale(firstSize)
        val first = paragraphs(firstScale)
        var latest = firstSize
        for (width in 601..610) {
            latest = IntSize(width, (width / g.aspectRatio).toInt())
            runOnIdle { resize.onSizeChanged(latest) }
            mainClock.advanceTimeByFrame()
            assertEquals(firstScale, resize.scaleForDraw(scale(latest)))
            val reused = paragraphs(scale(latest))
            first.indices.forEach { assertSame(first[it], reused[it], "Resize must not reshape unchanged label $it") }
        }
        mainClock.advanceTimeBy(250)
        waitForIdle()
        assertEquals(scale(latest), resize.scaleForDraw(scale(latest)), "After resizing stops, measure at the exact new scale")
        val settled = paragraphs(scale(latest))
        first.indices.forEach { assertNotSame(first[it], settled[it]) }
        val largeJump = IntSize(300, 236)
        runOnIdle { resize.onSizeChanged(largeJump) }
        assertEquals(scale(largeJump), resize.scaleForDraw(scale(largeJump)), "Large jumps must immediately use exact metrics")
        assertEquals(0f, resize.scaleForDraw(0f))
    }

    @Test fun disposalCancelsPendingSettlingWork() = runAndroidComposeUiTest<DiagramTestActivity> {
        val g = diagramGeometry(DiagramArea(40.0, 30.0))
        val enabled = mutableStateOf(true)
        lateinit var state: DiagramTextResizeState
        var disposed = false
        setContent {
            if (enabled.value) {
                state = rememberDiagramTextResizeState(g)
                DisposableEffect(Unit) { onDispose { disposed = true } }
            }
        }
        mainClock.autoAdvance = false
        runOnIdle { state.onSizeChanged(IntSize(600, 472)) }
        mainClock.advanceTimeByFrame()
        val reference = g.pixelsPerMetre(600f, 472f)
        runOnIdle { state.onSizeChanged(IntSize(601, 473)) }
        mainClock.advanceTimeByFrame()
        val old = state
        runOnIdle { enabled.value = false }
        mainClock.advanceTimeBy(48)
        waitForIdle()
        assertTrue(disposed)
        mainClock.advanceTimeBy(250)
        assertEquals(reference, old.scaleForDraw(g.pixelsPerMetre(601f, 473f)), "A disposed diagram must not commit delayed text work")
    }

    @Test fun settledResizeMatchesFreshPixelsAndIntermediateWideTextStaysContained() = runAndroidComposeUiTest<DiagramTestActivity> {
        val diagram = Diagrams.parse(conformanceFixtures.single { it.name == "valid/wide-labels.json" }.json)
        val g = diagramGeometry(diagram.area)
        val labels = layoutDiagramLabels(diagram.area, diagram.frames.first(), g)
        val width = mutableStateOf(600f)
        val mount = mutableIntStateOf(0)
        var mounts = 0
        setContent {
            Box(Modifier.requiredWidth(width.value.dp)) {
                key(mount.intValue) {
                    DisposableEffect(Unit) { mounts++; onDispose { } }
                    FootballDiagram(diagram, 0)
                }
            }
        }
        fun image(name: String? = null): IntArray {
            val b = onNodeWithContentDescription("${diagram.title} — ${diagram.frames.first().title}").captureToImage().asAndroidBitmap()
            if (name != null) File("build/reports/rendering/$name.png").apply { parentFile?.mkdirs() }.outputStream().use {
                b.compress(Bitmap.CompressFormat.PNG, 100, it)
            }
            return IntArray(b.width * b.height).also { b.getPixels(it, 0, b.width, 0, 0, b.width, b.height) }
        }
        image()
        width.value = 601f
        waitForIdle()
        val moving = image("resize-moving")
        mainClock.advanceTimeBy(250)
        waitForIdle()
        val settled = image("resize-settled")
        mount.intValue++
        waitForIdle()
        assertEquals(2, mounts, "The pixel reference must be a genuinely fresh composition")
        assertContentEquals(settled, image("resize-fresh"), "Settled text must exactly match a new composition at its real scale")
        assertEquals(moving.size, settled.size)
        assertFalse(moving.contentEquals(settled), "The first capture must exercise interpolated text, before the exact quiet-period draw")
        // These are the exact same measurements and transforms used by drawing,
        // including wide Latin, CJK, emoji, multiline badges and fitted pills.
        val reference = 600f / g.viewportWidth
        for (factor in listOf(0.8f, 601f / 600f, 1.25f)) {
            val actual = reference * factor
            val ratio = actual / reference
            val measurer = TextMeasurer(createFontFamilyResolver(RuntimeEnvironment.getApplication()), Density(1f), LayoutDirection.Ltr, labels.size * 2)
            for (label in labels) {
                val measured = measureDiagramLabel(label, g, reference, 1f, 1f, measurer)
                if (label.isBadge) {
                    assertTrue(hypot(measured.size.width.toFloat(), measured.size.height.toFloat()) / 2f * ratio <= label.width * actual / 2f * 0.9f)
                } else {
                    val b = labelPillBounds(g, label, reference, measured.size.width.toFloat(), measured.size.height.toFloat())
                    assertTrue(b.left * ratio >= -g.marginMetres * actual - 0.001f)
                    assertTrue(b.top * ratio >= -g.marginMetres * actual - 0.001f)
                    assertTrue(b.right * ratio <= (g.lengthMetres + g.marginMetres) * actual + 0.001f)
                    assertTrue(b.bottom * ratio <= (g.widthMetres + g.marginMetres) * actual + 0.001f)
                }
            }
        }
    }
}
