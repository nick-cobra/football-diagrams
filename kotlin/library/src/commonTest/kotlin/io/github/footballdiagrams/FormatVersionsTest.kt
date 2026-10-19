package io.github.footballdiagrams

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails

class FormatVersionsTest {
    private fun document(version: String) = """{
        "format_version":$version,"title":"Equipment",
        "area":{"shape":"rectangle","length_m":40,"width_m":30},
        "frames":[{"id":"a","title":"Setup","objects":[
          {"kind":"mini_goal","x":9,"y":0,"angle":0,"width":1.5},
          {"kind":"gate","x":12,"y":16,"angle":90,"width":4}
        ],"arrows":[]}]
    }"""

    @Test
    fun bothVersionsRetainTheirSelectedVersionAndEquipmentValues() {
        for (version in 1..2) {
            val diagram = Diagrams.parse(document(version.toString()))
            assertEquals(version, diagram.formatVersion)
            assertEquals(0.0, diagram.frames.single().objects[0].angleDegrees)
            assertEquals(4.0, diagram.frames.single().objects[1].widthMetres)
            assertEquals(diagram, Diagrams.parse(Diagrams.stringify(diagram)))
        }
    }

    @Test
    fun versionTwoRetainsMathematicallyEquivalentIntegerSpellings() {
        for (spelling in listOf("2", "2.0", "2e0")) {
            assertEquals(2, Diagrams.parse(document(spelling)).formatVersion)
        }
    }

    @Test
    fun versionTwoRetainsEveryApplicableLegacyBoundary() {
        for (fixture in conformanceFixtures) {
            val decoded = runCatching { requireJsonTokens(fixture.json); Json.parseToJsonElement(fixture.json) }
            if (!fixture.valid && decoded.isFailure) continue
            val value = decoded.getOrThrow() as? JsonObject ?: continue
            if (value["format_version"] != JsonPrimitive(1)) continue
            val encoded = JsonObject(value + ("format_version" to JsonPrimitive(2))).toString()
            if (fixture.valid) assertEquals(2, Diagrams.parse(encoded).formatVersion, fixture.name)
            else assertFails(fixture.name) { Diagrams.parse(encoded) }
        }
    }

    @Test
    fun unknownAndNonIntegerVersionsReject() {
        for (spelling in listOf("0", "3", "2.1", "\"2\"", "null")) {
            assertFails { Diagrams.parse(document(spelling)) }
        }
    }
}
