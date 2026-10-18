package io.github.footballdiagrams

import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.cos
import kotlin.math.sin

internal data class ArrowDrawing(val path: Path, val head: Path, val stroke: Stroke, val shadowStroke: Stroke)

/** Owned by one composition/selected frame. Retains only metre-space points and
 * the most recent scale's Paths; resizing cannot accumulate a frame/size history.
 * Text, host style and accessibility remain outside this geometry-only cache. */
internal class ArrowDrawingCache(arrows: List<DiagramArrow>, private val geometry: DiagramGeometry) {
    private val sources = arrows.map { it.kind to renderArrowPathPoints(it, geometry) }

    private var cachedScale = Float.NaN
    private var drawings: List<ArrowDrawing> = emptyList()

    fun atScale(scale: Float): List<ArrowDrawing> {
        if (cachedScale != scale) {
            drawings = buildDrawings(scale)
            cachedScale = scale
        }
        return drawings
    }

    private fun buildDrawings(scale: Float): List<ArrowDrawing> = sources.mapNotNull { (kind, points) ->
        if (points.size < 2) return@mapNotNull null
        val width = arrowStrokeWidth(kind, geometry)
        val path = Path().apply {
            moveTo(points.first().x.toFloat() * scale, points.first().y.toFloat() * scale)
            for (index in 1 until points.size) {
                val point = points[index]
                lineTo(point.x.toFloat() * scale, point.y.toFloat() * scale)
            }
        }
        val dash = arrowDashIntervals(kind, geometry)
            ?.map { it * scale }?.toFloatArray()?.let { PathEffect.dashPathEffect(it) }
        val tip = points.last()
        val angle = arrowHeadAngle(points)
        val headLength = geometry.unit * (if (kind == DiagramArrowKind.Shot) 1.1f else 1.4f)
        val spread = 0.42f
        val head = Path().apply {
            moveTo(tip.x.toFloat() * scale, tip.y.toFloat() * scale)
            lineTo((tip.x.toFloat() - cos(angle - spread) * headLength) * scale,
                (tip.y.toFloat() - sin(angle - spread) * headLength) * scale)
            lineTo((tip.x.toFloat() - cos(angle + spread) * headLength) * scale,
                (tip.y.toFloat() - sin(angle + spread) * headLength) * scale)
            close()
        }
        ArrowDrawing(path, head, Stroke(width = width * scale, pathEffect = dash),
            Stroke(width = (width + geometry.unit * 0.1f) * scale, pathEffect = dash))
    }
}
