package io.github.footballdiagrams

import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.layout
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.constrainHeight
import androidx.compose.ui.unit.constrainWidth
import kotlin.math.max
import kotlin.math.roundToInt

/** Width is normally fixed by fillMaxWidth. Constrain the preferred natural
 * height instead of forcing an impossible aspect beyond the host's bounds.
 * The draw scale then fits the unchanged metre geometry inside that Canvas. */
internal fun Modifier.diagramCanvasAspect(ratio: Float): Modifier = layout { measurable, incoming ->
    val placeable = measurable.measure(diagramCanvasConstraints(incoming, ratio))
    layout(placeable.width, placeable.height) { placeable.placeRelative(0, 0) }
}

internal fun diagramCanvasConstraints(incoming: Constraints, ratio: Float): Constraints {
    require(ratio.isFinite() && ratio > 0f) { "Diagram aspect must be finite and positive" }
    val preferredWidth = when {
        incoming.hasBoundedWidth -> incoming.maxWidth
        incoming.hasBoundedHeight -> (incoming.maxHeight * ratio).roundToInt()
        else -> max(incoming.minWidth, (incoming.minHeight * ratio).roundToInt())
    }
    val width = incoming.constrainWidth(preferredWidth)
    val height = incoming.constrainHeight((width / ratio).roundToInt())
    // Derived dimensions must also fit Compose's packed Constraints format,
    // including when one incoming axis is unbounded.
    return if (incoming.hasBoundedWidth) Constraints.fitPrioritizingWidth(width, width, height, height)
    else Constraints.fitPrioritizingHeight(width, width, height, height)
}
