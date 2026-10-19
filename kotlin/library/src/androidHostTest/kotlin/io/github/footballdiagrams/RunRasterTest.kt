package io.github.footballdiagrams

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Matrix
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.test.assertTrue
import kotlin.test.assertEquals
import kotlin.math.abs
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class RunRasterTest {
    private fun pixels(drawing: ArrowDrawing, size: Int, g: DiagramGeometry, scale: Float): IntArray {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        try {
            CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(android.graphics.Canvas(bitmap)), Size(size.toFloat(), size.toFloat())) {
                translate(g.marginMetres * scale, g.marginMetres * scale) { drawArrow(drawing, scale) }
            }
            return IntArray(size * size).also { bitmap.getPixels(it, 0, size, 0, 0, size, size) }
        } finally { bitmap.recycle() }
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
        val visibleArrows = List(30) { DiagramArrow(DiagramArrowKind.Run, positive) }
        val cached = ArrowDrawingCache(visibleArrows, g).atScale(1f, 1e8f, 1e8f).first()
        val expectedEffect = PathEffect.dashPathEffect(arrowDashIntervals(DiagramArrowKind.Run, g)!!
            .map { it * fullyVisible.intervalFactor }.toFloatArray())
        val budgeted = cached.copy(path = fullyVisible.path,
            stroke = androidx.compose.ui.graphics.drawscope.Stroke(width = cached.stroke.width, pathEffect = expectedEffect),
            shadowStroke = androidx.compose.ui.graphics.drawscope.Stroke(width = cached.shadowStroke.width, pathEffect = expectedEffect))
        kotlin.test.assertContentEquals(pixels(budgeted, 360, g, 1f), pixels(cached, 360, g, 1f),
            "Cache must apply the frame budget to fully visible distant paths")
        for ((width, height) in listOf(6.6f to 6.6f, 2400f to 6.6f, 6.6f to 2400f, 1e8f to 6.6f)) {
            for (points in inputs) {
                val result = clippedRunPath(points, 1f, g, width, height, 1000)
                assertTrue(result.dashCountBound <= 1000)
                assertTrue(result.intervalFactor.isFinite())
            }
        }
    }
    @Test fun maximumRunRasterEvidence() {
        val g = diagramGeometry(DiagramArea(1.0, 1.0))
        val scale = g.pixelsPerMetre(360f, 360f)
        val points = List(12) { DiagramPoint(if (it % 2 == 0) -1000.0 else 1000.0, if (it % 2 == 0) -1000.0 else 1000.0) }
        val drawings = ArrowDrawingCache(List(30) { DiagramArrow(DiagramArrowKind.Run, points) }, g).atScale(scale)
        val bitmap = Bitmap.createBitmap(360, 360, Bitmap.Config.ARGB_8888)
        try {
            val scope = CanvasDrawScope()
            val canvas = Canvas(android.graphics.Canvas(bitmap))
            val samples = List(7) {
                bitmap.eraseColor(0)
                val start = System.nanoTime()
                scope.draw(Density(1f), LayoutDirection.Ltr, canvas, Size(360f, 360f)) {
                    translate(g.marginMetres * scale, g.marginMetres * scale) { drawings.forEach { drawArrow(it, scale) } }
                }
                (System.nanoTime() - start) / 1e6
            }
            File("build/reports/rendering/run-raster-ms.json").apply {
                parentFile?.mkdirs()
                writeText(samples.joinToString(prefix = "[", postfix = "]"))
            }
            assertTrue(drawings.size == 30)
        } finally { bitmap.recycle() }
    }
}
