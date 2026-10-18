package io.github.footballdiagrams

import io.github.optimumcode.json.schema.JsonSchema
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement

/** Both language implementations validate the same upstream JSON Schema. */
object Diagrams {
    private val codec = Json { encodeDefaults = true; explicitNulls = false }
    private val schema by lazy { JsonSchema.fromDefinition(schemaDefinition) }

    fun parse(json: String): Diagram {
        val element = codec.parseToJsonElement(json)
        validate(element)
        return codec.decodeFromJsonElement(element)
    }

    fun stringify(diagram: Diagram): String {
        val element = codec.encodeToJsonElement(diagram)
        validate(element)
        return element.toString()
    }

    private fun validate(element: JsonElement) {
        require(schema.validate(element) { }) { "Invalid Football Diagrams document" }
    }
}
