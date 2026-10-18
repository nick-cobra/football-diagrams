package io.github.footballdiagrams

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails
import kotlin.test.assertTrue

class ConformanceTest {
    @Test
    fun sharedFixturesFollowTheCanonicalSchema() {
        assertTrue(conformanceFixtures.size >= 15)
        for (fixture in conformanceFixtures) {
            if (fixture.valid) {
                val diagram = Diagrams.parse(fixture.json)
                assertEquals(1, diagram.formatVersion, fixture.name)
                assertEquals(diagram, Diagrams.parse(Diagrams.stringify(diagram)), fixture.name)
            } else {
                assertFails(fixture.name) { Diagrams.parse(fixture.json) }
            }
        }
    }

    @Test
    fun rectangularGeometryPreservesAuthoredDimensions() {
        val geometry = diagramGeometry(DiagramArea(40f, 20f))
        assertEquals(40f, geometry.lengthMetres)
        assertEquals(20f, geometry.widthMetres)
        assertTrue(geometry.viewportWidth / geometry.viewportHeight > 1.7f)
        val square = diagramGeometry(DiagramArea(20f, 20f))
        assertEquals(1f, square.viewportWidth / square.viewportHeight)
    }

    @Test
    fun dribbleEndpointsAndRunNotationRetainTheirMeaning() {
        val points = listOf(DiagramPoint(0f, 0f), DiagramPoint(10f, 0f))
        val waved = wavyPoints(points, 0.3f, 2.3f)
        assertEquals(points.first(), waved.first())
        assertEquals(points.last(), waved.last())
        assertTrue(waved.any { it.y != 0.0 })
        val geometry = diagramGeometry(DiagramArea(30f, 20f))
        assertTrue(arrowDashIntervals(DiagramArrowKind.Run, geometry) != null)
        assertEquals(null, arrowDashIntervals(DiagramArrowKind.Pass, geometry))
        assertTrue(arrowStrokeWidth(DiagramArrowKind.Shot, geometry) > arrowStrokeWidth(DiagramArrowKind.Pass, geometry))
    }
}
