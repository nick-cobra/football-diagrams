package io.github.footballdiagrams

import kotlinx.serialization.SerializationException

private val jsonNumber = Regex("-?(0|[1-9][0-9]*)(\\.[0-9]+)?([eE][+-]?[0-9]+)?")

private fun Char.isJsonWhitespace() = this == ' ' || this == '\t' || this == '\n' || this == '\r'
private fun Char.isJsonDelimiter() = isJsonWhitespace() || this in "{}[]:,"

/**
 * kotlinx.serialization checks structure, but its element reader also accepts
 * non-JSON number spellings and raw string controls. Check tokens before that
 * reader discards the original spelling. Number precision stays binary64.
 */
internal fun requireJsonTokens(source: String) {
    var index = 0
    fun invalid(offset: Int): Nothing = throw SerializationException("Invalid JSON token at offset $offset")
    while (index < source.length) {
        when {
            source[index].isJsonDelimiter() -> index++
            source[index] == '"' -> {
                val start = index++
                var closed = false
                while (index < source.length) {
                    val character = source[index++]
                    if (character == '"') {
                        closed = true
                        break
                    }
                    if (character < ' ') invalid(index - 1)
                    if (character != '\\') continue
                    if (index == source.length) invalid(start)
                    when (source[index++]) {
                        '"', '\\', '/', 'b', 'f', 'n', 'r', 't' -> Unit
                        'u' -> repeat(4) {
                            if (index == source.length || source[index] !in "0123456789abcdefABCDEF") invalid(index)
                            index++
                        }
                        else -> invalid(index - 1)
                    }
                }
                if (!closed) invalid(start)
            }
            else -> {
                val start = index
                while (index < source.length && !source[index].isJsonDelimiter()) index++
                val token = source.substring(start, index)
                if (token != "true" && token != "false" && token != "null" && !jsonNumber.matches(token)) invalid(start)
            }
        }
    }
}
