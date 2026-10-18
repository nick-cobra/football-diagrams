package io.github.footballdiagrams

import kotlinx.serialization.json.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class NumericRoundTripTest {
    @Test
    fun parsingPreservesEveryAuthoredNumericField() {
        for (fixture in conformanceFixtures.filter { it.valid && it.name.contains("numeric-") }) {
            val diagram = Diagrams.parse(fixture.json)
            assertTrue(diagram.area.lengthMetres > 0, fixture.name)
            assertTrue(diagram.area.widthMetres > 0, fixture.name)
            compareNumbers(Json.parseToJsonElement(fixture.json), Json.parseToJsonElement(Diagrams.stringify(diagram)), fixture.name)
        }
    }

    private fun compareNumbers(before: JsonElement, after: JsonElement, path: String) {
        when (before) {
            is JsonObject -> before.forEach { (key, value) -> compareNumbers(value, after.jsonObject.getValue(key), "$path/$key") }
            is JsonArray -> before.forEachIndexed { index, value -> compareNumbers(value, after.jsonArray[index], "$path/$index") }
            is JsonPrimitive -> if (!before.isString && before.doubleOrNull != null) {
                assertEquals(before.double, after.jsonPrimitive.double, path)
            }
        }
    }
}
