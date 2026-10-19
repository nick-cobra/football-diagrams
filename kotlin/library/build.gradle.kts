import org.jetbrains.kotlin.gradle.ExperimentalKotlinGradlePluginApi
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask

plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    kotlin("plugin.compose")
    id("org.jetbrains.compose")
    id("com.android.kotlin.multiplatform.library")
}

tasks.withType<org.gradle.api.tasks.testing.Test>().configureEach {
    if (name == "testAndroidHostTest") {
        // Robolectric's API 36 FileDescriptor bridge on JDK 21.
        jvmArgs("--add-exports=java.base/jdk.internal.access=ALL-UNNAMED")
    }
}

group = "io.github.nick-cobra"
version = "0.3.0-dev.1"

val generatedMain = layout.buildDirectory.dir("generated/schema/commonMain")
val generatedTest = layout.buildDirectory.dir("generated/schema/commonTest")
val schemaFile = rootProject.layout.projectDirectory.file("../schema/diagram.schema.json")
val schemaV2File = rootProject.layout.projectDirectory.file("../schema/diagram-v2.schema.json")
val fixturesDirectory = rootProject.layout.projectDirectory.dir("../fixtures")

fun quotedKotlin(value: String): String =
    "\"\"\"" + value.replace("$", "${'$'}{'$'}") + "\"\"\""

val generateContract by tasks.registering {
    inputs.file(schemaFile)
    inputs.file(schemaV2File)
    inputs.dir(fixturesDirectory)
    outputs.dir(generatedMain)
    outputs.dir(generatedTest)
    doLast {
        generatedMain.get().file("SchemaDefinition.kt").asFile.apply {
            parentFile.mkdirs()
            writeText("package io.github.footballdiagrams\n\ninternal val schemaDefinition = " + quotedKotlin(schemaFile.asFile.readText()) +
                "\ninternal val schemaDefinitionV2 = " + quotedKotlin(schemaV2File.asFile.readText()) + "\n")
        }
        val fixtures = listOf("valid", "invalid").flatMap { kind ->
            fixturesDirectory.asFile.resolve(kind).listFiles().orEmpty().sortedBy { it.name }.map { file ->
                "Fixture(\"$kind/${file.name}\", ${kind == "valid"}, ${quotedKotlin(file.readText())})"
            }
        }
        generatedTest.get().file("ConformanceFixtures.kt").asFile.apply {
            parentFile.mkdirs()
            writeText("package io.github.footballdiagrams\n\ndata class Fixture(val name: String, val valid: Boolean, val json: String)\nval conformanceFixtures = listOf(\n" + fixtures.joinToString(",\n") + "\n)\n")
        }
        generatedTest.get().file("GeometryVectors.kt").asFile.apply {
            parentFile.mkdirs()
            writeText("package io.github.footballdiagrams\n\ninternal val geometryVectorsJson = " + quotedKotlin(fixturesDirectory.asFile.resolve("geometry-vectors.json").readText()) + "\n")
        }
    }
}

tasks.withType<KotlinCompilationTask<*>>().configureEach { dependsOn(generateContract) }

@OptIn(ExperimentalKotlinGradlePluginApi::class)
kotlin {
    jvmToolchain(21)
    android {
        namespace = "io.github.footballdiagrams"
        compileSdk = 37
        minSdk = 26
        compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
        withHostTest { isIncludeAndroidResources = true }
    }
    jvm()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        commonMain {
            kotlin.srcDir(generatedMain)
            dependencies {
                api(compose.runtime)
                api(compose.ui)
                implementation(compose.foundation)
                api("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
                implementation("io.github.optimumcode:json-schema-validator:0.5.5")
            }
        }
        commonTest {
            kotlin.srcDir(generatedTest)
            dependencies { implementation(kotlin("test")) }
        }
        getByName("androidHostTest").dependencies {
            implementation("androidx.activity:activity-compose:1.13.0")
            implementation("org.jetbrains.compose.ui:ui-test:1.12.1")
            implementation("androidx.test.ext:junit:1.3.0")
            implementation("org.robolectric:robolectric:4.17")
        }
    }
}
