package demo
import io.github.footballdiagrams.Diagrams
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFails
import kotlin.test.assertTrue
class ConsumerTest {
    @Test fun sharedPublicFixturesDecodeThroughTheReleasedDependency() {
        var count = 0
        for (kind in listOf("valid", "invalid")) {
            val files = File("../../fixtures/$kind").listFiles()!!.filter { it.extension == "json" }
            for (file in files) {
                if (kind == "valid") {
                    val diagram = Diagrams.parse(file.readText())
                    assertEquals(diagram, Diagrams.parse(Diagrams.stringify(diagram)), file.name)
                } else assertFails(file.name) { Diagrams.parse(file.readText()) }
                count++
            }
        }
        assertTrue(count >= 22)
        assertEquals(13, example.frames.first().objects.size)
    }
}
