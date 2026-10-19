package io.github.footballdiagrams

import androidx.compose.ui.graphics.Path
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

/** Clip before native dash expansion. Each re-entry has an outside-viewport
 * prefix carrying the distance modulo the dash period, so phase never restarts
 * at the viewport edge. Interior vertices remain a single contour (same joins).
 * Pixel-space Float distances match the drawing backend's precision. */
internal data class ClippedRun(val path: Path, val intervalFactor: Float, val dashCountBound: Int)

internal fun clippedRunPath(
    points: List<DiagramPoint>, scale: Float, geometry: DiagramGeometry,
    viewportWidth: Float, viewportHeight: Float, dashBudget: Int = 1000,
): ClippedRun {
    val padding = geometry.unit * 4f * scale
    val left = -geometry.marginMetres * scale - padding
    val top = left
    val right = (viewportWidth - geometry.marginMetres) * scale + padding
    val bottom = (viewportHeight - geometry.marginMetres) * scale + padding
    val period = arrowDashIntervals(DiagramArrowKind.Run, geometry)!!.map { it * scale }.sum()
    data class Segment(val x: Float, val y: Float, val endX: Float, val endY: Float,
        val ux: Float, val uy: Float, val distance: Float, val connected: Boolean, val length: Float)
    val segments = mutableListOf<Segment>()
    var travelled = 0f
    var connected = false
    for ((a, b) in points.zipWithNext()) {
        val ax = a.x.toFloat() * scale
        val ay = a.y.toFloat() * scale
        val bx = b.x.toFloat() * scale
        val by = b.y.toFloat() * scale
        val dx = bx - ax
        val dy = by - ay
        val length = hypot(dx, dy)
        if (length == 0f) continue
        var enter = 0.0
        var leave = 1.0
        fun clip(start: Float, delta: Float, low: Float, high: Float) {
            if (delta == 0f) {
                if (start < low || start > high) { enter = 1.0; leave = 0.0 }
            } else {
                val t0 = (low.toDouble() - start) / delta
                val t1 = (high.toDouble() - start) / delta
                enter = max(enter, min(t0, t1))
                leave = min(leave, max(t0, t1))
            }
        }
        clip(ax, dx, left, right)
        clip(ay, dy, top, bottom)
        if (enter <= leave) {
            val x = (ax + dx * enter).toFloat()
            val y = (ay + dy * enter).toFloat()
            segments += Segment(x, y, (ax + dx * leave).toFloat(), (ay + dy * leave).toFloat(),
                dx / length, dy / length, travelled + length * enter.toFloat(),
                connected && enter == 0.0, (length * (leave - enter)).toFloat())
            connected = leave == 1.0
        } else connected = false
        travelled += length
    }
    val visibleLength = segments.sumOf { it.length.toDouble() }
    var factor = 1f
    // One phase prefix per contour adds less than one interval; reserve an
    // extra interval per segment for native Float rounding. Keep a hard
    // allocation even when a huge host constraint exposes the entire document.
    while (visibleLength / (period * factor) + 2 * segments.size > dashBudget) factor *= 2f
    val renderedPeriod = period * factor
    val path = Path()
    for (segment in segments) {
        if (!segment.connected) {
            val phase = segment.distance % renderedPeriod
            path.moveTo(segment.x - segment.ux * phase, segment.y - segment.uy * phase)
            path.lineTo(segment.x, segment.y)
        }
        path.lineTo(segment.endX, segment.endY)
    }
    return ClippedRun(path, factor, kotlin.math.ceil(visibleLength / renderedPeriod + 2 * segments.size).toInt())
}
