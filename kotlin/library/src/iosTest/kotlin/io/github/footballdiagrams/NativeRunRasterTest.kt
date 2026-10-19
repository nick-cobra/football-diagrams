package io.github.footballdiagrams

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Matrix
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertEquals
import kotlin.math.abs

class NativeRunRasterTest {
    private fun pixels(drawing: ArrowDrawing, size: Int, g: DiagramGeometry, scale: Float): IntArray {
        val bitmap = ImageBitmap(size, size)
        CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(bitmap), Size(size.toFloat(), size.toFloat())) {
            translate(g.marginMetres * scale, g.marginMetres * scale) { drawArrow(drawing, scale) }
        }
        return IntArray(size * size).also { bitmap.readPixels(it) }
    }
    @Test fun clippingBoundsNativeDashWorkAndPreservesPixels() {
        val g = diagramGeometry(DiagramArea(1.0, 1.0))
        val inputs = listOf(
            listOf(DiagramPoint(0.0, 0.0), DiagramPoint(1.0, 1.0)),
            listOf(DiagramPoint(-1000.0, 0.0), DiagramPoint(1000.0, 0.0)),
            List(12) { DiagramPoint(if (it % 2 == 0) -1000.0 else 1000.0, if (it % 2 == 0) -1000.0 else 1000.0) },
            listOf(DiagramPoint(-1000.0, -2.0), DiagramPoint(0.0, 0.0), DiagramPoint(0.0, 0.0), DiagramPoint(2.0, 2.0), DiagramPoint(1000.0, 0.0)),
            listOf(DiagramPoint(-1000.0, -1000.0), DiagramPoint(-900.0, -800.0)),
            listOf(DiagramPoint(0.0, 0.0), DiagramPoint(0.0, 0.0)),
        )
        for (size in listOf(144, 360)) for ((index, points) in inputs.withIndex()) {
            val scale = g.pixelsPerMetre(size.toFloat(), size.toFloat())
            val arrow = DiagramArrow(DiagramArrowKind.Run, points)
            val actual = ArrowDrawingCache(listOf(arrow), g).atScale(scale).single()
            val legacy = Path().apply {
                moveTo(points.first().x.toFloat(), points.first().y.toFloat())
                points.drop(1).forEach { lineTo(it.x.toFloat(), it.y.toFloat()) }
                transform(Matrix().apply { scale(scale, scale) })
            }
            val expected = actual.copy(path = legacy)
            val before = pixels(expected, size, g, scale)
            val after = pixels(actual, size, g, scale)
            val changed = before.indices.count { before[it] != after[it] }
            val alphaError = before.indices.sumOf { abs((before[it] ushr 24) - (after[it] ushr 24)).toLong() }
            val ink = before.sumOf { (it ushr 24).toLong() }.coerceAtLeast(255)
            val errorFraction = alphaError.toDouble() / ink
            println("Run raster $size/$index: changed=$changed alphaErrorFraction=$errorFraction")
            // Global native Float dash distances quantise differently after
            // removing distant geometry. Permit subpixel AA differences, while
            // rejecting a restarted dash phase or missing joins/caps/shadows.
            if (index == 0 || index >= 4) assertEquals(0, changed, "$size/$index")
            assertTrue(errorFraction < 0.02, "$size/$index: clipped phase error $errorFraction")
            val bounds = actual.path.getBounds()
            assertTrue(bounds.width <= size * 4 && bounds.height <= size * 4)
        }
        val positive = List(12) { DiagramPoint(if (it % 2 == 0) 0.0 else 1000.0, 0.0) }
        val fullyVisible = clippedRunPath(positive, 1f, g, 1e8f, 1e8f, 1000)
        assertTrue(fullyVisible.intervalFactor > 1f)
        assertTrue(fullyVisible.dashCountBound <= 1000)
        for ((width, height) in listOf(6.6f to 6.6f, 2400f to 6.6f, 6.6f to 2400f, 1e8f to 6.6f)) {
            for (points in inputs) {
                val result = clippedRunPath(points, 1f, g, width, height, 1000)
                assertTrue(result.dashCountBound <= 1000)
                assertTrue(result.intervalFactor.isFinite())
            }
        }
    }
}
