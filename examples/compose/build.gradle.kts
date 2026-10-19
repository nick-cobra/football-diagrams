plugins {
    kotlin("multiplatform") version "2.4.20"
    kotlin("plugin.compose") version "2.4.20"
}
kotlin {
    jvmToolchain(21)
    jvm()
    iosSimulatorArm64 {
        binaries.framework {
            baseName = "FootballDiagramsDemo"
            isStatic = true
        }
    }
    sourceSets {
        commonMain.dependencies { implementation("io.github.nick-cobra:football-diagrams:0.2.1") }
        jvmTest.dependencies { implementation(kotlin("test")) }
    }
}
