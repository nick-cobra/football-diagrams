package io.github.footballdiagrams

import kotlinx.serialization.json.*
import kotlin.math.abs
import kotlin.test.*

class GeometryVectorsTest {
    private val vectors = Json.parseToJsonElement(geometryVectorsJson).jsonObject
    private fun near(actual: Float, expected: Double, message: String) {
        assertTrue(actual.isFinite() && abs(actual.toDouble() - expected) <= 0.0001, "$message: $actual != $expected")
    }
    private fun array(element: JsonElement) = element.jsonArray.map { it.jsonPrimitive.double }

    @Test
    fun sharedFrameScaleAspectAndBoundaryVectors() {
        for (case in vectors.getValue("frames").jsonArray) {
            val area = Json.decodeFromJsonElement<DiagramArea>(case.jsonObject.getValue("area"))
            val g = diagramGeometry(area)
            val actual = listOf(g.lengthMetres, g.widthMetres, g.marginMetres, g.playerRadius, g.unit, g.viewportWidth, g.viewportHeight, g.stripeWidth)
            array(case.jsonObject.getValue("expected")).forEachIndexed { index, expected -> near(actual[index], expected, "$area/$index") }
            assertTrue(grassStripes(g).size <= 256)
            near(g.pixelsPerMetre(600f, 300f), minOf(600.0 / g.viewportWidth, 300.0 / g.viewportHeight), "scale")
        }
    }

    @Test
    fun sharedLabelsIncludeOverridesCollisionAndOffPitchPositions() {
        val v = vectors.getValue("labels").jsonObject
        val diagram = Diagrams.parse(v.getValue("diagram").toString())
        val labels = layoutDiagramLabels(diagram.area, diagram.frames.first(), diagramGeometry(diagram.area))
        assertEquals(v.getValue("expected").jsonArray.size, labels.size)
        for (row in v.getValue("expected").jsonArray) {
            val id = row.jsonArray.first().jsonPrimitive.content
            val label = labels.single { it.id == id }
            val actual = listOf(label.x, label.y, label.width, label.height, label.fontSize)
            row.jsonArray.drop(1).forEachIndexed { index, expected -> near(actual[index], expected.jsonPrimitive.double, "$id/$index") }
        }
    }

    @Test
    fun shortLabelsOnlyDeduplicateAnIdenticalVisibleBadge() {
        val area = DiagramArea(20.0, 20.0)
        for (probe in vectors.getValue("objectLabels").jsonArray) {
            val row = probe.jsonObject
            val target = Json.decodeFromJsonElement<DiagramObject>(row.getValue("object"))
            val frame = DiagramFrame("label", "Label", listOf(target), emptyList())
            val labels = layoutDiagramLabels(area, frame, diagramGeometry(area))
            val pills = labels.filter { it.kind == DiagramLabelKind.ObjectLabel }
            assertEquals(row.getValue("fullPills").jsonArray.map { it.jsonPrimitive.content }, pills.map { it.text }, "$target")
            assertEquals(row.getValue("fullBadges").jsonArray.map { it.jsonPrimitive.content }, labels.filter { it.isBadge }.map { it.text }, "$target")
            for (pill in pills) {
                near(pill.width, pill.text.length * 0.364 + 0.975, "short pill width")
                near(pill.height, 1.0075, "short pill height")
            }
        }
    }

    @Test
    fun sharedArrowsKeepNotationBendsRepeatsAndWaveEndpoints() {
        val v = vectors.getValue("arrows").jsonObject
        val g = diagramGeometry(Json.decodeFromJsonElement<DiagramArea>(v.getValue("area")))
        for ((wire, expected) in v.getValue("stroke").jsonObject) {
            val kind = DiagramArrowKind.entries.single { Json.encodeToJsonElement(it).jsonPrimitive.content == wire }
            near(arrowStrokeWidth(kind, g), expected.jsonPrimitive.double, wire)
            if (kind == DiagramArrowKind.Run) {
                assertContentEquals(floatArrayOf(0.7f, 0.55f), arrowDashIntervals(kind, g))
            } else assertNull(arrowDashIntervals(kind, g))
        }
        val points = Json.decodeFromJsonElement<List<DiagramPoint>>(v.getValue("wavePoints"))
        val wave = wavyPoints(points, 0.3f, 2.3f)
        assertEquals(v.getValue("waveCount").jsonPrimitive.int, wave.size)
        for (sample in v.getValue("waveSamples").jsonArray) {
            val row = sample.jsonObject
            val point = wave[row.getValue("index").jsonPrimitive.int]
            near(point.x.toFloat(), row.getValue("x").jsonPrimitive.double, "wave x")
            near(point.y.toFloat(), row.getValue("y").jsonPrimitive.double, "wave y")
        }
        assertEquals(emptyList(), wavyPoints(listOf(points.first(), points.first()), 0.3f, 2.3f))
        assertEquals(wave, wavyPoints(listOf(points.first()) + points, 0.3f, 2.3f))
        val bent = Json.decodeFromJsonElement<List<DiagramPoint>>(v.getValue("bentPoints"))
        assertEquals(bent, arrowPathPoints(DiagramArrow(DiagramArrowKind.Pass, bent), g))
        val badge = layoutDiagramLabels(DiagramArea(20.0, 20.0), DiagramFrame("midpoint", "Midpoint", emptyList(), listOf(DiagramArrow(DiagramArrowKind.Pass, bent, sequence = 1))), g).single()
        near(badge.x, array(v.getValue("midpointBadge"))[0], "midpoint x")
        near(badge.y, array(v.getValue("midpointBadge"))[1], "midpoint y")
        for (input in v.getValue("finitePoints").jsonArray) {
            val positions = Json.decodeFromJsonElement<List<DiagramPoint>>(input)
            for (kind in DiagramArrowKind.entries) {
                assertTrue(arrowPathPoints(DiagramArrow(kind, positions), g).all { it.x.isFinite() && it.y.isFinite() })
            }
        }
    }

    @Test
    fun gateAngleVectorsPreserveConeCentres() {
        for (case in vectors.getValue("gates").jsonArray) {
            val angle = case.jsonObject.getValue("angle").jsonPrimitive.double
            val (a, b) = gateCones(DiagramObject(DiagramObjectKind.Gate, 10.0, 20.0, angleDegrees = angle))
            val expected = case.jsonObject.getValue("expected").jsonArray
            listOf(a, b).forEachIndexed { i, point ->
                near(point.x.toFloat(), array(expected[i])[0], "gate x/$angle")
                near(point.y.toFloat(), array(expected[i])[1], "gate y/$angle")
            }
        }
    }

    @Test
    fun pillFitBoundsAndFontScaleMatchReviewedNumbers() {
        val g = diagramGeometry(DiagramArea(20.0, 20.0))
        val label = DiagramLabel("pill", DiagramLabelKind.ObjectLabel, "Label", 0f, 0f, 2f, 1f, 1f, 0f, 0f)
        val v = vectors.getValue("pill").jsonObject
        for ((i, size) in listOf(100f to 20f, 400f to 20f, 100f to 400f).withIndex()) {
            near(labelFitScale(g, label, 10f, size.first, size.second), array(v.getValue("fit"))[i], "fit/$i")
        }
        val bounds = labelPillBounds(g, label, 10f, 100f, 20f)
        val actual = listOf(bounds.left, bounds.top, bounds.right, bounds.bottom, bounds.textLeft, bounds.textTop, bounds.textRight, bounds.textBottom)
        array(v.getValue("bounds")).forEachIndexed { i, expected -> near(actual[i], expected, "bounds/$i") }
        near(labelFontSizeSp(1f, 10f, 2f, 1.4f) * 2f * 1.4f, 9.2, "font pixels")
    }
}
