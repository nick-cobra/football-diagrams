package io.github.footballdiagrams

import androidx.compose.ui.unit.Constraints
import kotlin.test.*

class CanvasConstraintSizesTest {
    @Test fun preferredAspectStaysInsideTheIncomingHost() {
        val cases = listOf(
            Triple(Constraints.fixed(320, 90), 320, 90),
            Triple(Constraints.fixed(90, 320), 90, 320),
            Triple(Constraints(minWidth = 320, maxWidth = 320), 320, 256),
            Triple(Constraints(minWidth = 320, maxWidth = 320, maxHeight = 90), 320, 90),
            Triple(Constraints.fixed(0, 0), 0, 0),
            Triple(Constraints.fixed(0, 1), 0, 1),
            Triple(Constraints.fixed(1, 0), 1, 0),
            Triple(Constraints(maxHeight = 90), 113, 90),
            Triple(Constraints(), 0, 0),
            Triple(Constraints(minWidth = 10, minHeight = 30), 38, 30),
        )
        for ((input, width, height) in cases) {
            val actual = diagramCanvasConstraints(input, 1.25f)
            assertEquals(Constraints.fixed(width, height), actual, input.toString())
            assertTrue(actual.minWidth >= input.minWidth && actual.maxWidth <= input.maxWidth)
            assertTrue(actual.minHeight >= input.minHeight && actual.maxHeight <= input.maxHeight)
        }
    }

    @Test fun derivedLargeDimensionsDoNotOverflowPackedConstraints() {
        for (input in listOf(Constraints(minWidth = 200_000, maxWidth = 200_000), Constraints(minHeight = 200_000, maxHeight = 200_000))) {
            val actual = diagramCanvasConstraints(input, 1.25f)
            assertTrue(actual.hasFixedWidth && actual.hasFixedHeight)
            assertTrue(actual.minWidth >= input.minWidth && actual.maxWidth <= input.maxWidth)
            assertTrue(actual.minHeight >= input.minHeight && actual.maxHeight <= input.maxHeight)
        }
    }
}
