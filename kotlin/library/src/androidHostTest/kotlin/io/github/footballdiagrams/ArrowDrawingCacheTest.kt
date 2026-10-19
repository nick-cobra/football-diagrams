package io.github.footballdiagrams

import android.graphics.Bitmap
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.test.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class ArrowDrawingCacheTest {
    @Test fun redrawsReusePreparedGeometryAndPathsWhileResizingRebuildsOnlyScaledDrawing() {
        val g = diagramGeometry(DiagramArea(40.0, 30.0))
        var reads = 0
        val positions = listOf(DiagramPoint(2.0, 3.0), DiagramPoint(25.0, 5.0))
        val counted = object : AbstractList<DiagramPoint>() {
            override val size get() = positions.size
            override fun get(index: Int): DiagramPoint { reads++; return positions[index] }
        }
        val cache = ArrowDrawingCache(listOf(DiagramArrow(DiagramArrowKind.Dribble, counted)), g)
        val first = cache.atScale(10f)
        val generated = reads
        assertTrue(generated > 0)
        repeat(5) { assertSame(first, cache.atScale(10f)) }
        assertEquals(generated, reads, "Unchanged redraws must not regenerate arrow points")
        val resized = cache.atScale(20f)
        assertNotSame(first, resized)
        assertNotSame(first.single().path, resized.single().path)
        assertEquals(first.single().stroke.width * 2, resized.single().stroke.width)
        assertSame(resized, cache.atScale(20f))
        assertEquals(generated, reads, "A resize should reuse metre-space points")
        val restored = cache.atScale(10f)
        assertNotSame(first, restored, "Only the most recent scale is retained")
        assertEquals(first.single().path.getBounds(), restored.single().path.getBounds())
        val beforeViewportChange = reads
        val expanded = cache.atScale(10f, g.viewportWidth + 20f, g.viewportHeight)
        assertNotSame(restored, expanded, "Viewport changes invalidate even when scale stays the same")
        assertTrue(reads > beforeViewportChange)
        assertSame(expanded, cache.atScale(10f, g.viewportWidth + 20f, g.viewportHeight))
        assertTrue(cache.atScale(0f).isEmpty())
    }

    @Test fun constrainedCanvasKeepsAllVisibleWavePixels() {
        val g = diagramGeometry(DiagramArea(1.0, 1.0))
        val arrow = DiagramArrow(DiagramArrowKind.Dribble, listOf(DiagramPoint(-1000.0, 0.0), DiagramPoint(1000.0, 0.0)))
        val scale = g.pixelsPerMetre(600f, 100f)
        val viewportWidth = 600f / scale
        val viewportHeight = 100f / scale
        fun paint(cache: ArrowDrawingCache): IntArray {
            val bitmap = Bitmap.createBitmap(600, 100, Bitmap.Config.ARGB_8888)
            CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(android.graphics.Canvas(bitmap)), Size(600f, 100f)) {
                translate(g.marginMetres * scale, g.marginMetres * scale) {
                    cache.atScale(scale, viewportWidth, viewportHeight).forEach { drawArrow(it, scale) }
                }
            }
            return IntArray(600 * 100).also { bitmap.getPixels(it, 0, 600, 0, 0, 600, 100) }
        }
        // Pass and dribble share strokes/head shape. Supplying the full sampled
        // polyline as a pass bypasses renderer sampling in the reference image.
        val full = ArrowDrawingCache(listOf(DiagramArrow(DiagramArrowKind.Pass, arrowPathPoints(arrow, g))), g)
        val expected = paint(full)
        val actual = paint(ArrowDrawingCache(listOf(arrow), g))
        assertTrue(expected.any { it != 0 }, "Reference arrow must actually paint")
        assertEquals(0, actual.indices.count { actual[it] != expected[it] }, "Viewport reduction must preserve every native-Skia pixel")
    }

}
