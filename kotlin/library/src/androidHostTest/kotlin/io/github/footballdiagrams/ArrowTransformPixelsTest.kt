package io.github.footballdiagrams

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.roundToInt
import kotlin.test.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class ArrowTransformPixelsTest {
    @Test fun nativePathTransformsMatchThePreviousPointScalingAtEverySize() {
        val arrows = DiagramArrowKind.entries.flatMapIndexed { kindIndex, kind ->
            listOf(
                DiagramArrow(kind, (0..11).map { DiagramPoint(2.17 + it * 3.1, 3.31 + (it + kindIndex) % 5 * 4.3) }),
                DiagramArrow(kind, listOf(DiagramPoint(4.1, 7.3), DiagramPoint(24.2, 18.7), DiagramPoint(24.2, 18.7))),
                DiagramArrow(kind, listOf(DiagramPoint(8.3, 9.7), DiagramPoint(8.3, 9.7))),
            )
        }
        for ((g, input) in listOf(
            diagramGeometry(DiagramArea(40.0, 30.0)) to arrows,
            diagramGeometry(DiagramArea(1.0, 1.0)) to listOf(DiagramArrow(DiagramArrowKind.Dribble, listOf(DiagramPoint(-1000.0, 0.0), DiagramPoint(1000.0, 0.0)))),
        )) {
            val cache = ArrowDrawingCache(input, g)
            for ((width, height) in listOf(320 to 252, 600 to 472, 601 to 473, 1203 to 948, 800 to 100, 100 to 800)) {
                val scale = g.pixelsPerMetre(width.toFloat(), height.toFloat())
                // Use the same rounded viewport budget as the production cache;
                // this reference deliberately preserves the old point-by-point
                // scaling, not the new native Path transform implementation.
                fun extent(actual: Float, nominal: Float) = nominal +
                    kotlin.math.max(0f, (actual - nominal) / g.unit).roundToInt() * g.unit
                val viewportWidth = extent(width / scale, g.viewportWidth)
                val viewportHeight = extent(height / scale, g.viewportHeight)
                val expected = input.mapNotNull { legacy(it, g, scale, viewportWidth, viewportHeight) }
                val actual = cache.atScale(scale, width / scale, height / scale)
                fun paint(drawings: List<ArrowDrawing>): IntArray {
                    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                    CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(android.graphics.Canvas(bitmap)), Size(width.toFloat(), height.toFloat())) {
                        translate(g.marginMetres * scale, g.marginMetres * scale) { drawings.forEach { drawArrow(it, scale) } }
                    }
                    return IntArray(width * height).also { bitmap.getPixels(it, 0, width, 0, 0, width, height) }
                }
                val before = paint(expected)
                val after = paint(actual)
                assertTrue(before.any { it != 0 })
                assertEquals(0, before.indices.count { before[it] != after[it] }, "${g.lengthMetres}m pitch at ${width}x$height: native transforms must preserve arrow pixels")
            }
        }
    }

    private fun legacy(arrow: DiagramArrow, g: DiagramGeometry, scale: Float, viewportWidth: Float, viewportHeight: Float): ArrowDrawing? {
        val points = renderArrowPathPoints(arrow, g, viewportWidth, viewportHeight)
        if (points.size < 2) return null
        val path = Path().apply {
            moveTo(points.first().x.toFloat() * scale, points.first().y.toFloat() * scale)
            for (point in points.drop(1)) lineTo(point.x.toFloat() * scale, point.y.toFloat() * scale)
        }
        val tip = points.last()
        val angle = arrowHeadAngle(points)
        val length = g.unit * if (arrow.kind == DiagramArrowKind.Shot) 1.1f else 1.4f
        val head = Path().apply {
            moveTo(tip.x.toFloat() * scale, tip.y.toFloat() * scale)
            lineTo((tip.x.toFloat() - cos(angle - 0.42f) * length) * scale, (tip.y.toFloat() - sin(angle - 0.42f) * length) * scale)
            lineTo((tip.x.toFloat() - cos(angle + 0.42f) * length) * scale, (tip.y.toFloat() - sin(angle + 0.42f) * length) * scale)
            close()
        }
        val width = arrowStrokeWidth(arrow.kind, g)
        val dash = arrowDashIntervals(arrow.kind, g)?.map { it * scale }?.toFloatArray()?.let { PathEffect.dashPathEffect(it) }
        return ArrowDrawing(path, head, Stroke(width = width * scale, pathEffect = dash), Stroke(width = (width + g.unit * 0.1f) * scale, pathEffect = dash))
    }
}
