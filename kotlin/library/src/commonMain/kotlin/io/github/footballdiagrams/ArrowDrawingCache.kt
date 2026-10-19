package io.github.footballdiagrams

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Matrix
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.max
import kotlin.math.roundToInt

internal data class ArrowDrawing(val path: Path, val head: Path, val stroke: Stroke, val shadowStroke: Stroke)

/** Owned by one composition/active arrow geometry. Retains metre-space Paths and
 * only the most recent scaled drawing; resizing cannot accumulate a size history.
 * Text, host style and accessibility remain outside this geometry-only cache. */
internal class ArrowDrawingCache(private val arrows: List<DiagramArrow>, private val geometry: DiagramGeometry) {
    private val dashBudget = 30_000 / max(1, arrows.count { it.kind == DiagramArrowKind.Run })
    private val wavePointBudget = 30_000 / max(1, arrows.count { it.kind == DiagramArrowKind.Dribble })
    private var sources: List<ArrowSourceDrawing> = emptyList()
    private var cachedWidth = Float.NaN
    private var cachedHeight = Float.NaN

    private var cachedScale = Float.NaN
    private var drawings: List<ArrowDrawing> = emptyList()

    fun atScale(scale: Float, viewportWidth: Float = geometry.viewportWidth, viewportHeight: Float = geometry.viewportHeight): List<ArrowDrawing> {
        if (!scale.isFinite() || scale <= 0f) return emptyList()
        // The measured Canvas may have a different aspect under host constraints.
        // Round excess extents to units; the half-unit error fits inside padding.
        fun extent(actual: Float, nominal: Float) = nominal +
            max(0f, (actual - nominal) / geometry.unit).roundToInt() * geometry.unit
        val width = extent(viewportWidth, geometry.viewportWidth)
        val height = extent(viewportHeight, geometry.viewportHeight)
        if (cachedWidth != width || cachedHeight != height) {
            sources = arrows.mapNotNull { prepareSource(it, width, height) }
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

    private data class ArrowSourceDrawing(
        val path: Path,
        val head: Path,
        val width: Float,
        val shadowWidth: Float,
        val dash: FloatArray?,
        val runPoints: List<DiagramPoint>?,
    )

    private fun prepareSource(arrow: DiagramArrow, viewportWidth: Float, viewportHeight: Float): ArrowSourceDrawing? {
        val points = renderArrowPathPoints(arrow, geometry, viewportWidth, viewportHeight, wavePointBudget)
        if (points.size < 2) return null
        val path = Path().apply {
            moveTo(points.first().x.toFloat(), points.first().y.toFloat())
            for (index in 1 until points.size) {
                val point = points[index]
                lineTo(point.x.toFloat(), point.y.toFloat())
            }
        }
        val tip = points.last()
        val angle = arrowHeadAngle(points)
        val headLength = geometry.unit * (if (arrow.kind == DiagramArrowKind.Shot) 1.1f else 1.4f)
        val spread = 0.42f
        val head = Path().apply {
            moveTo(tip.x.toFloat(), tip.y.toFloat())
            lineTo(tip.x.toFloat() - cos(angle - spread) * headLength,
                tip.y.toFloat() - sin(angle - spread) * headLength)
            lineTo(tip.x.toFloat() - cos(angle + spread) * headLength,
                tip.y.toFloat() - sin(angle + spread) * headLength)
            close()
        }
        val width = arrowStrokeWidth(arrow.kind, geometry)
        return ArrowSourceDrawing(path, head, width, width + geometry.unit * 0.1f, arrowDashIntervals(arrow.kind, geometry),
            if (arrow.kind == DiagramArrowKind.Run && arrow.points.any {
                it.x < -geometry.marginMetres || it.y < -geometry.marginMetres ||
                    it.x > viewportWidth - geometry.marginMetres || it.y > viewportHeight - geometry.marginMetres
            }) arrow.points else null)
    }

    private fun buildDrawings(scale: Float): List<ArrowDrawing> {
        val matrix = Matrix().apply { scale(scale, scale) }
        // Copy and transform in the graphics backend: no Kotlin walk over the
        // sampled points. Fresh scaled Paths preserve previous draw identities.
        fun scaled(path: Path) = Path().apply { addPath(path); transform(matrix) }
        return sources.map { source ->
            val run = source.runPoints?.let { clippedRunPath(it, scale, geometry, cachedWidth, cachedHeight, dashBudget) }
            val dash = source.dash?.let { intervals ->
                PathEffect.dashPathEffect(FloatArray(intervals.size) { intervals[it] * scale * (run?.intervalFactor ?: 1f) })
            }
            ArrowDrawing(run?.path ?: scaled(source.path), scaled(source.head),
                Stroke(width = source.width * scale, pathEffect = dash),
                Stroke(width = source.shadowWidth * scale, pathEffect = dash))
        }
    }
}

@Composable
internal fun rememberArrowDrawingCache(arrows: List<DiagramArrow>, geometry: DiagramGeometry): ArrowDrawingCache {
    // Labels, sequence numbers and badge positions are painted separately. Keep
    // them out of both the drawing key and the data retained by this cache.
    val shapes = remember(arrows) { arrows.map { DiagramArrow(it.kind, it.points) } }
    return remember(shapes, geometry) { ArrowDrawingCache(shapes, geometry) }
}
