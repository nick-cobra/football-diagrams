package io.github.footballdiagrams

import kotlin.math.max
import kotlin.math.min
import kotlin.test.*

class VisibleWaveTest {
    private fun visibleEdges(points: List<DiagramPoint>, g: DiagramGeometry): List<Pair<DiagramPoint, DiagramPoint>> {
        val left = -g.marginMetres - g.unit
        val top = left
        val right = g.lengthMetres + g.marginMetres + g.unit
        val bottom = g.widthMetres + g.marginMetres + g.unit
        return points.zipWithNext().filter { (a, b) ->
            val dx = b.x - a.x
            val dy = b.y - a.y
            var low = 0.0
            var high = 1.0
            fun clip(p: Double, q: Double): Boolean {
                if (p == 0.0) return q >= 0.0
                val t = q / p
                if (p < 0) low = max(low, t) else high = min(high, t)
                return low <= high
            }
            (dx != 0.0 || dy != 0.0) && clip(-dx, a.x - left) && clip(dx, right - a.x) &&
                clip(-dy, a.y - top) && clip(dy, bottom - a.y)
        }
    }

    @Test fun renderingRetainsVisibleSamplesPhaseJoinsAndEndpointDirection() {
        val paths = listOf(
            listOf(DiagramPoint(-1000.0, -1000.0), DiagramPoint(1000.0, 1000.0)),
            listOf(DiagramPoint(-1000.0, 2.0), DiagramPoint(1000.0, 2.0), DiagramPoint(1000.0, 2.0), DiagramPoint(2.0, -1000.0), DiagramPoint(2.0, 1000.0)),
            listOf(DiagramPoint(-1000.0, -20.0), DiagramPoint(1000.0, -20.0)),
            listOf(DiagramPoint(1.0, 1.0), DiagramPoint(1.0, 1.0), DiagramPoint(1000.0, 3.0), DiagramPoint(1.0, 1.0), DiagramPoint(1.0, 1.0)),
            listOf(DiagramPoint(-1000.0, -1000.0), DiagramPoint(1000.0, -1000.0), DiagramPoint(0.0, 0.0), DiagramPoint(0.0, 0.0)),
        )
        for (area in listOf(DiagramArea(1.0, 1.0), DiagramArea(1e-50, 90.0), DiagramArea(120.0, 90.0))) {
            val g = diagramGeometry(area)
            for (points in paths) {
                val arrow = DiagramArrow(DiagramArrowKind.Dribble, points)
                val full = arrowPathPoints(arrow, g)
                val bounded = renderArrowPathPoints(arrow, g)
                assertEquals(visibleEdges(full, g), visibleEdges(bounded, g), "$area / $points")
                assertEquals(full.take(2), bounded.take(2))
                assertEquals(full.takeLast(2), bounded.takeLast(2))
                assertEquals(arrowHeadAngle(full), arrowHeadAngle(bounded))
            }
        }
    }

    @Test fun ordinaryDrawingAndThePublicHelperAreUnchangedWhileFrameWorkIsBounded() {
        val ordinary = Diagrams.parse(conformanceFixtures.single { it.name == "valid/all-kinds.json" }.json)
        val g = diagramGeometry(ordinary.area)
        for (arrow in ordinary.frames.first().arrows) assertEquals(arrowPathPoints(arrow, g), renderArrowPathPoints(arrow, g))
        val tiny = diagramGeometry(DiagramArea(1.0, 1.0))
        val extreme = DiagramArrow(DiagramArrowKind.Dribble, List(12) {
            val coordinate = if (it % 2 == 0) -1000.0 else 1000.0
            DiagramPoint(coordinate, coordinate)
        })
        assertTrue(arrowPathPoints(extreme, tiny).size > 80_000)
        assertTrue(List(30) { renderArrowPathPoints(extreme, tiny) }.sumOf { it.size } < 25_000)
        assertEquals(emptyList(), renderArrowPathPoints(DiagramArrow(DiagramArrowKind.Dribble,
            listOf(DiagramPoint(1.0, 1.0), DiagramPoint(1.0, 1.0))), tiny))
    }
}
