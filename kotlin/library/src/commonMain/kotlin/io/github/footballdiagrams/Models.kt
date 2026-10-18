@file:kotlinx.serialization.UseSerializers(SchemaIntegerSerializer::class)

package io.github.footballdiagrams

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Diagram(
    val title: String,
    val area: DiagramArea,
    val frames: List<DiagramFrame>,
    @SerialName("format_version") val formatVersion: Int = 1,
)

@Serializable
enum class AreaShape { @SerialName("rectangle") Rectangle }

@Serializable
data class DiagramArea(
    @SerialName("length_m") val lengthMetres: Double,
    @SerialName("width_m") val widthMetres: Double,
    val label: String? = null,
    val shape: AreaShape = AreaShape.Rectangle,
) {
    constructor(lengthMetres: Float, widthMetres: Float, label: String? = null, shape: AreaShape = AreaShape.Rectangle) :
        this(lengthMetres.toDouble(), widthMetres.toDouble(), label, shape)
}

@Serializable
data class DiagramFrame(
    val id: String,
    val title: String,
    val objects: List<DiagramObject>,
    val arrows: List<DiagramArrow>,
    val areas: List<DiagramSubArea> = emptyList(),
    val caption: String = "",
)

@Serializable
data class DiagramObject(
    val kind: DiagramObjectKind,
    val x: Double,
    val y: Double,
    val colour: DiagramColour? = null,
    val label: String? = null,
    val short: String? = null,
    val number: Int? = null,
    @SerialName("angle") val angleDegrees: Double? = null,
    @SerialName("width") val widthMetres: Double? = null,
    @SerialName("ball") val hasBall: Boolean = false,
)

@Serializable
enum class DiagramObjectKind(val wire: String) {
    @SerialName("player") Player("player"),
    @SerialName("opponent") Opponent("opponent"),
    @SerialName("neutral") Neutral("neutral"),
    @SerialName("coach") Coach("coach"),
    @SerialName("ball") Ball("ball"),
    @SerialName("cone") Cone("cone"),
    @SerialName("flat_marker") FlatMarker("flat_marker"),
    @SerialName("gate") Gate("gate"),
    @SerialName("mini_goal") MiniGoal("mini_goal"),
    @SerialName("goal") Goal("goal"),
    @SerialName("mannequin") Mannequin("mannequin"),
    @SerialName("pole") Pole("pole"),
    @SerialName("ladder") Ladder("ladder"),
    ;

    val isPerson: Boolean get() = this == Player || this == Opponent || this == Neutral || this == Coach
}

@Serializable
enum class DiagramColour(val wire: String) {
    @SerialName("red") Red("red"),
    @SerialName("blue") Blue("blue"),
    @SerialName("yellow") Yellow("yellow"),
    @SerialName("green") Green("green"),
    @SerialName("orange") Orange("orange"),
    @SerialName("white") White("white"),
    @SerialName("teal") Teal("teal"),
}

@Serializable
data class DiagramSubArea(
    val label: String,
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double,
    val id: String? = null,
    val colour: DiagramColour? = null,
)

@Serializable
data class DiagramArrow(
    val kind: DiagramArrowKind,
    val points: List<DiagramPoint>,
    val label: String? = null,
    val sequence: Int? = null,
    val badge: DiagramPoint? = null,
)

@Serializable
enum class DiagramArrowKind(val wire: String) {
    @SerialName("pass") Pass("pass"),
    @SerialName("run") Run("run"),
    @SerialName("dribble") Dribble("dribble"),
    @SerialName("shot") Shot("shot"),
}

@Serializable
data class DiagramPoint(val x: Double, val y: Double) {
    constructor(x: Float, y: Float) : this(x.toDouble(), y.toDouble())
}
