// Compose paint code, dense with dimension literals by nature — the same reason
// DrawScope extensions rather than composables, so the exemption does not reach
// them, but the rationale is identical: every number here is a proportion of the
// ninety of them one-per-use would obscure the shapes rather than explain them.
// The geometry that is REUSED across glyphs is named, in DiagramGeometry.kt.
@file:Suppress("MagicNumber")

package io.github.footballdiagrams

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.TextUnitType
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

private val GrassLight = Color(0xFF5AA25A)
private val GrassDark = Color(0xFF529952)

private val OutsideWash = Color(0x330C2A0C)
private val LinePaint = Color(0xEBFFFFFF)
private val Ink = Color(0xFF22303F)

private val ObjectColours = mapOf(
    DiagramColour.Red to Color(0xFFE04545),
    DiagramColour.Blue to Color(0xFF2F7DF6),
    DiagramColour.Yellow to Color(0xFFF5C518),
    DiagramColour.Green to Color(0xFF2E8B57),
    DiagramColour.Orange to Color(0xFFF08C2E),
    DiagramColour.White to Color(0xFFFFFFFF),
    DiagramColour.Teal to Color(0xFF14B8A6),
)

private val KindFill = mapOf(
    DiagramObjectKind.Player to Color(0xFF1D6FF2),
    DiagramObjectKind.Opponent to Color(0xFFE04545),
    DiagramObjectKind.Neutral to Color(0xFFF0B429),
    DiagramObjectKind.Coach to Color(0xFF223047),
)

@Composable
fun FootballDiagram(
    diagram: Diagram,
    frameIndex: Int,
    modifier: Modifier = Modifier,
) {
    val frame = diagram.frames.getOrNull(frameIndex) ?: return
    val geometry = remember(diagram.area) { diagramGeometry(diagram.area) }
    val labels = remember(diagram.area, frame) { layoutDiagramLabels(diagram.area, frame, geometry) }
    val textMeasurer = rememberTextMeasurer()
    val description = "${diagram.title} — ${frame.title}"

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(geometry.aspectRatio)
            .clipToBounds()
            .semantics { contentDescription = description },
    ) {
        val scale = geometry.pixelsPerMetre(size.width, size.height)
        // Metre space has its origin at the grid's corner; the margin sits
        // outside it, so the whole drawing is shifted by one margin.
        translate(geometry.marginMetres * scale, geometry.marginMetres * scale) {
            drawGrass(geometry, scale)
            drawGrid(geometry, scale)
            drawSubAreas(frame, geometry, scale)
            frame.objects.forEach { drawEquipment(it, geometry, scale) }
            frame.arrows.forEach { drawArrow(it, geometry, scale) }
            frame.objects.forEach { drawPerson(it, frame, geometry, scale) }
            labels.forEach { drawLabel(it, geometry, scale, textMeasurer) }
        }
    }
}

private fun DrawScope.drawGrass(geometry: DiagramGeometry, scale: Float) {
    val margin = geometry.marginMetres
    for (stripe in grassStripes(geometry)) {
        drawRect(
            color = if (stripe.light) GrassLight else GrassDark,
            topLeft = Offset(stripe.x * scale, -margin * scale),
            size = Size(stripe.width * scale, geometry.viewportHeight * scale),
        )
    }
}

private fun DrawScope.drawGrid(geometry: DiagramGeometry, scale: Float) {
    val margin = geometry.marginMetres
    val length = geometry.lengthMetres
    val width = geometry.widthMetres
    // Wash the border only, as four bands around the grid. The obvious version —
    // wash everything, then clear the grid back — needs its own layer to work:
    // BlendMode.Clear against the window punches a transparent hole instead of
    // revealing the grass underneath.
    val wash = listOf(
        // Top, bottom, left, right bands around the playing grid.
        Offset(-margin, -margin) to Size(geometry.viewportWidth, margin),
        Offset(-margin, width) to Size(geometry.viewportWidth, margin),
        Offset(-margin, 0f) to Size(margin, width),
        Offset(length, 0f) to Size(margin, width),
    )
    wash.forEach { (topLeft, size) ->
        drawRect(
            color = OutsideWash,
            topLeft = Offset(topLeft.x * scale, topLeft.y * scale),
            size = Size(size.width * scale, size.height * scale),
        )
    }
    drawRect(
        color = LinePaint,
        topLeft = Offset(0f, 0f),
        size = Size(geometry.lengthMetres * scale, geometry.widthMetres * scale),
        style = Stroke(width = geometry.unit * 0.16f * scale),
    )
}

private fun DrawScope.drawSubAreas(frame: DiagramFrame, geometry: DiagramGeometry, scale: Float) {
    frame.areas.forEach { area ->
        val colour = area.colour?.let { ObjectColours[it] } ?: LinePaint
        drawRect(
            color = colour.copy(alpha = 0.13f),
            topLeft = Offset(area.x.toFloat() * scale, area.y.toFloat() * scale),
            size = Size(area.width.toFloat() * scale, area.height.toFloat() * scale),
        )
        drawRect(
            color = colour,
            topLeft = Offset(area.x.toFloat() * scale, area.y.toFloat() * scale),
            size = Size(area.width.toFloat() * scale, area.height.toFloat() * scale),
            style = Stroke(
                width = geometry.unit * 0.1f * scale,
                pathEffect = PathEffect.dashPathEffect(
                    floatArrayOf(geometry.unit * 0.5f * scale, geometry.unit * 0.4f * scale),
                ),
            ),
        )
    }
}

private fun DrawScope.drawCone(at: DiagramPoint, size: Float, colour: Color, unit: Float, scale: Float) {
    drawOval(
        color = Color(0x38000000),
        topLeft = Offset((at.x.toFloat() - size * 0.78f) * scale, (at.y.toFloat() + size * 0.62f - size * 0.3f) * scale),
        size = Size(size * 1.56f * scale, size * 0.6f * scale),
    )
    val path = Path().apply {
        moveTo(at.x.toFloat() * scale, (at.y.toFloat() - size) * scale)
        lineTo((at.x.toFloat() + size * 0.8f) * scale, (at.y.toFloat() + size * 0.62f) * scale)
        lineTo((at.x.toFloat() - size * 0.8f) * scale, (at.y.toFloat() + size * 0.62f) * scale)
        close()
    }
    drawPath(path, colour)
    drawPath(path, Color.White, style = Stroke(width = unit * 0.1f * scale))
}

internal fun DrawScope.drawEquipment(target: DiagramObject, geometry: DiagramGeometry, scale: Float) {
    val colour = target.colour?.let { ObjectColours[it] } ?: ObjectColours.getValue(DiagramColour.Orange)
    when (target.kind) {
        DiagramObjectKind.Gate -> drawGate(target, colour, geometry, scale)
        DiagramObjectKind.Cone ->
            drawCone(DiagramPoint(target.x.toFloat(), target.y.toFloat()), geometry.playerRadius * 0.8f, colour, geometry.unit, scale)
        DiagramObjectKind.FlatMarker -> drawFlatMarker(target, colour, geometry, scale)
        DiagramObjectKind.Mannequin -> drawMannequin(target, geometry, scale)
        DiagramObjectKind.Pole -> drawPole(target, geometry, scale)
        DiagramObjectKind.Ladder -> drawLadder(target, geometry, scale)
        DiagramObjectKind.Goal, DiagramObjectKind.MiniGoal -> drawGoal(target, geometry, scale)
        else -> Unit
    }
}

private fun DrawScope.drawFlatMarker(
    target: DiagramObject,
    colour: Color,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val radius = geometry.playerRadius
    drawOval(
        color = colour,
        topLeft = Offset((target.x.toFloat() - radius * 0.5f) * scale, (target.y.toFloat() - radius * 0.26f) * scale),
        size = Size(radius * scale, radius * 0.52f * scale),
        style = Stroke(width = geometry.unit * 0.16f * scale),
    )
}

private fun DrawScope.drawGate(
    target: DiagramObject,
    colour: Color,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val unit = geometry.unit
    val radius = geometry.playerRadius
    val (first, second) = gateCones(target)
    // The colour band appears only when the gate's colour is the call.
    if (target.colour != null && target.colour != DiagramColour.Orange) {
        val band = Path().apply {
            val angle = (target.angleDegrees?.toFloat() ?: 0f) * PI.toFloat() / 180f
            val px = -sin(angle)
            val py = cos(angle)
            val w = radius * 0.9f
            moveTo((first.x.toFloat() + px * w) * scale, (first.y.toFloat() + py * w) * scale)
            lineTo((second.x.toFloat() + px * w) * scale, (second.y.toFloat() + py * w) * scale)
            lineTo((second.x.toFloat() - px * w) * scale, (second.y.toFloat() - py * w) * scale)
            lineTo((first.x.toFloat() - px * w) * scale, (first.y.toFloat() - py * w) * scale)
            close()
        }
        drawPath(band, Color.White.copy(alpha = 0.55f))
        drawPath(band, colour.copy(alpha = 0.45f))
    }
    drawCone(first, radius * 0.8f, colour, unit, scale)
    drawCone(second, radius * 0.8f, colour, unit, scale)
}

// Fixed kit colours: a mannequin is a mannequin, a ladder is a ladder. The
// object's own colour applies to cones, gates and flat markers only.
private fun DrawScope.drawMannequin(
    target: DiagramObject,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val radius = geometry.playerRadius
    val w = radius
    val h = radius * 2.2f
    drawOval(
        color = Color(0x38000000),
        topLeft = Offset((target.x.toFloat() - w * 0.75f) * scale, (target.y.toFloat() + h / 2f - w * 0.32f) * scale),
        size = Size(w * 1.5f * scale, w * 0.64f * scale),
    )
    drawRoundRect(
        color = Color(0xFF2B3A4D),
        topLeft = Offset((target.x.toFloat() - w / 2f) * scale, (target.y.toFloat() - h / 2f) * scale),
        size = Size(w * scale, h * scale),
        cornerRadius = androidx.compose.ui.geometry.CornerRadius(w / 2f * scale),
    )
    drawCircle(
        color = Color(0xFF2B3A4D),
        radius = w * 0.42f * scale,
        center = Offset(target.x.toFloat() * scale, (target.y.toFloat() - h / 2f - w * 0.1f) * scale),
    )
}

// Fixed kit colours: a mannequin is a mannequin, a ladder is a ladder. The
// object's own colour applies to cones, gates and flat markers only.
private fun DrawScope.drawPole(
    target: DiagramObject,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val unit = geometry.unit
    val radius = geometry.playerRadius
    drawLine(
        color = Color(0xFFF0E13C),
        start = Offset(target.x.toFloat() * scale, (target.y.toFloat() - radius * 1.2f) * scale),
        end = Offset(target.x.toFloat() * scale, (target.y.toFloat() + radius * 1.2f) * scale),
        strokeWidth = unit * 0.16f * scale,
    )
    drawCircle(
        color = Color(0xFFF0E13C),
        radius = unit * 0.2f * scale,
        center = Offset(target.x.toFloat() * scale, (target.y.toFloat() - radius * 1.2f) * scale),
    )
}

// Fixed kit colours: a mannequin is a mannequin, a ladder is a ladder. The
// object's own colour applies to cones, gates and flat markers only.
private fun DrawScope.drawLadder(
    target: DiagramObject,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val unit = geometry.unit
    val radius = geometry.playerRadius
    val w = radius * 3.4f
    val h = radius * 1.15f
    val rungColour = Color(0xFFFFD23C)
    drawRect(
        color = rungColour,
        topLeft = Offset((target.x.toFloat() - w / 2f) * scale, (target.y.toFloat() - h / 2f) * scale),
        size = Size(w * scale, h * scale),
        style = Stroke(width = unit * 0.13f * scale),
    )
    for (i in 1..3) {
        val x = (target.x.toFloat() - w / 2f + w * i / 4f) * scale
        drawLine(
            color = rungColour,
            start = Offset(x, (target.y.toFloat() - h / 2f) * scale),
            end = Offset(x, (target.y.toFloat() + h / 2f) * scale),
            strokeWidth = unit * 0.13f * scale,
        )
    }
}

// Fixed kit colours: a mannequin is a mannequin, a ladder is a ladder. The
// object's own colour applies to cones, gates and flat markers only.
private fun DrawScope.drawGoal(
    target: DiagramObject,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val unit = geometry.unit
    val mouth = target.widthMetres?.toFloat() ?: if (target.kind == DiagramObjectKind.Goal) 6f else 2.4f
    val depth = if (target.kind == DiagramObjectKind.Goal) 1.4f else 0.9f
    drawRect(
        color = Color(0xE6FFFFFF),
        topLeft = Offset(target.x.toFloat() * scale, (target.y.toFloat() - mouth / 2f) * scale),
        size = Size(depth * scale, mouth * scale),
    )
    drawRect(
        color = Ink,
        topLeft = Offset(target.x.toFloat() * scale, (target.y.toFloat() - mouth / 2f) * scale),
        size = Size(depth * scale, mouth * scale),
        style = Stroke(width = unit * 0.09f * scale),
    )
    val net = Color(0xFF8B97A5)
    for (i in 1..4) {
        val y = (target.y.toFloat() - mouth / 2f + mouth * i / 5f) * scale
        drawLine(net, Offset(target.x.toFloat() * scale, y), Offset((target.x.toFloat() + depth) * scale, y), unit * 0.045f * scale)
    }
}
private fun DrawScope.drawBall(at: DiagramPoint, radius: Float, unit: Float, scale: Float) {
    val centre = Offset(at.x.toFloat() * scale, at.y.toFloat() * scale)
    drawCircle(Color.White, radius * scale, centre)
    drawCircle(Ink, radius * scale, centre, style = Stroke(width = unit * 0.07f * scale))
    drawCircle(Ink, radius * 0.34f * scale, centre)
    for (i in 0 until 5) {
        val angle = -PI.toFloat() / 2f + i * 2f * PI.toFloat() / 5f
        drawCircle(
            color = Ink,
            radius = radius * 0.14f * scale,
            center = Offset(
                centre.x + cos(angle) * radius * 0.68f * scale,
                centre.y + sin(angle) * radius * 0.68f * scale,
            ),
        )
    }
}

private fun shade(colour: Color, factor: Float): Color =
    Color(colour.red * factor, colour.green * factor, colour.blue * factor, colour.alpha)

internal fun DrawScope.drawPerson(
    target: DiagramObject,
    frame: DiagramFrame,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val radius = geometry.playerRadius
    val unit = geometry.unit

    if (target.kind == DiagramObjectKind.Ball) {
        drawBall(DiagramPoint(target.x.toFloat(), target.y.toFloat()), radius * 0.55f, unit, scale)
        return
    }
    if (!target.kind.isPerson) return

    val fill = target.colour?.let { ObjectColours[it] }
        ?: KindFill[target.kind]
        ?: KindFill.getValue(DiagramObjectKind.Player)

    drawOval(
        color = Color(0x40000000),
        topLeft = Offset((target.x.toFloat() - radius * 0.95f) * scale, (target.y.toFloat() + radius * 0.78f - radius * 0.38f) * scale),
        size = Size(radius * 1.9f * scale, radius * 0.76f * scale),
    )
    if (isMover(target, frame, geometry)) {
        drawCircle(
            color = Color.White.copy(alpha = 0.85f),
            radius = radius * 1.42f * scale,
            center = Offset(target.x.toFloat() * scale, target.y.toFloat() * scale),
            style = Stroke(width = unit * 0.14f * scale),
        )
    }
    // Shoulders, then head: a person seen from above, not a token.
    val shoulders = Offset((target.x.toFloat() - radius) * scale, (target.y.toFloat() + radius * 0.18f - radius * 0.66f) * scale)
    val shoulderSize = Size(radius * 2f * scale, radius * 1.32f * scale)
    drawOval(fill, shoulders, shoulderSize)
    drawOval(Color.White, shoulders, shoulderSize, style = Stroke(width = unit * 0.11f * scale))
    val head = Offset(target.x.toFloat() * scale, (target.y.toFloat() - radius * 0.34f) * scale)
    drawCircle(shade(fill, 0.78f), radius * 0.5f * scale, head)
    drawCircle(Color.White, radius * 0.5f * scale, head, style = Stroke(width = unit * 0.09f * scale))

    if (target.hasBall) {
        drawBall(DiagramPoint(target.x.toFloat() + radius * 1.25f, target.y.toFloat() + radius * 0.7f), radius * 0.55f, unit, scale)
    }
}

private fun DrawScope.drawArrow(
    arrow: DiagramArrow,
    geometry: DiagramGeometry,
    scale: Float,
) {
    val points = renderArrowPathPoints(arrow, geometry)
    if (points.size < 2) return
    val width = arrowStrokeWidth(arrow.kind, geometry)
    val path = Path().apply {
        moveTo(points.first().x.toFloat() * scale, points.first().y.toFloat() * scale)
        points.drop(1).forEach { lineTo(it.x.toFloat() * scale, it.y.toFloat() * scale) }
    }
    val dash = arrowDashIntervals(arrow.kind, geometry)
        ?.map { it * scale }?.toFloatArray()
        ?.let { PathEffect.dashPathEffect(it) }

    // Shadow first so a white arrow stays legible over grass.
    translate(0.12f * scale, 0.16f * scale) {
        drawPath(
            path,
            Color(0x47000000),
            style = Stroke(width = (width + geometry.unit * 0.1f) * scale, pathEffect = dash),
        )
    }
    drawPath(path, Color.White, style = Stroke(width = width * scale, pathEffect = dash))

    // Arrowhead, aimed along the final nonzero segment in drawing precision.
    val tip = points.last()
    val angle = arrowHeadAngle(points)
    val headLength = geometry.unit * (if (arrow.kind == DiagramArrowKind.Shot) 1.1f else 1.4f)
    val spread = 0.42f
    val head = Path().apply {
        moveTo(tip.x.toFloat() * scale, tip.y.toFloat() * scale)
        lineTo(
            (tip.x.toFloat() - cos(angle - spread) * headLength) * scale,
            (tip.y.toFloat() - sin(angle - spread) * headLength) * scale,
        )
        lineTo(
            (tip.x.toFloat() - cos(angle + spread) * headLength) * scale,
            (tip.y.toFloat() - sin(angle + spread) * headLength) * scale,
        )
        close()
    }
    drawPath(head, Color.White)
}

private fun DrawScope.drawLabel(
    label: DiagramLabel,
    geometry: DiagramGeometry,
    scale: Float,
    textMeasurer: TextMeasurer,
) {
    var style = TextStyle(
        color = Ink,
        fontSize = TextUnit(
            labelFontSizeSp(label.fontSize, scale, density, fontScale),
            TextUnitType.Sp,
        ),
        fontWeight = FontWeight.Bold,
    )
    var measured = textMeasurer.measure(label.text, style)
    if (label.isBadge) {
        val radius = label.width / 2f
        val centre = Offset((label.x + radius) * scale, (label.y + radius) * scale)
        drawCircle(Color.White, radius * scale, centre)
        drawCircle(Ink, radius * scale, centre, style = Stroke(width = radius * 0.14f * scale))
        drawText(
            textLayoutResult = measured,
            topLeft = Offset(
                (label.x + label.width / 2f) * scale - measured.size.width / 2f,
                (label.y + label.height / 2f) * scale - measured.size.height / 2f,
            ),
        )
        return
    }

    val fitScale = labelFitScale(
        geometry = geometry,
        label = label,
        scale = scale,
        measuredWidth = measured.size.width.toFloat(),
        measuredHeight = measured.size.height.toFloat(),
    )
    if (fitScale < 1f) {
        style = style.copy(fontSize = TextUnit(style.fontSize.value * fitScale, TextUnitType.Sp))
        measured = textMeasurer.measure(label.text, style)
    }

    val bounds = labelPillBounds(
        geometry = geometry,
        label = label,
        scale = scale,
        measuredWidth = measured.size.width.toFloat(),
        measuredHeight = measured.size.height.toFloat(),
    )

    drawRoundRect(
        color = Color(0xEDFFFFFF),
        topLeft = Offset(bounds.left, bounds.top),
        size = Size(bounds.width, bounds.height),
        cornerRadius = androidx.compose.ui.geometry.CornerRadius(bounds.height / 2f),
    )
    clipRect(left = bounds.left, top = bounds.top, right = bounds.right, bottom = bounds.bottom) {
        drawText(
            textLayoutResult = measured,
            topLeft = Offset(bounds.textLeft, bounds.textTop),
        )
    }
}

data class DiagramLabelPillBounds(
    val left: Float,
    val top: Float,
    val right: Float,
    val bottom: Float,
    val textLeft: Float,
    val textTop: Float,
    val textRight: Float,
    val textBottom: Float,
) {
    val width: Float get() = right - left
    val height: Float get() = bottom - top
}

fun labelFontSizeSp(
    labelFontSize: Float,
    scale: Float,
    density: Float,
    fontScale: Float,
): Float = labelFontSize * scale * LABEL_FONT_SCALE / density / fontScale

fun labelFitScale(
    geometry: DiagramGeometry,
    label: DiagramLabel,
    scale: Float,
    measuredWidth: Float,
    measuredHeight: Float,
): Float {
    val horizontalPadding = label.fontSize * scale * LABEL_HORIZONTAL_PADDING
    val verticalPadding = label.fontSize * scale * LABEL_VERTICAL_PADDING
    val viewportWidth = geometry.viewportWidth * scale
    val viewportHeight = geometry.viewportHeight * scale
    return minOf(
        1f,
        (viewportWidth - horizontalPadding * 2f).coerceAtLeast(1f) / measuredWidth.coerceAtLeast(1f),
        (viewportHeight - verticalPadding * 2f).coerceAtLeast(1f) / measuredHeight.coerceAtLeast(1f),
    )
}

fun labelPillBounds(
    geometry: DiagramGeometry,
    label: DiagramLabel,
    scale: Float,
    measuredWidth: Float,
    measuredHeight: Float,
): DiagramLabelPillBounds {
    val horizontalPadding = label.fontSize * scale * LABEL_HORIZONTAL_PADDING
    val verticalPadding = label.fontSize * scale * LABEL_VERTICAL_PADDING
    val minX = -geometry.marginMetres * scale
    val minY = -geometry.marginMetres * scale
    val maxX = (geometry.lengthMetres + geometry.marginMetres) * scale
    val maxY = (geometry.widthMetres + geometry.marginMetres) * scale
    val pillWidth = measuredWidth + horizontalPadding * 2f
    val pillHeight = measuredHeight + verticalPadding * 2f
    val wantedCentreX = (label.x + label.width / 2f) * scale
    val wantedCentreY = (label.y + label.height / 2f) * scale
    val left = (wantedCentreX - pillWidth / 2f).coerceIn(minX, (maxX - pillWidth).coerceAtLeast(minX))
    val top = (wantedCentreY - pillHeight / 2f).coerceIn(minY, (maxY - pillHeight).coerceAtLeast(minY))
    val textLeft = left + (pillWidth - measuredWidth) / 2f
    val textTop = top + (pillHeight - measuredHeight) / 2f
    return DiagramLabelPillBounds(
        left = left,
        top = top,
        right = left + pillWidth,
        bottom = top + pillHeight,
        textLeft = textLeft,
        textTop = textTop,
        textRight = textLeft + measuredWidth,
        textBottom = textTop + measuredHeight,
    )
}

private const val LABEL_HORIZONTAL_PADDING = 0.9f
private const val LABEL_VERTICAL_PADDING = 0.35f
private const val LABEL_FONT_SCALE = 0.92f
