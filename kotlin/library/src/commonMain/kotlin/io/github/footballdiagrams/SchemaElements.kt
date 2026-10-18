@file:OptIn(io.github.optimumcode.json.schema.ExperimentalApi::class)

package io.github.footballdiagrams

import io.github.optimumcode.json.schema.model.AbstractElement
import io.github.optimumcode.json.schema.model.ArrayElement
import io.github.optimumcode.json.schema.model.ObjectElement
import io.github.optimumcode.json.schema.model.PrimitiveElement
import kotlinx.serialization.json.*

/**
 * Keep the validator's integer fast path lexical: kotlinx.serialization's
 * longOrNull can coerce a nonzero exponent such as 5e-324 to Long zero.
 * Scientific/fractional numbers instead use binary64, as in JavaScript.
 * The schema and decoded/encoded JSON are never rewritten by this adapter.
 */
internal fun JsonElement.schemaElement(): AbstractElement = when (this) {
    is JsonObject -> SchemaObject(this)
    is JsonArray -> SchemaArray(this)
    is JsonPrimitive -> SchemaPrimitive(this)
}

private class SchemaObject(private val json: JsonObject) : ObjectElement {
    override val keys get() = json.keys
    override val size get() = json.size
    override fun contains(key: String) = key in json
    override fun get(key: String) = json[key]?.schemaElement()
    override fun iterator() = json.entries.map { it.key to it.value.schemaElement() }.iterator()
    override fun toString() = json.toString()
}

private class SchemaArray(private val json: JsonArray) : ArrayElement {
    override val size get() = json.size
    override fun get(index: Int) = json[index].schemaElement()
    override fun iterator() = json.map { it.schemaElement() }.iterator()
    override fun toString() = json.toString()
}

private class SchemaPrimitive(private val json: JsonPrimitive) : PrimitiveElement {
    override val content get() = json.content
    override val isString get() = json.isString
    override val isNull get() = json is JsonNull
    override val isBoolean get() = !isString && json.booleanOrNull != null
    override val longOrNull get() = if (isString) null else content.toLongOrNull()
    override val doubleOrNull get() = if (isString) null else json.doubleOrNull?.takeIf { it.isFinite() }
    override val isNumber get() = !isString && doubleOrNull != null
    override fun toString() = json.toString()
}
