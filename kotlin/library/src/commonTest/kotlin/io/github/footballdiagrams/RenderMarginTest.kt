package io.github.footballdiagrams

import kotlin.test.*

class RenderMarginTest {
    @Test fun explicitMarginPreservesPitchAndGlyphDimensions() {
        val area = DiagramArea(40.0, 30.0)
        val original = diagramGeometry(area)
        val expanded = diagramGeometry(area, 12f)
        assertEquals(12f, expanded.marginMetres)
        assertEquals(64f, expanded.viewportWidth)
        assertEquals(54f, expanded.viewportHeight)
        assertEquals(original.copy(marginMetres = 12f), expanded)
        assertEquals(original, diagramGeometry(area, 0f))
        assertEquals(original, diagramGeometry(area, 1f))
    }
    @Test fun invalidMarginsRejectBeforeDrawing() {
        for (margin in listOf(-1f, Float.NaN, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY, 120.001f)) {
            assertFailsWith<IllegalArgumentException> { diagramGeometry(DiagramArea(40.0, 30.0), margin) }
        }
    }
    @Test fun maximumMarginRetainsFiniteBoundedGrassForPitchExtremes() {
        for ((length, width) in listOf(1e-50 to 1e-50, 120.0 to 90.0, 1e-50 to 90.0, 120.0 to 1e-50)) {
            val geometry = diagramGeometry(DiagramArea(length, width), 120f)
            assertEquals(120f, geometry.marginMetres)
            assertTrue(grassStripes(geometry).size in 1..256)
            assertTrue(grassStripes(geometry).all { it.x.isFinite() && it.width.isFinite() && it.width > 0f })
        }
    }
}
