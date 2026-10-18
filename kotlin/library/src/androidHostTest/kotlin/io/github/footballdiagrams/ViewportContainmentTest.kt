package io.github.footballdiagrams

import android.graphics.Bitmap
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.requiredSize
import androidx.compose.foundation.layout.requiredWidth
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.*
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import kotlin.math.roundToInt
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36], qualifiers = "w1000dp-h1400dp-mdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@OptIn(ExperimentalTestApi::class)
class ViewportContainmentTest {
    @Test
    fun authoredContentCannotPaintOnNeighbouringHostUi() = runAndroidComposeUiTest<DiagramTestActivity> {
        val empty = DiagramFrame("f", "Frame", emptyList(), emptyList())
        val base = Diagram("Viewport", DiagramArea(30.0, 20.0), listOf(empty))
        val shown = mutableStateOf(base)
        setContent {
            CompositionLocalProvider(LocalDensity provides Density(1f)) {
                Box(Modifier.requiredSize(600.dp, 500.dp).background(Color.Magenta).testTag("parent")) {
                    FootballDiagram(shown.value, 0, Modifier.offset(100.dp, 100.dp).requiredWidth(300.dp))
                }
            }
        }
        val parent = onNodeWithTag("parent")
        val before = parent.captureToImage().asAndroidBitmap()
        val parentBounds = parent.fetchSemanticsNode().boundsInRoot
        val bounds = onNodeWithContentDescription("Viewport — Frame").fetchSemanticsNode().boundsInRoot
        val left = (bounds.left - parentBounds.left).roundToInt()
        val top = (bounds.top - parentBounds.top).roundToInt()
        val right = (bounds.right - parentBounds.left).roundToInt()
        val bottom = (bounds.bottom - parentBounds.top).roundToInt()
        assertEquals(300, right - left)
        val cases = listOf(
            "right-player" to empty.copy(objects = listOf(DiagramObject(DiagramObjectKind.Player, 50.0, 10.0))),
            "left-equipment" to empty.copy(objects = listOf(DiagramObject(DiagramObjectKind.Cone, -10.0, 10.0))),
            "top-arrow" to empty.copy(arrows = listOf(DiagramArrow(DiagramArrowKind.Pass, listOf(DiagramPoint(10.0, -10.0), DiagramPoint(20.0, -10.0))))),
            "bottom-zone" to empty.copy(areas = listOf(DiagramSubArea("Zone", 10.0, 35.0, 10.0, 5.0))),
            "right-badge" to empty.copy(arrows = listOf(DiagramArrow(DiagramArrowKind.Run, listOf(DiagramPoint(5.0, 5.0), DiagramPoint(10.0, 10.0)), sequence = 1, badge = DiagramPoint(50.0, 10.0)))),
            "partial-zone" to empty.copy(areas = listOf(DiagramSubArea("Zone", 28.0, 3.0, 10.0, 5.0))),
            "partial-arrow" to empty.copy(arrows = listOf(DiagramArrow(DiagramArrowKind.Shot, listOf(DiagramPoint(25.0, 10.0), DiagramPoint(50.0, 10.0))))),
        )
        for ((name, frame) in cases) {
            shown.value = Diagrams.parse(Diagrams.stringify(base.copy(frames = listOf(frame))))
            waitForIdle()
            val after = parent.captureToImage().asAndroidBitmap()
            var outside = 0
            var inside = 0
            for (y in 0 until after.height) for (x in 0 until after.width) {
                if (before.getPixel(x, y) == after.getPixel(x, y)) continue
                if (x < left || x >= right || y < top || y >= bottom) outside++ else inside++
            }
            File("build/reports/rendering/viewport-$name.png").apply { parentFile?.mkdirs() }.outputStream().use {
                after.compress(Bitmap.CompressFormat.PNG, 100, it)
            }
            assertEquals(0, outside, "$name painted outside the measured component")
            if (name.startsWith("partial")) assertTrue(inside > 0, "$name must retain its visible portion")
        }
    }
}
