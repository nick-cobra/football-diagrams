package io.github.footballdiagrams

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.max
import kotlin.math.roundToInt

internal data class ArrowDrawing(val path: Path, val head: Path, val stroke: Stroke, val shadowStroke: Stroke)

/** Owned by one composition/active arrow geometry. Retains only metre-space points and
 * the most recent scale's Paths; resizing cannot accumulate a frame/size history.
 * Text, host style and accessibility remain outside this geometry-only cache. */
internal class ArrowDrawingCache(private val arrows: List<DiagramArrow>, private val geometry: DiagramGeometry) {
    private var sources: List<Pair<DiagramArrowKind, List<DiagramPoint>>> = emptyList()
    private var cachedWidth = Float.NaN
    private var cachedHeight = Float.NaN

    private var cachedScale = Float.NaN
    private var drawings: List<ArrowDrawing> = emptyList()

    fun atScale(scale: Float, viewportWidth: Float = geometry.viewportWidth, viewportHeight: Float = geometry.viewportHeight): List<ArrowDrawing> {
        if (scale <= 0f) return emptyList()
        // The measured Canvas may have a different aspect under host constraints.
        // Round excess extents to units; the half-unit error fits inside padding.
        fun extent(actual: Float, nominal: Float) = nominal +
            max(0f, (actual - nominal) / geometry.unit).roundToInt() * geometry.unit
        val width = extent(viewportWidth, geometry.viewportWidth)
        val height = extent(viewportHeight, geometry.viewportHeight)
        if (cachedWidth != width || cachedHeight != height) {
            sources = arrows.map { it.kind to renderArrowPathPoints(it, geometry, width, height) }
            cachedWidth = width
            cachedHeight = height
            cachedScale = Float.NaN
        }
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

@Composable
internal fun rememberArrowDrawingCache(arrows: List<DiagramArrow>, geometry: DiagramGeometry): ArrowDrawingCache {
    // Labels, sequence numbers and badge positions are painted separately. Keep
    // them out of both the drawing key and the data retained by this cache.
    val shapes = remember(arrows) { arrows.map { DiagramArrow(it.kind, it.points) } }
    return remember(shapes, geometry) { ArrowDrawingCache(shapes, geometry) }
}
