package io.github.footballdiagrams

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import kotlinx.serialization.json.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.math.abs
import kotlin.math.min
import kotlin.math.max
import kotlin.test.assertTrue

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class GlyphVectorsTest {
    @Test
    fun allCanvasGlyphBoundsMatchTheSharedMetreVectors() {
        val vectors = Json.parseToJsonElement(geometryVectorsJson).jsonObject
        for (probe in vectors.getValue("glyphs").jsonArray) {
            val obj = Json.decodeFromJsonElement<DiagramObject>(probe.jsonObject.getValue("object"))
            val recording = BoundsCanvas()
            val geometry = diagramGeometry(DiagramArea(26.0, 20.0))
            CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, recording, Size(100f, 100f)) {
                drawEquipment(obj, geometry, 1f)
                drawPerson(obj, DiagramFrame("glyph", "Glyph", listOf(obj), emptyList()), geometry, 1f)
            }
            val bounds = recording.bounds ?: error("${obj.kind} did not draw")
            val actual = listOf(bounds.left, bounds.top, bounds.right, bounds.bottom)
            probe.jsonObject.getValue("bounds").jsonArray.forEachIndexed { i, expected ->
                assertTrue(abs(actual[i].toDouble() - expected.jsonPrimitive.double) < 0.0001, "${obj.kind}/$i: ${actual[i]} != $expected")
            }
        }
    }
}

// Record actual Canvas primitive bounds; exclude stroke extents, just as SVG
// getBBox/default primitive geometry does. No expected result calls these methods.
private class BoundsCanvas : Canvas by Canvas(android.graphics.Canvas(Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888))) {
    var bounds: Rect? = null
    private fun record(rect: Rect) {
        bounds = bounds?.let { Rect(min(it.left, rect.left), min(it.top, rect.top), max(it.right, rect.right), max(it.bottom, rect.bottom)) } ?: rect
    }
    override fun drawRect(left: Float, top: Float, right: Float, bottom: Float, paint: Paint) = record(Rect(left, top, right, bottom))
    override fun drawOval(left: Float, top: Float, right: Float, bottom: Float, paint: Paint) = record(Rect(left, top, right, bottom))
    override fun drawRoundRect(left: Float, top: Float, right: Float, bottom: Float, radiusX: Float, radiusY: Float, paint: Paint) = record(Rect(left, top, right, bottom))
    override fun drawCircle(center: Offset, radius: Float, paint: Paint) = record(Rect(center.x-radius, center.y-radius, center.x+radius, center.y+radius))
    override fun drawLine(p1: Offset, p2: Offset, paint: Paint) = record(Rect(min(p1.x,p2.x),min(p1.y,p2.y),max(p1.x,p2.x),max(p1.y,p2.y)))
    override fun drawPath(path: Path, paint: Paint) = record(path.getBounds())
}
