plugins {
    id("com.android.application") version "9.2.1"
    kotlin("plugin.compose") version "2.4.20"
}
android {
    namespace = "io.github.footballdiagrams.demo"
    compileSdk = 37
    defaultConfig {
        applicationId = "io.github.footballdiagrams.demo"
        minSdk = 26
        targetSdk = 37
        versionCode = 2
        versionName = "0.2.0"
    }
    buildFeatures { compose = true }
}
dependencies {
    implementation("io.github.nick-cobra:football-diagrams:0.2.0")
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.compose.foundation:foundation:1.12.1")
}
