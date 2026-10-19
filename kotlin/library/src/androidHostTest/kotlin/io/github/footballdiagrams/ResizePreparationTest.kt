package io.github.footballdiagrams

import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.v2.runAndroidComposeUiTest
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
class ResizePreparationTest {
    @Test fun paintPropertiesRetainPlacedLabelsWhileRealLabelInputsInvalidate() = runAndroidComposeUiTest<DiagramTestActivity> {
        val area = DiagramArea(40.0, 30.0)
        val g = diagramGeometry(area)
        val arrow = DiagramArrow(DiagramArrowKind.Pass, listOf(DiagramPoint(5.0, 8.0), DiagramPoint(25.0, 18.0)), sequence = 1, label = "Pass")
        val player = DiagramObject(DiagramObjectKind.Player, 5.0, 8.0, number = 7, label = "Sam")
        val zone = DiagramSubArea("Zone", 12.0, 8.0, 5.0, 4.0)
        val original = DiagramFrame("f", "Frame", listOf(player), listOf(arrow), listOf(zone))
        val frame = mutableStateOf(original)
        var labels = emptyList<DiagramLabel>()
        setContent { labels = rememberDiagramLabels(area, frame.value, g) }
        val first = labels
        for (paintOnly in listOf(
            original.copy(objects = listOf(player.copy(colour = DiagramColour.Red))),
            original.copy(objects = listOf(player.copy(hasBall = true))),
            original.copy(objects = listOf(player.copy(angleDegrees = 45.0, widthMetres = 3.0))),
            original.copy(areas = listOf(zone.copy(colour = DiagramColour.Blue, width = 9.0, height = 7.0))),
            original.copy(arrows = listOf(arrow.copy(kind = DiagramArrowKind.Run))),
        )) {
            frame.value = paintOnly
            waitForIdle()
            assertSame(first, labels, "Paint-only properties must reuse collision placement")
            assertEquals(layoutDiagramLabels(area, paintOnly, g), labels)
        }
        for (changed in listOf(
            original.copy(objects = listOf(player.copy(x = 10.0))),
            original.copy(objects = listOf(player.copy(number = 8))),
            original.copy(objects = listOf(player.copy(label = "Alex"))),
            original.copy(objects = listOf(player.copy(kind = DiagramObjectKind.Goal))),
            original.copy(arrows = listOf(arrow.copy(sequence = 2))),
            original.copy(arrows = listOf(arrow.copy(badge = DiagramPoint(15.0, 12.0)))),
            original.copy(arrows = listOf(arrow.copy(points = listOf(DiagramPoint(2.0, 3.0), DiagramPoint(20.0, 15.0))))),
            original.copy(areas = listOf(zone.copy(x = 20.0, label = "Other zone"))),
        )) {
            frame.value = changed
            waitForIdle()
            assertNotSame(first, labels)
            assertEquals(layoutDiagramLabels(area, changed, g), labels)
        }
    }

    @Test fun scaleOnlyResizeDoesNotWalkAuthoredPointsAgain() {
        var reads = 0
        val points = (0..11).map { DiagramPoint(2.0 + it * 2.0, 3.0 + it % 3 * 4.0) }
        val counted = object : AbstractList<DiagramPoint>() {
            override val size get() = points.size
            override fun get(index: Int): DiagramPoint { reads++; return points[index] }
        }
        val cache = ArrowDrawingCache(listOf(DiagramArrow(DiagramArrowKind.Run, counted)), diagramGeometry(DiagramArea(40.0, 30.0)))
        val first = cache.atScale(10f)
        val initialReads = reads
        assertTrue(initialReads > 0)
        val resized = cache.atScale(11f)
        assertNotSame(first.single().path, resized.single().path)
        assertEquals(initialReads, reads, "Scale-only changes must use native Path operations, not a Kotlin point walk")
        assertEquals(first.single().stroke.width * 1.1f, resized.single().stroke.width, 0.00001f)
    }
}
