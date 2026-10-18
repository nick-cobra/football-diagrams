package io.github.footballdiagrams

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive

/** JSON Schema integers include equivalent number spellings such as 1.0 and 1e0. */
internal object SchemaIntegerSerializer : KSerializer<Int> {
    override val descriptor = PrimitiveSerialDescriptor("SchemaInteger", PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder): Int {
        if (decoder !is JsonDecoder) return decoder.decodeInt()
        val primitive = decoder.decodeJsonElement().jsonPrimitive
        val number = primitive.doubleOrNull
        if (primitive.isString || number == null || !number.isFinite() ||
            number < Int.MIN_VALUE || number > Int.MAX_VALUE || number % 1.0 != 0.0
        ) throw SerializationException("Expected a JSON integer")
        return number.toInt()
    }

    override fun serialize(encoder: Encoder, value: Int) = encoder.encodeInt(value)
}
