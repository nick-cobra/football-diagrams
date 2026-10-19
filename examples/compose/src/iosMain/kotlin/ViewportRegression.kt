import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.requiredSize
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.ComposeUIViewController
import io.github.footballdiagrams.*
import platform.UIKit.UIViewController

/** Native UI regression host; diagnostics stay in the example, outside the library. */
class ViewportRegression(mode: Int, width: Int, height: Int) {
    private val size = mutableStateOf(IntSize(width, height))
    private val zone = DiagramSubArea("Zone", 1.0, 1.0, 5.0, 5.0)
    private val frame = DiagramFrame("f", "Viewport", when (mode) {
        1 -> listOf(DiagramObject(DiagramObjectKind.Player, 10.0, 10.0, number = 7, label = "Player"),
            DiagramObject(DiagramObjectKind.Cone, 20.0, 10.0))
        else -> emptyList()
    }, when (mode) {
        1, 2 -> DiagramArrowKind.entries.mapIndexed { i, kind ->
            DiagramArrow(kind, listOf(DiagramPoint(5.0, 5.0 + i * 5), DiagramPoint(30.0, 5.0 + i * 5)),
                label = if (mode == 1) kind.name else null)
        }
        4, 5 -> List(30) { arrow -> DiagramArrow(if (mode == 4) DiagramArrowKind.Dribble else DiagramArrowKind.Run,
            List(12) { DiagramPoint(if (it % 2 == 0) -1000.0 else 1000.0, arrow / 100.0) }) }
        else -> emptyList()
    }, if (mode == 0 || mode == 1) listOf(zone) else emptyList())
    private val diagram = Diagrams.parse(Diagrams.stringify(Diagram("Viewport regression", if (mode >= 4) DiagramArea(1.0, 1.0) else DiagramArea(40.0, 30.0), listOf(frame))))

    fun resize(width: Int, height: Int) { size.value = IntSize(width, height) }
    fun controller(): UIViewController = ComposeUIViewController {
        Box(Modifier.fillMaxSize()) {
            Box(Modifier.requiredSize(size.value.width.dp, size.value.height.dp)) {
                FootballDiagram(diagram, 0)
            }
        }
    }
}
