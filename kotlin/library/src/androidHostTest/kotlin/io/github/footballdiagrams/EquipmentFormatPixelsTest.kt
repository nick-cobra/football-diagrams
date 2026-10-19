package io.github.footballdiagrams

import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.math.abs
import kotlin.math.roundToInt
import kotlin.math.sqrt
import kotlin.test.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
@GraphicsMode(GraphicsMode.Mode.NATIVE)
class EquipmentFormatPixelsTest {
    private val geometry = diagramGeometry(DiagramArea(30.0, 24.0))
    private val scale = 24f
    // Independent mouth and net unit vectors in authored metres.
    private val axes = listOf(
        Triple(null, Pair(0.0, 1.0), Pair(1.0, 0.0)),
        Triple(0.0, Pair(1.0, 0.0), Pair(0.0, -1.0)),
        Triple(90.0, Pair(0.0, 1.0), Pair(1.0, 0.0)),
        Triple(180.0, Pair(-1.0, 0.0), Pair(0.0, 1.0)),
        Triple(270.0, Pair(0.0, -1.0), Pair(-1.0, 0.0)),
        Triple(45.0, Pair(sqrt(.5), sqrt(.5)), Pair(sqrt(.5), -sqrt(.5))),
    )

    @Test fun completeGoalMouthAndNetFollowAuthoredAxesWithoutMovingTheCentre() {
        for (kind in listOf(DiagramObjectKind.Goal, DiagramObjectKind.MiniGoal)) for ((angle, mouth, net) in axes) {
            val target = DiagramObject(kind, 12.0, 12.0, angleDegrees = angle, widthMetres = 4.0)
            val bitmap = render(target, 2)
            val depth = if (kind == DiagramObjectKind.Goal) 1.4 else .9
            fun at(a: Double, b: Double) = Pair(12 + mouth.first * a + net.first * b, 12 + mouth.second * a + net.second * b)
            val corners = listOf(at(-2.0, 0.0), at(2.0, 0.0), at(-2.0, depth), at(2.0, depth))
            val occupied = pixels(bitmap).filter { AndroidColor.alpha(it.third) > 20 }
            assertTrue(occupied.isNotEmpty())
            assertEquals(corners.minOf { it.first } * scale, occupied.minOf { it.first }.toDouble(), 3.0, "$kind/$angle left")
            assertEquals(corners.maxOf { it.first } * scale, occupied.maxOf { it.first }.toDouble(), 3.0, "$kind/$angle right")
            assertEquals(corners.minOf { it.second } * scale, occupied.minOf { it.second }.toDouble(), 3.0, "$kind/$angle top")
            assertEquals(corners.maxOf { it.second } * scale, occupied.maxOf { it.second }.toDouble(), 3.0, "$kind/$angle bottom")
            // All four interior net lines must reach both edges of the rotated net.
            for (i in 1..4) for (fraction in listOf(.15, .5, .85)) {
                val point = at(-2.0 + 4.0 * i / 5, depth * fraction)
                assertTrue(nearPixel(bitmap, point) { c ->
                    AndroidColor.alpha(c) > 150 && abs(AndroidColor.red(c) - 139) < 45 && abs(AndroidColor.green(c) - 151) < 45 && abs(AndroidColor.blue(c) - 165) < 45
                }, "$kind/$angle net line $i/$fraction missing")
            }
            assertContentEquals(pixels(render(target, 1)).map { it.third }, pixels(render(target.copy(angleDegrees = 90.0), 1)).map { it.third }, "Legacy goal angles remain ignored")
        }
        for (kind in listOf(DiagramObjectKind.Goal, DiagramObjectKind.MiniGoal)) {
            assertContentEquals(pixels(render(DiagramObject(kind, 12.0, 12.0), 1)).map { it.third }, pixels(render(DiagramObject(kind, 12.0, 12.0), 2)).map { it.third })
        }
    }

    @Test fun gateConesAndColourBandUseTheSameWidthAtEveryAxis() {
        for ((angle, axis) in listOf(0.0 to Pair(1.0, 0.0), 90.0 to Pair(0.0, 1.0), 45.0 to Pair(sqrt(.5), sqrt(.5)))) {
            for (width in listOf(2.0, 3.0, 4.0, null)) for (version in listOf(1, 2)) {
                val target = DiagramObject(DiagramObjectKind.Gate, 12.0, 12.0, colour = DiagramColour.Yellow, angleDegrees = angle, widthMetres = width)
                val bitmap = render(target, version)
                val gap = if (version == 2) width ?: 2.1 else 2.1
                val coneSize = geometry.playerRadius * .8
                for (sign in listOf(-1, 1)) {
                    val centre = Pair(12 + sign * axis.first * gap / 2, 12 + sign * axis.second * gap / 2)
                    assertTrue(nearPixel(bitmap, Pair(centre.first, centre.second - coneSize * .6)) { c ->
                        AndroidColor.red(c) > 220 && AndroidColor.green(c) in 170..220 && AndroidColor.blue(c) < 60
                    }, "Gate $version/$width/$angle cone $sign missing")
                }
                // A point well inside each end of the band, beyond the cone's body.
                val perpendicular = Pair(-axis.second, axis.first)
                for (sign in listOf(-1, 1)) {
                    val point = Pair(12 + sign * axis.first * gap * .35 + perpendicular.first * geometry.playerRadius * .7,
                        12 + sign * axis.second * gap * .35 + perpendicular.second * geometry.playerRadius * .7)
                    assertTrue(nearPixel(bitmap, point) { c -> AndroidColor.alpha(c) in 170..215 }, "Gate $version/$width/$angle band endpoint missing")
                }
                val (first, second) = gateCones(target, version)
                assertEquals(gap, kotlin.math.hypot(second.x - first.x, second.y - first.y), .00001)
                assertEquals(2.1, gateCones(target).let { kotlin.math.hypot(it.second.x - it.first.x, it.second.y - it.first.y) }, .00001)
            }
        }
    }

    private fun render(target: DiagramObject, version: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(640, 640, Bitmap.Config.ARGB_8888)
        CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(android.graphics.Canvas(bitmap)), Size(640f, 640f)) {
            drawEquipment(target, geometry, scale, version)
        }
        return bitmap
    }

    private fun nearPixel(bitmap: Bitmap, at: Pair<Double, Double>, matches: (Int) -> Boolean): Boolean {
        val x = (at.first * scale).roundToInt()
        val y = (at.second * scale).roundToInt()
        return (-2..2).any { dx -> (-2..2).any { dy -> matches(bitmap.getPixel(x + dx, y + dy)) } }
    }

    private fun pixels(bitmap: Bitmap): List<Triple<Int, Int, Int>> {
        val result = mutableListOf<Triple<Int, Int, Int>>()
        // Equipment is isolated around 12m; limit test allocations to its bounds.
        for (y in 210..370) for (x in 210..370) result.add(Triple(x, y, bitmap.getPixel(x, y)))
        return result
    }
}
