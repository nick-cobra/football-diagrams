package io.github.footballdiagrams

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
internal fun rememberDiagramLabels(area: DiagramArea, frame: DiagramFrame, geometry: DiagramGeometry): List<DiagramLabel> {
    // Derive the actual label inputs, rather than maintaining a second list of
    // model properties that supposedly cannot affect placement.
    val candidates = remember(area, frame, geometry) { diagramLabelCandidates(area, frame, geometry) }
    return remember(candidates, geometry) { placeDiagramLabels(candidates, geometry) }
}
