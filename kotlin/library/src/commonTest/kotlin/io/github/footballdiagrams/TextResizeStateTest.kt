package io.github.footballdiagrams

import androidx.compose.ui.unit.IntSize
import kotlin.test.Test
import kotlin.test.assertEquals

class TextResizeStateTest {
    @Test fun staleSettlesCannotReplaceTheReferenceAfterALargeJump() {
        val g = diagramGeometry(DiagramArea(40.0, 30.0))
        val state = DiagramTextResizeState(g)
        state.onSizeChanged(IntSize(600, 472))
        val obsolete = IntSize(601, 473)
        state.onSizeChanged(obsolete)
        val current = IntSize(300, 236)
        state.onSizeChanged(current)
        val scale = g.pixelsPerMetre(300f, 236f)
        state.settle(obsolete)
        assertEquals(scale, state.scaleForDraw(scale * 1.01f))
        state.onSizeChanged(IntSize.Zero)
        state.settle(IntSize.Zero)
        assertEquals(0f, state.scaleForDraw(0f))
        state.onSizeChanged(current)
        assertEquals(scale, state.scaleForDraw(scale))
    }

    @Test fun missingSizeCallbacksAndOutOfBandScalesFallBackToExactDrawing() {
        val g = diagramGeometry(DiagramArea(40.0, 30.0))
        val state = DiagramTextResizeState(g)
        assertEquals(10f, state.scaleForDraw(10f))
        state.onSizeChanged(IntSize(600, 472))
        val initial = g.pixelsPerMetre(600f, 472f)
        assertEquals(initial * 2f, state.scaleForDraw(initial * 2f))
        assertEquals(initial / 2f, state.scaleForDraw(initial / 2f))
    }
}
