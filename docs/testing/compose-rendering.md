# Compose rendering proof

The automated Android **host** test runs the exported `FootballDiagram` in a real Compose composition under Robolectric 4.17, Android API 36, native Skia graphics and JDK 21. It is not an emulator test. The pinned 600px/320px image baselines cover all 13 glyphs/four arrows, area/object/zone/sequence labels, square/landscape layouts and density 2/font scale 1.4. A second test changes the first/last frame repeatedly, compares actual pixels, and checks empty/invalid selections. Native graphics is required: successful composition or a nonempty PNG file cannot prove drawing occurred.

Run:

```sh
./kotlin/gradlew -p kotlin :library:testAndroidHostTest
```

The test writes actual images to `kotlin/library/build/reports/rendering`. Unexpected pixel changes fail. For an approved intentional rendering change, run with `UPDATE_DIAGRAM_SNAPSHOTS=1`, inspect every changed PNG against the prior baseline, then commit the reviewed images. Do not regenerate images to hide an unexplained difference. Removing equipment drawing was verified to fail this image comparison; restoring it passed. No production drawing changes are part of this test addition.

## iOS CI and manual rendering split

Library CI creates a job-owned available iPhone simulator, explicitly passes its UDID to `iosSimulatorArm64Test`, retains XML execution results and deletes only that created simulator. Compilation/linking are prerequisites, not execution evidence. Missing available runtimes fail instead of silently skipping tests. Android reports and actual render images are retained for 14 days.

UIKit image review is a manual pre-release gate. Apple's simulator runtime and font/rasterisation changes make unpinned hosted-runner screenshots unsuitable for an exact image baseline. Android host images provide the automatic Canvas regression; iOS execution covers the shared parser/geometry, while the following independent UIKit host capture covers the real `ComposeUIViewController`, scene lifecycle and safe-area integration. It builds/installs a local debug example and does not publish anything.

On an Apple Silicon Mac with JDK 21, Xcode and an available iOS 18.5+ simulator, first select and exclusively coordinate a device through the host's lease tooling. Wrap the **whole** command in that lease so ownership remains held through installation, launch and capture:

```sh
node scripts/capture-ios.mjs <owned-simulator-UDID> <evidence-directory>
```

On simulators with several displays, the default screenshot display can be inactive even while the app is running. Within the same device lease, inspect `xcrun simctl io <owned-simulator-UDID> enumerate` and pass the active screen's selector as the optional third argument, for example `node scripts/capture-ios.mjs <owned-simulator-UDID> <evidence-directory> 1`. Inspect the resulting image for actual app content; a stable black frame is not rendering evidence. The selected display is recorded in `toolchain.txt`. Omitting this argument retains the ordinary simulator's default behaviour.

Run it once on an ordinary iPhone and again on iPhone Duo when available, otherwise the smallest available iPhone. Inspect `ios.png`: the pitch must contain the 13 symbols and four arrows, text must remain readable, and the host must respect safe-area bounds. The script retains the PNG, built debug app and `toolchain.txt`; retain both capture directories with release-review evidence. It fails rather than selecting another device. A stable PNG hash is only a capture-readiness heuristic and does not approve the image. Release the owned lease after the complete unattended sequence, or retain it for an explicitly requested manual testing session.

This change was exercised locally on iPhone 18 Pro and iPhone Duo with Xcode 27.1/Swift 6.4; screenshots are retained with the task's evidence. The library's initial goal/angle notation is preserved. No native device or iOS image-automation coverage is claimed.
