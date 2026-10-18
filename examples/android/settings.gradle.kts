pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositories { google(); mavenCentral() } }
rootProject.name = "IndependentAndroidConsumer"
includeBuild("../../kotlin") {
    dependencySubstitution { substitute(module("io.github.nick-cobra:football-diagrams")).using(project(":library")) }
}
