package io.github.footballdiagrams

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.requiredWidth
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
import androidx.compose.ui.text.MultiParagraph
import androidx.compose.ui.text.TextMeasurer
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
class ComposeInvalidationTest {
    @Test fun playerMovementAndSameTextFrameNavigationReuseParagraphs() = runAndroidComposeUiTest<DiagramTestActivity> {
        val area = DiagramArea(40.0, 30.0)
        val geometry = diagramGeometry(area)
        val original = DiagramFrame("first", "First", (1..60).map {
            DiagramObject(DiagramObjectKind.Player, 2.0 + it % 10 * 3.8, 2.0 + it / 10 * 4.2, number = it, label = "Player $it")
        }, emptyList())
        val moved = original.copy(id = "second", title = "Second", objects = original.objects.mapIndexed { i, target ->
            if (i == 0) target.copy(x = target.x + 0.01) else target
        })
        val frames = mutableStateOf(listOf(original, moved))
        val index = mutableIntStateOf(0)
        var labels = emptyList<DiagramLabel>()
        lateinit var measurer: TextMeasurer
        setContent {
            labels = layoutDiagramLabels(area, frames.value[index.intValue], geometry)
            measurer = rememberDiagramTextMeasurer(labels)
        }
        fun paragraphs() = labels.map { measureDiagramLabel(it, geometry, 600f / geometry.viewportWidth, 1f, 1f, measurer).multiParagraph }
        var first = emptyList<MultiParagraph>()
        runOnIdle { first = paragraphs() }
        val firstMeasurer = measurer
        for (selection in listOf(1, 0, 1, 0)) {
            index.intValue = selection
            waitForIdle()
            runOnIdle {
                assertSame(firstMeasurer, measurer, "Positions and frame metadata must not discard the text cache")
                val next = paragraphs()
                first.indices.forEach { assertSame(first[it], next[it], "Unchanged text $it was shaped again") }
            }
        }
        // An edit to the active snapshot, rather than navigation, has the same contract.
        frames.value = listOf(moved.copy(objects = moved.objects.map { it.copy(y = it.y + 0.01) }), moved)
        waitForIdle()
        runOnIdle {
            val next = paragraphs()
            next.indices.forEach { assertSame(first[it], next[it]) }
        }
    }

    @Test fun arrowMetadataRetainsPathsWhileGeometryChangesInvalidate() = runAndroidComposeUiTest<DiagramTestActivity> {
        val original = DiagramArrow(DiagramArrowKind.Dribble, listOf(DiagramPoint(2.0, 3.0), DiagramPoint(25.0, 5.0)))
        val arrows = mutableStateOf(listOf(original))
        val area = mutableStateOf(DiagramArea(40.0, 30.0))
        lateinit var cache: ArrowDrawingCache
        setContent { cache = rememberArrowDrawingCache(arrows.value, diagramGeometry(area.value)) }
        val firstCache = cache
        val first = cache.atScale(10f)
        for (edited in listOf(original.copy(label = "Pass"), original.copy(sequence = 7), original.copy(badge = DiagramPoint(4.0, 5.0)))) {
            arrows.value = listOf(edited)
            waitForIdle()
            runOnIdle {
                assertSame(firstCache, cache)
                assertSame(first, cache.atScale(10f), "Metadata must retain the prepared source and drawing list")
                assertSame(first.single().path, cache.atScale(10f).single().path)
            }
        }
        arrows.value = listOf(original.copy(points = listOf(DiagramPoint(3.0, 4.0), DiagramPoint(26.0, 6.0))))
        waitForIdle()
        assertNotSame(firstCache, cache)
        assertNotSame(first.single().path, cache.atScale(10f).single().path)
        val beforeKind = cache
        arrows.value = listOf(arrows.value.single().copy(kind = DiagramArrowKind.Run))
        waitForIdle()
        assertNotSame(beforeKind, cache)
        val beforePitch = cache
        area.value = DiagramArea(80.0, 60.0)
        waitForIdle()
        assertNotSame(beforePitch, cache)
        val scaled = cache.atScale(10f)
        assertNotSame(scaled.single().path, cache.atScale(20f).single().path)
    }

    @Test fun captionAndIdentityUpdatesDoNotReadPaintInputsAndTitlesStillUpdateSemantics() = runAndroidComposeUiTest<DiagramTestActivity> {
        val objects = ReadList(listOf(DiagramObject(DiagramObjectKind.Player, 5.0, 10.0, number = 7, label = "Player")))
        val original = DiagramFrame("f", "Setup", objects, emptyList())
        val shown = mutableStateOf(Diagram("Pass and move", DiagramArea(30.0, 20.0), listOf(original)))
        setContent { Box(Modifier.requiredWidth(320.dp)) { FootballDiagram(shown.value, 0) } }
        waitForIdle()
        assertTrue(objects.reads > 0, "The initial Canvas must consume the counted paint inputs")
        val baseline = pixels(onNodeWithContentDescription("Pass and move — Setup").captureToImage().asAndroidBitmap())
        val warmReads = objects.reads
        for (i in 1..4) {
            shown.value = shown.value.copy(frames = listOf(original.copy(id = "f-$i", caption = "Caption $i")))
            waitForIdle()
            assertEquals(warmReads, objects.reads, "Nonvisual metadata must not rerun label placement or Canvas traversal")
        }
        shown.value = shown.value.copy(title = "Renamed diagram", frames = listOf(original.copy(title = "Renamed frame")))
        waitForIdle()
        onNodeWithContentDescription("Renamed diagram — Renamed frame").assertExists()
        assertEquals(warmReads, objects.reads, "Accessibility-only changes must not traverse paint inputs")
        assertContentEquals(baseline, pixels(onNodeWithContentDescription("Renamed diagram — Renamed frame").captureToImage().asAndroidBitmap()))
        // A real visual edit must still replace labels and invalidate actual painting.
        shown.value = shown.value.copy(frames = listOf(original.copy(objects = listOf(objects[0].copy(x = 15.0)))))
        waitForIdle()
        assertFalse(baseline.contentEquals(pixels(onNodeWithContentDescription("Renamed diagram — Setup").captureToImage().asAndroidBitmap())))
    }

    @Test fun arrowPresentationAndVisualContentEditsStillPaintNewPixels() = runAndroidComposeUiTest<DiagramTestActivity> {
        val arrow = DiagramArrow(DiagramArrowKind.Dribble, listOf(DiagramPoint(3.0, 5.0), DiagramPoint(25.0, 20.0)), label = "Pass A", sequence = 1, badge = DiagramPoint(10.0, 10.0))
        val frame = DiagramFrame("f", "Setup", listOf(DiagramObject(DiagramObjectKind.Player, 5.0, 10.0, number = 7, label = "Sam")), listOf(arrow))
        val original = Diagram("Updates", DiagramArea(40.0, 30.0), listOf(frame))
        val shown = mutableStateOf(original)
        setContent { Box(Modifier.requiredWidth(600.dp)) { FootballDiagram(shown.value, 0) } }
        fun image() = pixels(onNodeWithContentDescription("Updates — Setup").captureToImage().asAndroidBitmap())
        val baseline = image()
        val changes = listOf(
            "arrow label" to frame.copy(arrows = listOf(arrow.copy(label = "Long pass"))),
            "sequence" to frame.copy(arrows = listOf(arrow.copy(sequence = 2))),
            "badge position" to frame.copy(arrows = listOf(arrow.copy(badge = DiagramPoint(18.0, 14.0)))),
            "points" to frame.copy(arrows = listOf(arrow.copy(points = listOf(DiagramPoint(5.0, 25.0), DiagramPoint(25.0, 5.0))))),
            "kind" to frame.copy(arrows = listOf(arrow.copy(kind = DiagramArrowKind.Run))),
            "object colour" to frame.copy(objects = listOf(frame.objects.single().copy(colour = DiagramColour.Red))),
            "ball flag" to frame.copy(objects = listOf(frame.objects.single().copy(hasBall = true))),
            "object text" to frame.copy(objects = listOf(frame.objects.single().copy(label = "Alex"))),
            "zone" to frame.copy(areas = listOf(DiagramSubArea("Zone", 15.0, 10.0, 8.0, 5.0))),
        )
        for ((name, edited) in changes) {
            shown.value = original.copy(frames = listOf(edited))
            waitForIdle()
            assertFalse(baseline.contentEquals(image()), "$name must still change actual Canvas pixels")
        }
        shown.value = original
        waitForIdle()
        assertContentEquals(baseline, image(), "Returning to an earlier frame must restore its text and geometry")
    }

    @Test fun formatVersionAloneInvalidatesEquipmentAndRestoresLegacyPixels() = runAndroidComposeUiTest<DiagramTestActivity> {
        val frame = DiagramFrame("f", "Setup", listOf(
            DiagramObject(DiagramObjectKind.MiniGoal, 10.0, 10.0, angleDegrees = 0.0, widthMetres = 4.0),
            DiagramObject(DiagramObjectKind.Gate, 20.0, 15.0, colour = DiagramColour.Yellow, widthMetres = 4.0),
        ), emptyList())
        val original = Diagram("Version", DiagramArea(30.0, 24.0), listOf(frame))
        val shown = mutableStateOf(original)
        setContent { Box(Modifier.requiredWidth(640.dp)) { FootballDiagram(shown.value, 0) } }
        fun image() = pixels(onNodeWithContentDescription("Version — Setup").captureToImage().asAndroidBitmap())
        val legacy = image()
        shown.value = original.copy(formatVersion = 2)
        waitForIdle()
        assertFalse(legacy.contentEquals(image()), "Changing only format version must repaint goal axes and gate widths")
        shown.value = original
        waitForIdle()
        assertContentEquals(legacy, image(), "Restoring format 1 must restore its exact equipment pixels")
    }

    private class ReadList<T>(private val values: List<T>) : AbstractList<T>() {
        var reads = 0
        override val size get() = values.size
        override fun get(index: Int): T { reads++; return values[index] }
    }

    private fun pixels(bitmap: android.graphics.Bitmap) = IntArray(bitmap.width * bitmap.height).also {
        bitmap.getPixels(it, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)
    }
}
