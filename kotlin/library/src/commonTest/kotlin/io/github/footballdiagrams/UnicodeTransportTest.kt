package io.github.footballdiagrams

import kotlin.test.Test
import kotlin.test.assertEquals

class UnicodeTransportTest {
    @Test
    fun sharedDocumentsSurviveStrictUtf8Transport() {
        for (fixture in conformanceFixtures.filter { it.valid }) {
            val diagram = Diagrams.parse(fixture.json)
            val wire = Diagrams.stringify(diagram)
                .encodeToByteArray(throwOnInvalidSequence = true)
                .decodeToString(throwOnInvalidSequence = true)
            assertEquals(diagram, Diagrams.parse(wire), fixture.name)
        }
    }

    @Test
    fun isolatedSurrogatesPairsAndLiteralEscapesKeepTheirCodeUnits() {
        val base = Diagrams.parse(conformanceFixtures.first { it.valid }.json)
        val strings = listOf(
            "\uD800", "\uDBFF", "\uDC00", "\uDFFF",
            "\uD800\uD800", "\uDC00\uD800", "\uD800a\uDC00",
            "\uD800\uDC00", "\uDBFF\uDFFF", "\uD800\uDC00\uD800",
            "\uDC00\uD800\uDC00", "\\ud800", "😀", "Plain text",
        )
        for (text in strings) {
            val diagram = base.copy(title = text)
            val encoded = Diagrams.stringify(diagram)
            val wire = encoded.encodeToByteArray(throwOnInvalidSequence = true)
                .decodeToString(throwOnInvalidSequence = true)
            assertEquals(text, Diagrams.parse(wire).title, text.toCharArray().map { it.code }.toString())
        }
    }
}
