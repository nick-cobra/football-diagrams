package io.github.footballdiagrams

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.unit.IntSize
import kotlinx.coroutines.delay

/** One reference scale during small continuous resizes, then exact settled text.
 * Large jumps remeasure immediately. No size/layout history or retained paragraphs. */
internal class DiagramTextResizeState(private val geometry: DiagramGeometry) {
    var size by mutableStateOf(IntSize.Zero)
        private set
    private var referenceScale by mutableFloatStateOf(Float.NaN)
    // Read this plain value in the layout callback, avoiding a layout dependency
    // on the draw-phase state that the quiet-period effect updates.
    private var committedScale = Float.NaN

    fun onSizeChanged(size: IntSize) {
        this.size = size
        val actual = scale(size)
        if (actual > 0f && (!committedScale.isFinite() || actual / committedScale !in 0.8f..1.25f)) commit(actual)
    }

    fun scaleForDraw(actual: Float): Float {
        val reference = referenceScale
        return if (actual > 0f && reference.isFinite() && reference > 0f && actual / reference in 0.8f..1.25f) reference else actual
    }

    fun settle(expectedSize: IntSize) {
        // Also guard a stale effect before cancellation has reached its delay.
        if (size == expectedSize) scale(expectedSize).takeIf { it > 0f }?.let(::commit)
    }

    private fun scale(size: IntSize) = geometry.pixelsPerMetre(size.width.toFloat(), size.height.toFloat())
    private fun commit(scale: Float) {
        if (committedScale != scale) {
            committedScale = scale
            referenceScale = scale
        }
    }
}

@Composable
internal fun rememberDiagramTextResizeState(geometry: DiagramGeometry): DiagramTextResizeState {
    val state = remember(geometry) { DiagramTextResizeState(geometry) }
    val size = state.size
    LaunchedEffect(state, size) {
        if (size.width > 0 && size.height > 0) {
            delay(120)
            state.settle(size)
        }
    }
    return state
}
