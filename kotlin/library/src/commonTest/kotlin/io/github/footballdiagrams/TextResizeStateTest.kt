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
        val obsoleteRequest = state.request
        val current = IntSize(300, 236)
        state.onSizeChanged(current)
        val scale = g.pixelsPerMetre(300f, 236f)
        state.settle(obsoleteRequest)
        assertEquals(scale, state.scaleForDraw(scale * 1.01f))
        state.onSizeChanged(IntSize.Zero)
        state.settle(state.request)
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

    @Test fun roundTripSizesCannotReviveAnOldQuietPeriodRequest() {
        val g = diagramGeometry(DiagramArea(40.0, 30.0))
        val state = DiagramTextResizeState(g)
        state.onSizeChanged(IntSize(600, 472))
        val reference = g.pixelsPerMetre(600f, 472f)
        val target = IntSize(601, 473)
        state.onSizeChanged(target)
        val obsolete = state.request
        state.onSizeChanged(IntSize(602, 474))
        state.onSizeChanged(target)
        val actual = g.pixelsPerMetre(601f, 473f)
        state.settle(obsolete)
        assertEquals(reference, state.scaleForDraw(actual))
        state.settle(state.request)
        assertEquals(actual, state.scaleForDraw(actual))
    }
}
