package io.github.footballdiagrams

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

data class DiagramGeometry(
    val lengthMetres: Float,
    val widthMetres: Float,
    val marginMetres: Float,
    val playerRadius: Float,
    val unit: Float,
) {
    val viewportWidth: Float get() = lengthMetres + 2 * marginMetres
    val viewportHeight: Float get() = widthMetres + 2 * marginMetres
    val aspectRatio: Float get() = viewportWidth / viewportHeight
    val stripeWidth: Float get() = lengthMetres / MOWN_STRIPES
}

private const val MOWN_STRIPES = 6f
private const val MIN_MARGIN_METRES = 2.8f
private const val MARGIN_FRACTION = 0.09f
private const val MIN_PLAYER_RADIUS_METRES = 0.72f
private const val PLAYER_RADIUS_DIVISOR = 26f
private const val MIN_UNIT_METRES = 1.0f
private const val UNIT_DIVISOR = 20f
private const val MAX_WAVE_POINTS = 100_000

private object Proportions {
    const val PILL_WIDTH_PER_CHAR = 0.56f
    const val PILL_WIDTH_PADDING = 1.5f
    const val PILL_HEIGHT = 1.55f

    const val LABEL_GAP = 0.18f
    const val LABEL_STEP = 1.0f
    const val DECOLLIDE_RINGS = 6

    const val AREA_LABEL_FONT = 0.8f
    const val AREA_LABEL_MARGIN_FRACTION = 0.5f
    const val SUB_AREA_LABEL_FONT = 0.7f
    const val SUB_AREA_LABEL_INSET = 0.3f

    const val BADGE_RADIUS = 0.58f
    const val BADGE_OFFSET_X = 0.95f
    const val BADGE_OFFSET_Y = 0.8f
    const val BADGE_FONT_MULTI_CHAR = 0.95f
    const val BADGE_FONT_SINGLE_CHAR = 1.25f

    const val SEQUENCE_RADIUS = 0.72f
    const val SEQUENCE_FONT = 0.9f
    const val SEQUENCE_LIFT = 1.15f

    const val PILL_FONT = 0.65f
    const val OBJECT_LABEL_DROP = 1.9f
    const val ARROW_LABEL_LIFT = 1.6f

    const val MOVER_RADIUS_FACTOR = 1.9f

    const val DRIBBLE_AMPLITUDE = 0.3f
    const val DRIBBLE_WAVELENGTH = 2.3f
    const val WAVE_SAMPLES_PER_WAVELENGTH = 6f
    const val MIN_WAVE_SAMPLES = 10

    const val GATE_CONE_GAP = 2.1f
    const val SHOT_STROKE = 0.42f
    const val DEFAULT_STROKE = 0.24f
    const val RUN_DASH_ON = 0.7f
    const val RUN_DASH_OFF = 0.55f
    const val HALF_TURN_DEGREES = 180f
}

fun diagramGeometry(area: DiagramArea): DiagramGeometry {
    val length = area.lengthMetres.toFloat()
    return DiagramGeometry(
        lengthMetres = length,
        widthMetres = area.widthMetres.toFloat(),
        marginMetres = max(MIN_MARGIN_METRES, length * MARGIN_FRACTION),
        playerRadius = max(MIN_PLAYER_RADIUS_METRES, length / PLAYER_RADIUS_DIVISOR),
        unit = max(MIN_UNIT_METRES, length / UNIT_DIVISOR),
    )
}

data class DiagramGrassStripe(val x: Float, val width: Float, val light: Boolean)

/** At most 256 stripes, including the margin around a subpixel-sized pitch. */
fun grassStripes(geometry: DiagramGeometry): List<DiagramGrassStripe> {
    val step = max(geometry.stripeWidth, geometry.viewportWidth / 256f)
    val count = min(256, ceil(geometry.viewportWidth / step).toInt())
    return List(count) { index ->
        val x = -geometry.marginMetres + index * step
        DiagramGrassStripe(x, min(step, geometry.lengthMetres + geometry.marginMetres - x), index % 2 == 1)
    }
}

fun isMover(target: DiagramObject, frame: DiagramFrame, geometry: DiagramGeometry): Boolean {
    if (frame.arrows.isEmpty()) return false
    return frame.arrows.any { arrow ->
        val start = arrow.points.first()
        hypot(start.x.toFloat() - target.x.toFloat(), start.y.toFloat() - target.y.toFloat()) < geometry.playerRadius * Proportions.MOVER_RADIUS_FACTOR
    }
}

fun wavyPoints(points: List<DiagramPoint>, amplitude: Float, wavelength: Float): List<DiagramPoint> =
    sampledWavePoints(points, amplitude, wavelength)

private fun sampledWavePoints(
    points: List<DiagramPoint>, amplitude: Float, wavelength: Float, bounds: WaveBounds? = null,
): List<DiagramPoint> {
    require(amplitude.isFinite() && wavelength.isFinite() && wavelength > 0f &&
        points.all { it.x.toFloat().isFinite() && it.y.toFloat().isFinite() }) {
        "Wave arguments must be finite at drawing precision and wavelength must be positive"
    }
    val out = mutableListOf<DiagramPoint>()
    var generatedPoints = 0
    for (segment in 0 until points.size - 1) {
        val a = points[segment]
        val b = points[segment + 1]
        val dx = b.x.toFloat() - a.x.toFloat()
        val dy = b.y.toFloat() - a.y.toFloat()
        val length = hypot(dx, dy)
        if (length == 0f) continue
        val ux = dx / length
        val uy = dy / length
        val px = -uy
        val py = ux
        val steps = waveStepCount(length, wavelength, generatedPoints)
        generatedPoints += steps + 1
        var last = -1
        for (range in waveSampleRanges(a.x.toFloat(), a.y.toFloat(), dx, dy, steps, bounds)) {
            for (i in max(range.first, last + 1)..range.last) {
                val base = (i.toFloat() / steps) * length
                // Ends pinned flat so the arrow still starts and finishes on its
                // stated point, however much the middle waves.
                val offset = if (i == 0 || i == steps) {
                    0f
                } else {
                    sin((base / wavelength) * 2f * PI.toFloat()) * amplitude
                }
                val x = a.x.toFloat() + ux * base + px * offset
                val y = a.y.toFloat() + uy * base + py * offset
                require(x.isFinite() && y.isFinite()) { "Wave coordinates must remain finite" }
                out += DiagramPoint(x, y)
                last = i
            }
        }
    }
    return out
}

private data class WaveBounds(val left: Float, val top: Float, val right: Float, val bottom: Float)

/** Keep sample phase and endpoint neighbours; omitted connectors remain outside
 * the padded viewport. The public full-wave helper is deliberately unchanged. */
private fun waveSampleRanges(ax: Float, ay: Float, dx: Float, dy: Float, steps: Int, bounds: WaveBounds?): List<IntRange> {
    if (bounds == null) return listOf(0..steps)
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
    clip(ax, dx, bounds.left, bounds.right)
    clip(ay, dy, bounds.top, bounds.bottom)
    return buildList {
        add(0..1)
        if (enter <= leave) add(max(0, kotlin.math.floor(enter * steps).toInt() - 1)..min(steps, ceil(leave * steps).toInt() + 1))
        add(steps - 1..steps)
    }
}

internal fun renderArrowPathPoints(
    arrow: DiagramArrow, geometry: DiagramGeometry,
    viewportWidth: Float = geometry.viewportWidth, viewportHeight: Float = geometry.viewportHeight,
): List<DiagramPoint> {
    if (arrow.kind != DiagramArrowKind.Dribble) return arrowPathPoints(arrow, geometry)
    val padding = geometry.unit * 4f // Amplitude, shadow/strokes and arrowhead.
    return sampledWavePoints(arrow.points, geometry.unit * Proportions.DRIBBLE_AMPLITUDE,
        geometry.unit * Proportions.DRIBBLE_WAVELENGTH,
        WaveBounds(-geometry.marginMetres - padding, -geometry.marginMetres - padding,
            viewportWidth - geometry.marginMetres + padding,
            viewportHeight - geometry.marginMetres + padding))
}

internal fun waveStepCount(length: Float, wavelength: Float, generatedPoints: Int): Int {
    val samples = length / (wavelength / Proportions.WAVE_SAMPLES_PER_WAVELENGTH)
    require(samples.isFinite() && samples <= MAX_WAVE_POINTS) { "Wave sampling exceeds $MAX_WAVE_POINTS generated points" }
    val steps = max(Proportions.MIN_WAVE_SAMPLES, samples.roundToInt())
    require(generatedPoints + steps + 1 <= MAX_WAVE_POINTS) { "Wave sampling exceeds $MAX_WAVE_POINTS generated points" }
    return steps
}

fun gateCones(target: DiagramObject): Pair<DiagramPoint, DiagramPoint> {
    val gap = Proportions.GATE_CONE_GAP
    val angle = (target.angleDegrees?.toFloat() ?: 0f) * PI.toFloat() / Proportions.HALF_TURN_DEGREES
    val ux = cos(angle)
    val uy = sin(angle)
    return DiagramPoint(target.x.toFloat() - ux * gap / 2f, target.y.toFloat() - uy * gap / 2f) to
        DiagramPoint(target.x.toFloat() + ux * gap / 2f, target.y.toFloat() + uy * gap / 2f)
}

enum class DiagramLabelKind { Area, SubArea, Number, Sequence, ObjectLabel, ArrowLabel }

data class DiagramLabel(
    val id: String,
    val kind: DiagramLabelKind,
    val text: String,
    val x: Float,
    val y: Float,
    val width: Float,
    val height: Float,
    val fontSize: Float,
    val anchorX: Float,
    val anchorY: Float,
) {
    val isBadge: Boolean get() = kind == DiagramLabelKind.Number || kind == DiagramLabelKind.Sequence
}

private fun pillSize(text: String, fontSize: Float): Pair<Float, Float> =
    Pair(
        text.length * fontSize * Proportions.PILL_WIDTH_PER_CHAR + fontSize * Proportions.PILL_WIDTH_PADDING,
        fontSize * Proportions.PILL_HEIGHT,
    )

private fun overlaps(a: DiagramLabel, b: DiagramLabel, gap: Float): Boolean =
    a.x < b.x + b.width + gap && b.x < a.x + a.width + gap &&
        a.y < b.y + b.height + gap && b.y < a.y + a.height + gap

private fun candidateOffsets(step: Float): Sequence<Pair<Float, Float>> = sequence {
    yield(0f to 0f)
    for (ring in 1..Proportions.DECOLLIDE_RINGS) {
        yield(0f to step * ring)
        yield(0f to -step * ring)
        yield(step * ring to 0f)
        yield(-step * ring to 0f)
        yield(step * ring to step * ring)
        yield(-step * ring to -step * ring)
    }
}

fun layoutDiagramLabels(
    area: DiagramArea,
    frame: DiagramFrame,
    geometry: DiagramGeometry,
): List<DiagramLabel> {
    return placeDiagramLabels(diagramLabelCandidates(area, frame, geometry), geometry)
}

internal fun diagramLabelCandidates(area: DiagramArea, frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> =
    // Badges precede pills so the latter move around their anchored numbers.
    buildList {
        addAll(areaLabels(area, geometry))
        addAll(subAreaLabels(frame, geometry))
        addAll(glyphBadges(frame, geometry))
        addAll(sequenceBadges(frame, geometry))
        addAll(objectLabels(frame, geometry))
        addAll(arrowLabels(frame, geometry))
    }

internal fun placeDiagramLabels(wanted: List<DiagramLabel>, geometry: DiagramGeometry): List<DiagramLabel> {
    val gap = geometry.unit * Proportions.LABEL_GAP
    val step = geometry.unit * Proportions.LABEL_STEP
    val placed = mutableListOf<DiagramLabel>()
    for (label in wanted) {
        var chosen = label
        for ((dx, dy) in candidateOffsets(step)) {
            val candidate = label.copy(x = label.anchorX + dx, y = label.anchorY + dy)
            chosen = candidate
            if (placed.none { overlaps(candidate, it, gap) }) break
        }
        placed += chosen
    }
    return placed
}

private fun label(
    id: String,
    kind: DiagramLabelKind,
    text: String,
    x: Float,
    y: Float,
    fontSize: Float,
    size: Pair<Float, Float> = pillSize(text, fontSize),
) = DiagramLabel(id, kind, text, x, y, size.first, size.second, fontSize, x, y)

private fun areaLabels(area: DiagramArea, geometry: DiagramGeometry): List<DiagramLabel> {
    val text = area.label ?: return emptyList()
    val fontSize = geometry.unit * Proportions.AREA_LABEL_FONT
    val size = pillSize(text, fontSize)
    val y = -geometry.marginMetres * Proportions.AREA_LABEL_MARGIN_FRACTION - size.second / 2f
    return listOf(label("area", DiagramLabelKind.Area, text, 0f, y, fontSize, size))
}

private fun badgeFont(short: String): Float =
    if (short.length > 1) Proportions.BADGE_FONT_MULTI_CHAR else Proportions.BADGE_FONT_SINGLE_CHAR

private fun subAreaLabels(frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> {
    val fontSize = geometry.unit * Proportions.SUB_AREA_LABEL_FONT
    return frame.areas.mapIndexed { index, subArea ->
        label(
            subArea.id ?: "sub-area-$index",
            DiagramLabelKind.SubArea,
            subArea.label,
            subArea.x.toFloat() + geometry.unit * Proportions.SUB_AREA_LABEL_INSET,
            subArea.y.toFloat() + geometry.unit * Proportions.SUB_AREA_LABEL_INSET,
            fontSize,
        )
    }
}

private fun glyphBadges(frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> =
    frame.objects.mapIndexedNotNull { index, target ->
        val short = glyphBadgeText(target) ?: return@mapIndexedNotNull null
        val radius = geometry.unit * Proportions.BADGE_RADIUS
        label(
            "object-$index-badge",
            DiagramLabelKind.Number,
            short,
            target.x.toFloat() - geometry.playerRadius * Proportions.BADGE_OFFSET_X - radius,
            target.y.toFloat() + geometry.playerRadius * Proportions.BADGE_OFFSET_Y - radius,
            radius * badgeFont(short),
            (radius * 2f) to (radius * 2f),
        )
    }

private fun glyphBadgeText(target: DiagramObject): String? =
    if (target.kind.isPerson) {
        target.number?.toString() ?: target.short ?: if (target.kind == DiagramObjectKind.Coach) "C" else null
    } else null

private fun sequenceBadges(frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> =
    frame.arrows.mapIndexedNotNull { index, arrow ->
        val sequence = arrow.sequence ?: return@mapIndexedNotNull null
        val midpoint = (arrow.points.size - 1) / 2
        val a = arrow.points[midpoint]
        val b = arrow.points.getOrElse(midpoint + 1) { a }
        val cx = arrow.badge?.x?.toFloat() ?: ((a.x.toFloat() + b.x.toFloat()) / 2f)
        val cy = arrow.badge?.y?.toFloat() ?: ((a.y.toFloat() + b.y.toFloat()) / 2f - geometry.unit * Proportions.SEQUENCE_LIFT)
        val radius = geometry.unit * Proportions.SEQUENCE_RADIUS
        label(
            "arrow-$index-sequence",
            DiagramLabelKind.Sequence,
            sequence.toString(),
            cx - radius,
            cy - radius,
            geometry.unit * Proportions.SEQUENCE_FONT,
            (radius * 2f) to (radius * 2f),
        )
    }

private fun objectLabels(frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> =
    frame.objects.mapIndexedNotNull { index, target ->
        val text = target.label ?: return@mapIndexedNotNull null
        if (text == glyphBadgeText(target)) return@mapIndexedNotNull null
        val fontSize = geometry.unit * Proportions.PILL_FONT
        val size = pillSize(text, fontSize)
        label(
            "object-$index-label",
            DiagramLabelKind.ObjectLabel,
            text,
            target.x.toFloat() - geometry.playerRadius,
            target.y.toFloat() + geometry.playerRadius * Proportions.MOVER_RADIUS_FACTOR - size.second / 2f,
            fontSize,
            size,
        )
    }

private fun arrowLabels(frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> =
    frame.arrows.mapIndexedNotNull { index, arrow ->
        val text = arrow.label ?: return@mapIndexedNotNull null
        val last = arrow.points.last()
        val fontSize = geometry.unit * Proportions.PILL_FONT
        val size = pillSize(text, fontSize)
        label(
            "arrow-$index-label",
            DiagramLabelKind.ArrowLabel,
            text,
            last.x.toFloat() - geometry.unit,
            last.y.toFloat() - geometry.unit * Proportions.ARROW_LABEL_LIFT - size.second / 2f,
            fontSize,
            size,
        )
    }

fun arrowStrokeWidth(kind: DiagramArrowKind, geometry: DiagramGeometry): Float =
    if (kind == DiagramArrowKind.Shot) {
        geometry.unit * Proportions.SHOT_STROKE
    } else {
        geometry.unit * Proportions.DEFAULT_STROKE
    }

fun arrowPathPoints(arrow: DiagramArrow, geometry: DiagramGeometry): List<DiagramPoint> =
    if (arrow.kind == DiagramArrowKind.Dribble) {
        wavyPoints(
            arrow.points,
            geometry.unit * Proportions.DRIBBLE_AMPLITUDE,
            geometry.unit * Proportions.DRIBBLE_WAVELENGTH,
        )
    } else {
        arrow.points
    }

/** SVG auto-orientation also skips zero-length terminal segments. */
internal fun arrowHeadAngle(points: List<DiagramPoint>): Float {
    val tip = points.lastOrNull() ?: return 0f
    val x = tip.x.toFloat()
    val y = tip.y.toFloat()
    for (index in points.size - 2 downTo 0) {
        val dx = x - points[index].x.toFloat()
        val dy = y - points[index].y.toFloat()
        if (dx != 0f || dy != 0f) return atan2(dy, dx)
    }
    // With no direction, retain the deterministic zero-angle SVG fallback.
    return 0f
}

fun arrowDashIntervals(kind: DiagramArrowKind, geometry: DiagramGeometry): FloatArray? =
    if (kind == DiagramArrowKind.Run) {
        floatArrayOf(
            geometry.unit * Proportions.RUN_DASH_ON,
            geometry.unit * Proportions.RUN_DASH_OFF,
        )
    } else {
        null
    }

fun DiagramGeometry.pixelsPerMetre(canvasWidth: Float, canvasHeight: Float): Float =
    min(canvasWidth / viewportWidth, canvasHeight / viewportHeight)
