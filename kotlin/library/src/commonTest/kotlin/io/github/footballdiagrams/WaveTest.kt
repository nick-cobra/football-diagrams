package io.github.footballdiagrams

import kotlin.math.abs
import kotlin.test.*

class WaveTest {
    @Test
    fun invalidAndExcessiveRequestsRejectBeforeUnboundedAllocation() {
        // Empty input keeps these parameter regressions safe even if the guard
        // is removed: the old implementation returns rather than allocating.
        for (wavelength in listOf(0f, -1f, Float.NaN, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY)) {
            assertFailsWith<IllegalArgumentException> { wavyPoints(emptyList(), 0.3f, wavelength) }
        }
        for (amplitude in listOf(Float.NaN, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY)) {
            assertFailsWith<IllegalArgumentException> { wavyPoints(emptyList(), amplitude, 2.3f) }
        }
        // Exercise extreme arithmetic without ever entering a sampling loop.
        assertFailsWith<IllegalArgumentException> { waveStepCount(1f, Float.MIN_VALUE, 0) }
        assertFailsWith<IllegalArgumentException> {
            wavyPoints(listOf(DiagramPoint(0.0, 0.0), DiagramPoint(Double.MAX_VALUE, 0.0)), 0.3f, 2.3f)
        }
        assertFailsWith<IllegalArgumentException> {
            wavyPoints(listOf(DiagramPoint(2e38, 0.0), DiagramPoint(2e38, 1.0)), -3e38f, 2.3f)
        }
        val points = listOf(DiagramPoint(0.0, 0.0), DiagramPoint(1.0, 0.0))
        assertFailsWith<IllegalArgumentException> { wavyPoints(points, 0.3f, 0.00005f) }
        val many = List(11_000) { DiagramPoint((it % 2).toDouble(), 0.0) }
        assertFailsWith<IllegalArgumentException> { wavyPoints(many, 0.3f, 2.3f) }
    }

    @Test
    fun maximumFormatOneArrowFitsTheBudget() {
        val points = List(12) { DiagramPoint(if (it % 2 == 0) -1000.0 else 1000.0, if (it % 2 == 0) -1000.0 else 1000.0) }
        val arrow = DiagramArrow(DiagramArrowKind.Dribble, points)
        val actual = arrowPathPoints(arrow, diagramGeometry(DiagramArea(1e-50, 20.0)))
        assertTrue(actual.size in 1..100_000)
        assertTrue(actual.all { it.x.isFinite() && it.y.isFinite() })
        for ((a, b) in listOf(points.first() to actual.first(), points.last() to actual.last())) {
            assertTrue(abs(a.x - b.x) < 0.001 && abs(a.y - b.y) < 0.001)
        }
        assertEquals(11, wavyPoints(listOf(DiagramPoint(0.0, 0.0), DiagramPoint(1.0, 0.0)), 0f, 1e30f).size)
    }
}
