package io.github.footballdiagrams

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
    }
}
