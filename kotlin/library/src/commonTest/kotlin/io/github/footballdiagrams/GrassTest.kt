package io.github.footballdiagrams

import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class GrassTest {
    @Test
    fun smallAndOrdinaryPitchesHaveFiniteBoundedGrass() {
        for (length in listOf(Float.MIN_VALUE, 1e-30f, 1e-7f, 0.01f, 30f, 120f)) {
            val geometry = diagramGeometry(DiagramArea(length, 20f))
            val stripes = grassStripes(geometry)
            assertTrue(stripes.size in 1..256, "$length: stripe count")
            assertEquals(-geometry.marginMetres, stripes.first().x)
            var edge = -geometry.marginMetres
            for (stripe in stripes) {
                assertTrue(stripe.x.isFinite() && stripe.width.isFinite() && stripe.width > 0)
                assertTrue(abs(stripe.x - edge) < 0.0001f)
                edge = stripe.x + stripe.width
            }
            assertTrue(abs(edge - (length + geometry.marginMetres)) < 0.0001f)
        }
    }

    @Test
    fun ordinaryGrassKeepsItsPositionsAndColours() {
        val stripes = grassStripes(diagramGeometry(DiagramArea(30f, 20f)))
        assertEquals(8, stripes.size)
        stripes.forEachIndexed { index, stripe ->
            assertEquals(-2.8f + index * 5f, stripe.x)
            assertTrue(abs(stripe.width - if (index == 7) 0.6f else 5f) < 0.0001f)
            assertEquals(index % 2 == 1, stripe.light)
        }
    }
}
