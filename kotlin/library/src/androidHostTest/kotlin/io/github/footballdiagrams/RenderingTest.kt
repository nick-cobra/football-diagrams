package io.github.footballdiagrams

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.requiredWidth
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.platform.LocalDensity
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
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DiagramTestActivity : ComponentActivity()

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36], qualifiers = "w1000dp-h1400dp-mdpi")
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@OptIn(ExperimentalTestApi::class)
class RenderingTest {
    private fun fixture(name: String) = Diagrams.parse(conformanceFixtures.single { it.name == "valid/$name.json" }.json)

    @Test
    fun glyphsArrowsLabelsAndZonesPaintReviewedPixels() = runAndroidComposeUiTest<DiagramTestActivity> {
        val shown = mutableStateOf(fixture("all-kinds"))
        val width = mutableStateOf(600f)
        val density = mutableStateOf(Density(1f, 1f))
        setContent {
            CompositionLocalProvider(LocalDensity provides density.value) {
                Box(Modifier.requiredWidth((width.value / density.value.density).dp)) {
                    FootballDiagram(shown.value, 0)
                }
            }
        }
        for ((name, diagram) in listOf("all-kinds" to fixture("all-kinds"), "labels-zones" to fixture("pass-and-move"), "square" to fixture("square"), "short-labels" to fixture("short-labels"))) {
            shown.value = diagram
            waitForIdle()
            val bitmap = onNodeWithContentDescription("${diagram.title} — ${diagram.frames.first().title}").captureToImage().asAndroidBitmap()
            assertImage(name, bitmap)
        }
        shown.value = fixture("all-kinds")
        width.value = 320f
        waitForIdle()
        assertImage("narrow", onNodeWithContentDescription("Equipment and movement — Setup").captureToImage().asAndroidBitmap())
        width.value = 600f
        density.value = Density(2f, 1.4f)
        waitForIdle()
        assertImage("density-font-scale", onNodeWithContentDescription("Equipment and movement — Setup").captureToImage().asAndroidBitmap())
    }

    @Test
    fun selectionAndRepeatedRecompositionUpdateTheCanvas() = runAndroidComposeUiTest<DiagramTestActivity> {
        val diagram = mutableStateOf(fixture("multi-frame"))
        val index = mutableStateOf(0)
        setContent { Box(Modifier.requiredWidth(320.dp)) { FootballDiagram(diagram.value, index.value) } }
        val images = mutableListOf<List<Int>>()
        for (selection in listOf(0, 1, 0, 1)) {
            index.value = selection
            waitForIdle()
            val frame = diagram.value.frames[selection]
            val bitmap = onNodeWithContentDescription("${diagram.value.title} — ${frame.title}").captureToImage().asAndroidBitmap()
            images += pixels(bitmap).toList()
        }
        assertTrue(images[0] != images[1], "Frame changes must alter actual pixels")
        assertEquals(images[0], images[2])
        assertEquals(images[1], images[3])
        index.value = -1
        waitForIdle()
        onAllNodes(hasContentDescription("Pass and move — Setup") or hasContentDescription("Pass and move — Move")).assertCountEquals(0)
        index.value = 999
        waitForIdle()
        onAllNodes(hasContentDescription("Pass and move — Setup") or hasContentDescription("Pass and move — Move")).assertCountEquals(0)
        diagram.value = fixture("empty")
        index.value = 0
        waitForIdle()
        onAllNodes(hasContentDescription("Pass and move — Setup") or hasContentDescription("Pass and move — Move")).assertCountEquals(0)
    }

    private fun pixels(bitmap: Bitmap) = IntArray(bitmap.width * bitmap.height).also {
        bitmap.getPixels(it, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
    }

    private fun assertImage(name: String, actual: Bitmap) {
        val output = File("build/reports/rendering/$name.png").apply { parentFile?.mkdirs() }
        output.outputStream().use { actual.compress(Bitmap.CompressFormat.PNG, 100, it) }
        val colours = pixels(actual).toSet()
        assertTrue(colours.size > 40, "$name: Canvas must paint glyphs and text, not a blank image")
        val expectedFile = File("src/androidHostTest/resources/snapshots/$name.png")
        if (System.getenv("UPDATE_DIAGRAM_SNAPSHOTS") == "1") {
            output.copyTo(expectedFile, overwrite = true)
        }
        assertTrue(expectedFile.isFile, "Inspect $output and explicitly generate the reviewed baseline")
        val expected = BitmapFactory.decodeFile(expectedFile.absolutePath)
        assertEquals(expected.width, actual.width, name)
        assertEquals(expected.height, actual.height, name)
        val before = pixels(expected)
        val after = pixels(actual)
        val changed = before.indices.count { before[it] != after[it] }
        assertEquals(0, changed, "$name: $changed pixels changed; actual image: $output")
    }
}
