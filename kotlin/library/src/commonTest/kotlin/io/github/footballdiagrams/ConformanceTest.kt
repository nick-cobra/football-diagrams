package io.github.footballdiagrams

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails
import kotlin.test.assertTrue
import kotlin.test.fail
import kotlinx.serialization.json.*

class ConformanceTest {
    @Test
    fun sharedFixturesFollowTheCanonicalSchema() {
        assertTrue(conformanceFixtures.size >= 15)
        for (fixture in conformanceFixtures) {
            if (fixture.valid) {
                val diagram = try { Diagrams.parse(fixture.json) } catch (error: Exception) {
                    fail("${fixture.name}: ${error.message}")
                }
                assertEquals(Json.parseToJsonElement(fixture.json).jsonObject.getValue("format_version").jsonPrimitive.double.toInt(), diagram.formatVersion, fixture.name)
                val encoded = Diagrams.stringify(diagram)
                assertEquals(diagram, Diagrams.parse(encoded), fixture.name)
                assertAuthoredValues(Json.parseToJsonElement(fixture.json), Json.parseToJsonElement(encoded), fixture.name)
            } else {
                assertFails(fixture.name) { Diagrams.parse(fixture.json) }
            }
        }
    }

    private fun assertAuthoredValues(before: JsonElement, after: JsonElement, path: String) {
        when (before) {
            is JsonObject -> before.filterValues { it != JsonNull }.forEach { (key, value) ->
                assertAuthoredValues(value, after.jsonObject[key] ?: fail("$path/$key was lost"), "$path/$key")
            }
            is JsonArray -> {
                assertEquals(before.size, after.jsonArray.size, path)
                before.forEachIndexed { index, value -> assertAuthoredValues(value, after.jsonArray[index], "$path/$index") }
            }
            is JsonPrimitive -> if (!before.isString && before.doubleOrNull != null) {
                assertEquals(before.double, after.jsonPrimitive.double, path)
            } else assertEquals(before, after, path)
        }
    }

    @Test
    fun omittedOptionalFieldsUseDocumentedDefaults() {
        val diagram = Diagrams.parse("""{"format_version":1,"title":"Defaults","area":{"shape":"rectangle","length_m":30,"width_m":20},"frames":[{"id":"f","title":"Frame","objects":[{"kind":"player","x":0,"y":0}],"arrows":[]}]}""")
        assertEquals("", diagram.frames.single().caption)
        assertEquals(emptyList(), diagram.frames.single().areas)
        assertEquals(false, diagram.frames.single().objects.single().hasBall)
        assertEquals(null, diagram.frames.single().objects.single().label)
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
