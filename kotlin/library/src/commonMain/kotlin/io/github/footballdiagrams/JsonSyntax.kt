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
    if (source.length > 8 * 1024 * 1024) throw SerializationException("Diagram JSON exceeds 8 Mi UTF-16 code units")
    val stack = CharArray(32)
    var depth = 0
    var tokens = 0
    fun token() {
        if (++tokens > 262_144) throw SerializationException("Diagram JSON exceeds 262144 tokens")
    }
    var index = 0
    fun invalid(offset: Int): Nothing = throw SerializationException("Invalid JSON token at offset $offset")
    while (index < source.length) {
        when {
            source[index] == '{' || source[index] == '[' -> {
                token()
                if (depth == stack.size) throw SerializationException("Diagram JSON exceeds 32 container levels")
                stack[depth++] = source[index++]
            }
            source[index] == '}' || source[index] == ']' -> {
                val wanted = if (source[index] == '}') '{' else '['
                if (depth == 0 || stack[--depth] != wanted) invalid(index)
                index++
            }
            source[index].isJsonDelimiter() -> index++
            source[index] == '"' -> {
                token()
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
                token()
                val start = index
                while (index < source.length && !source[index].isJsonDelimiter()) index++
                val token = source.substring(start, index)
                if (token != "true" && token != "false" && token != "null" && !jsonNumber.matches(token)) invalid(start)
            }
        }
    }
    if (depth != 0) invalid(source.length)
}
