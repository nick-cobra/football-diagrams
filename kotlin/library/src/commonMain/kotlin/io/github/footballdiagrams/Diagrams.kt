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
        requireJsonTokens(json)
        val element = codec.parseToJsonElement(json)
        validate(element)
        return codec.decodeFromJsonElement(element)
    }

    fun stringify(diagram: Diagram): String {
        val element = codec.encodeToJsonElement(diagram)
        validate(element)
        return element.toString().escapeUnpairedSurrogates()
    }

    @OptIn(io.github.optimumcode.json.schema.ExperimentalApi::class)
    private fun validate(element: JsonElement) {
        require(schema.validate(element.schemaElement()) { }) { "Invalid Football Diagrams document" }
    }
}

/** Preserve accepted UTF-16 code units when the JSON String is stored as UTF-8. */
private fun String.escapeUnpairedSurrogates(): String = buildString(length) {
    var index = 0
    while (index < this@escapeUnpairedSurrogates.length) {
        val character = this@escapeUnpairedSurrogates[index++]
        if (character in '\uD800'..'\uDBFF' && index < this@escapeUnpairedSurrogates.length &&
            this@escapeUnpairedSurrogates[index] in '\uDC00'..'\uDFFF'
        ) {
            append(character)
            append(this@escapeUnpairedSurrogates[index++])
        } else if (character in '\uD800'..'\uDFFF') {
            append("\\u")
            append(character.code.toString(16).padStart(4, '0'))
        } else {
            append(character)
        }
    }
}
