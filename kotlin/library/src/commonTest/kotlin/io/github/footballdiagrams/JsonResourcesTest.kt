package io.github.footballdiagrams

import kotlinx.serialization.SerializationException
import kotlin.test.*

class JsonResourcesTest {
    private val small = """{"format_version":1,"title":"Limits","area":{"shape":"rectangle","length_m":1,"width_m":1},"frames":[]}"""

    @Test fun deepAndWideInputsRejectBeforeTreeParsing() {
        val deep = "[".repeat(32_768) + "0" + "]".repeat(32_768)
        // This first assertion also makes the RED safe: the previous preflight
        // returns, so the old recursive native reader is never entered.
        assertFailsWith<SerializationException> { requireJsonTokens(deep) }
        assertFailsWith<SerializationException> { Diagrams.parse(deep) }
        val wide = "[" + "0,".repeat(262_144) + "0]"
        assertFailsWith<SerializationException> { requireJsonTokens(wide) }
        assertFailsWith<SerializationException> { Diagrams.parse(wide) }
        assertFailsWith<SerializationException> { Diagrams.parse(small + " ".repeat(8 * 1024 * 1024)) }
    }

    @Test fun limitsIgnoreQuotedBracketsAndPreserveSyntaxAndNumbers() {
        requireJsonTokens("[".repeat(32) + "0" + "]".repeat(32))
        assertFailsWith<SerializationException> { requireJsonTokens("[".repeat(33)) }
        for (text in listOf("[{}]".repeat(20), "\\\"[{}]", "\uD800", "\u0000")) {
            val doc = Diagram(text, DiagramArea(1.0, 1.0, text), emptyList())
            assertEquals(doc, Diagrams.parse(Diagrams.stringify(doc)))
        }
        for (bad in listOf("{]", "[}", "]", "{", "\"truncated\\", "[true false]", "{\"x\":+1}")) {
            assertFails { Diagrams.parse(bad) }
        }
        val number = "1." + "0".repeat(65_536)
        assertEquals(1.0, Diagrams.parse(small.replace("\"length_m\":1", "\"length_m\":$number")).area.lengthMetres)
        assertEquals(1.0, Diagrams.parse(small.padEnd(8 * 1024 * 1024, ' ')).area.lengthMetres)
    }

    @Test fun fullyPopulatedMaximumCanonicalDocumentFitsTheEnvelope() {
        val text = "\u0000"
        val n = -0.0000010000000000000002
        val point = DiagramPoint(n, n)
        val obj = DiagramObject(DiagramObjectKind.FlatMarker, n, n, DiagramColour.Orange,
            text.repeat(120), text.repeat(3), 99, n, -n, true)
        val arrow = DiagramArrow(DiagramArrowKind.Dribble, List(12) { point }, text.repeat(120), 20, point)
        val zone = DiagramSubArea(text.repeat(120), n, n, -n, -n, text.repeat(80), DiagramColour.Orange)
        val frame = DiagramFrame(text.repeat(80), text.repeat(160), List(60) { obj }, List(30) { arrow }, List(12) { zone }, text.repeat(400))
        val doc = Diagram(text.repeat(160), DiagramArea(-n, -n, text.repeat(120)), List(64) { frame })
        val encoded = Diagrams.stringify(doc)
        assertTrue(encoded.length < 8 * 1024 * 1024)
        assertEquals(64, Diagrams.parse(encoded).frames.size)
    }
}
