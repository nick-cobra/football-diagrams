package io.github.footballdiagrams

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.requiredSize
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
import androidx.compose.ui.unit.dp
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
class CanvasConstraintsTest {
    @Test fun publicDefaultCanvasHonoursFixedHostBoundsThroughResizing() = runAndroidComposeUiTest<DiagramTestActivity> {
        val dimensions = mutableStateOf(320 to 90)
        val frame = DiagramFrame("f", "Setup", emptyList(), emptyList())
        val diagram = Diagram("Bounds", DiagramArea(40.0, 30.0), listOf(frame))
        setContent {
            Box(Modifier.requiredSize(dimensions.value.first.dp, dimensions.value.second.dp)) {
                FootballDiagram(diagram, 0, Modifier.fillMaxSize())
            }
        }
        for ((width, height) in listOf(320 to 90, 90 to 320, 334 to 263, 0 to 0, 0 to 1, 1 to 0, 320 to 90)) {
            dimensions.value = width to height
            waitForIdle()
            val bounds = onNodeWithContentDescription("Bounds — Setup").fetchSemanticsNode().boundsInRoot
            assertTrue(bounds.left >= -.1f && bounds.top >= -.1f && bounds.right <= width + .1f && bounds.bottom <= height + .1f,
                "$width x $height host must contain actual Canvas bounds $bounds")
        }
    }

    @Test fun isolatedInPitchActorsStillPaintAtEveryEdgeInConstrainedHosts() = runAndroidComposeUiTest<DiagramTestActivity> {
        val frame = DiagramFrame("f", "Setup", emptyList(), emptyList())
        val original = Diagram("Actors", DiagramArea(40.0, 30.0), listOf(frame))
        val shown = mutableStateOf(original)
        val dimensions = mutableStateOf(320 to 90)
        setContent {
            Box(Modifier.requiredSize(dimensions.value.first.dp, dimensions.value.second.dp)) {
                FootballDiagram(shown.value, 0, Modifier.fillMaxSize())
            }
        }
        fun image(): IntArray {
            val bitmap = onNodeWithContentDescription("Actors — Setup").captureToImage().asAndroidBitmap()
            return IntArray(bitmap.width * bitmap.height).also { bitmap.getPixels(it, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height) }
        }
        for (version in 1..2) for (size in listOf(320 to 90, 90 to 320, 334 to 263)) {
            dimensions.value = size
            shown.value = original.copy(formatVersion = version)
            waitForIdle()
            val grass = image()
            for ((x, y) in listOf(20.0 to 29.0, 20.0 to 1.0, 1.0 to 15.0, 39.0 to 15.0)) {
                shown.value = shown.value.copy(frames = listOf(frame.copy(objects = listOf(DiagramObject(DiagramObjectKind.Coach, x, y, hasBall = true)))))
                waitForIdle()
                assertFalse(grass.contentEquals(image()), "$version/$size in-pitch actor at$x,$y must remain visible")
            }
            // Changing host constraints through zero must not retain stale paths/pixels.
            val before = image()
            dimensions.value = 0 to 0
            waitForIdle()
            dimensions.value = size
            waitForIdle()
            assertContentEquals(before, image())
        }
    }
}
