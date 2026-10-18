# Standalone Compose consumer

This project consumes the independent library through a Gradle composite. It has no JavaScript, backend or account setup.

From the repository root:

```sh
kotlin/gradlew -p examples/compose jvmTest linkDebugFrameworkIosSimulatorArm64
```

The JVM test decodes every shared valid/invalid fixture through the public API. `Example.kt` draws all equipment and movement kinds. The iOS framework exposes `MainViewControllerKt.mainViewController()` for a UIKit host.

`ios/Demo.swift` supplies a minimal scene-based UIKit host, with the diagram constrained to the safe area. `ios/Info.plist` includes Compose's required high-refresh-rate setting. Add those files and the built `FootballDiagramsDemo.framework` to an iOS simulator app target, or compile the host with the installed Swift compiler. The host owns its signing, bundle and simulator selection.

To try a separate external checkout, change `includeBuild("../../kotlin")` in settings to the downloaded release's `kotlin` directory. The dependency coordinate and source substitution remain unchanged.
