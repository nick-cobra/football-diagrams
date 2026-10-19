package io.github.footballdiagrams

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.requiredSize
import androidx.compose.runtime.mutableFloatStateOf
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
class RenderMarginPixelsTest {
    @Test fun publicMarginFramesOffPitchActorsInNaturalAndLetterboxedCanvases() = runAndroidComposeUiTest<DiagramTestActivity> {
        val empty = DiagramFrame("f", "Setup", emptyList(), emptyList())
        val shown = mutableStateOf(Diagram("Margin", DiagramArea(40.0, 30.0), listOf(empty)))
        val dimensions = mutableStateOf(334 to 300)
        setContent {
            Box(Modifier.requiredSize(dimensions.value.first.dp, dimensions.value.second.dp)) {
                FootballDiagram(shown.value, 0, Modifier.fillMaxSize(), marginMetres = 16f)
            }
        }
        fun image() = pixels(onNodeWithContentDescription("Margin — Setup").captureToImage().asAndroidBitmap())
        for (version in 1..2) for (size in listOf(334 to 300, 320 to 90, 90 to 320)) {
            dimensions.value = size
            shown.value = shown.value.copy(formatVersion = version, frames = listOf(empty))
            waitForIdle()
            val grass = image()
            for ((x, y) in listOf(50.0 to 15.0, -10.0 to 15.0, 20.0 to 37.5, 20.0 to -7.5)) {
                shown.value = shown.value.copy(frames = listOf(empty.copy(objects = listOf(DiagramObject(DiagramObjectKind.Coach, x, y, hasBall = true)))))
                waitForIdle()
                assertFalse(grass.contentEquals(image()), "$version/$size actor at $x,$y must paint")
            }
        }
    }

    @Test fun marginOnlyChangeInvalidatesArrowClippingAndRestoresDefaultPixels() = runAndroidComposeUiTest<DiagramTestActivity> {
        val frame = DiagramFrame("f", "Setup", emptyList(), listOf(DiagramArrow(DiagramArrowKind.Dribble, listOf(DiagramPoint(50.0, 10.0), DiagramPoint(50.0, 20.0)))))
        val original = Diagram("Arrow margin", DiagramArea(40.0, 30.0), listOf(frame))
        val shown = mutableStateOf(original)
        val margin = mutableFloatStateOf(0f)
        setContent {
            Box(Modifier.requiredSize(600.dp, 500.dp)) {
                FootballDiagram(shown.value, 0, Modifier.fillMaxSize(), marginMetres = margin.floatValue)
            }
        }
        fun image() = pixels(onNodeWithContentDescription("Arrow margin — Setup").captureToImage().asAndroidBitmap())
        val baseline = image()
        margin.floatValue = 16f
        waitForIdle()
        val expanded = image()
        shown.value = original.copy(frames = listOf(frame.copy(arrows = emptyList())))
        waitForIdle()
        assertFalse(expanded.contentEquals(image()), "A newly visible dribble must be prepared when only the margin changed")
        shown.value = original
        margin.floatValue = 0f
        waitForIdle()
        assertContentEquals(baseline, image())
    }

    private fun pixels(bitmap: android.graphics.Bitmap) = IntArray(bitmap.width * bitmap.height).also {
        bitmap.getPixels(it, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
    }
}
