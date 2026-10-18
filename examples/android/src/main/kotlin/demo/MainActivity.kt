package demo
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.ui.Modifier
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import io.github.footballdiagrams.Diagrams
import io.github.footballdiagrams.FootballDiagram
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val diagram = Diagrams.parse(assets.open("all-kinds.json").bufferedReader().use { it.readText() })
        setContent { FootballDiagram(diagram, frameIndex = 0, modifier = Modifier.statusBarsPadding()) }
    }
}
