package demo
import androidx.compose.runtime.Composable
import io.github.footballdiagrams.Diagrams
import io.github.footballdiagrams.FootballDiagram

val example = Diagrams.parse("""{
  "format_version": 1,
  "title": "Equipment and movement",
  "area": {
    "shape": "rectangle",
    "length_m": 40,
    "width_m": 30,
    "label": "40 × 30 m"
  },
  "frames": [
    {
      "id": "setup",
      "title": "Setup",
      "caption": "Players, equipment and the four movement notations share one authored frame.",
      "objects": [
        {
          "kind": "player",
          "x": 4,
          "y": 5
        },
        {
          "kind": "opponent",
          "x": 11,
          "y": 5
        },
        {
          "kind": "neutral",
          "x": 18,
          "y": 5
        },
        {
          "kind": "coach",
          "x": 25,
          "y": 5
        },
        {
          "kind": "ball",
          "x": 32,
          "y": 5
        },
        {
          "kind": "cone",
          "x": 4,
          "y": 15
        },
        {
          "kind": "flat_marker",
          "x": 11,
          "y": 15
        },
        {
          "kind": "gate",
          "x": 18,
          "y": 15
        },
        {
          "kind": "mini_goal",
          "x": 25,
          "y": 15
        },
        {
          "kind": "goal",
          "x": 32,
          "y": 15
        },
        {
          "kind": "mannequin",
          "x": 4,
          "y": 25
        },
        {
          "kind": "pole",
          "x": 11,
          "y": 25
        },
        {
          "kind": "ladder",
          "x": 18,
          "y": 25
        }
      ],
      "arrows": [
        {
          "kind": "pass",
          "points": [
            {
              "x": 3,
              "y": 25
            },
            {
              "x": 6,
              "y": 28
            }
          ],
          "label": "pass"
        },
        {
          "kind": "run",
          "points": [
            {
              "x": 11,
              "y": 25
            },
            {
              "x": 14,
              "y": 28
            }
          ],
          "label": "run"
        },
        {
          "kind": "dribble",
          "points": [
            {
              "x": 19,
              "y": 25
            },
            {
              "x": 22,
              "y": 28
            }
          ],
          "label": "dribble"
        },
        {
          "kind": "shot",
          "points": [
            {
              "x": 27,
              "y": 25
            },
            {
              "x": 30,
              "y": 28
            }
          ],
          "label": "shot"
        }
      ],
      "areas": []
    }
  ]
}
""")
@Composable
fun Example() { FootballDiagram(example, frameIndex = 0) }
