package io.github.footballdiagrams

import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalFontFamilyResolver
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.font.createFontFamilyResolver
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.math.hypot
import kotlin.test.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36], qualifiers = "w1000dp-h1400dp-mdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@OptIn(ExperimentalTestApi::class)
class TextLayoutTest {
    @Test fun denseFrameReusesBothOriginalAndFittedLayoutsAndInvalidatesEnvironment() = runAndroidComposeUiTest<DiagramTestActivity> {
        val area = DiagramArea(40.0, 30.0)
        val g = diagramGeometry(area)
        val frame = DiagramFrame("f", "Dense", (1..60).map {
            DiagramObject(DiagramObjectKind.Player, 20.0, 15.0, number = it, label = "$it " + "W".repeat(110))
        }, emptyList())
        val labels = mutableStateOf(layoutDiagramLabels(area, frame, g))
        val density = mutableStateOf(Density(1f, 1f))
        val direction = mutableStateOf(LayoutDirection.Ltr)
        val resolver = mutableStateOf(createFontFamilyResolver(RuntimeEnvironment.getApplication()))
        lateinit var measurer: TextMeasurer
        setContent {
            CompositionLocalProvider(LocalDensity provides density.value, LocalLayoutDirection provides direction.value, LocalFontFamilyResolver provides resolver.value) {
                measurer = rememberDiagramTextMeasurer(labels.value)
            }
        }
        fun layouts(scale: Float) = labels.value.map {
            measureDiagramLabel(it, g, scale, density.value.density, density.value.fontScale, measurer)
        }
        runOnIdle {
            val first = layouts(600f / g.viewportWidth)
            repeat(5) {
                val next = layouts(600f / g.viewportWidth)
                first.indices.forEach { assertSame(first[it].multiParagraph, next[it].multiParagraph, "Label $it was laid out again") }
            }
            val resized = layouts(320f / g.viewportWidth)
            first.indices.forEach { assertNotSame(first[it].multiParagraph, resized[it].multiParagraph) }
            val repeated = layouts(320f / g.viewportWidth)
            resized.indices.forEach { assertSame(resized[it].multiParagraph, repeated[it].multiParagraph) }
        }
        val original = measurer
        labels.value = labels.value.map { it.copy(text = "Changed ${it.text}") }
        waitForIdle()
        assertNotSame(original, measurer, "Old frame text must not be retained by the active measurer")
        val beforeDensity = measurer
        density.value = Density(2f, 1.4f)
        waitForIdle()
        assertNotSame(beforeDensity, measurer)
        val beforeDirection = measurer
        direction.value = LayoutDirection.Rtl
        waitForIdle()
        assertNotSame(beforeDirection, measurer)
        val beforeFonts = measurer
        resolver.value = createFontFamilyResolver(RuntimeEnvironment.getApplication())
        waitForIdle()
        assertNotSame(beforeFonts, measurer)
    }

    @Test fun wideUnicodeAndMultilineBadgeTextFitsTheInnerCircle() {
        val area = DiagramArea(40.0, 30.0)
        val g = diagramGeometry(area)
        for (density in listOf(Density(1f), Density(2f, 1.4f))) {
            val measurer = TextMeasurer(createFontFamilyResolver(RuntimeEnvironment.getApplication()), density, LayoutDirection.Ltr, 32)
            for (width in listOf(320f, 600f)) for (text in listOf("WWW", "漢漢漢", "😀😀😀", "A\nB", "7", "99", "C")) {
                val frame = DiagramFrame("f", "Badge", listOf(DiagramObject(DiagramObjectKind.Player, 20.0, 15.0, short = text)), emptyList())
                val label = layoutDiagramLabels(area, frame, g).single()
                val scale = width / g.viewportWidth
                val layout = measureDiagramLabel(label, g, scale, density.density, density.fontScale, measurer)
                val cornerRadius = hypot(layout.size.width.toFloat(), layout.size.height.toFloat()) / 2f
                assertTrue(cornerRadius <= label.width * scale / 2f * 0.9f, "$text at $width/$density: text corner $cornerRadius escapes badge")
                assertEquals(text, layout.layoutInput.text.text)
            }
        }
    }
}
