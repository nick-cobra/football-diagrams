# Football Diagrams

An open JSON format for football diagrams, with React SVG and Kotlin/Compose Canvas renderers.

Describe a rectangular playing area, positioned players and equipment, arrows, labels and frames. Use the same document on a website, Android or iOS. The host supplies its own content, storage and controls.

## See it rendered

The same synthetic [equipment and movement document](fixtures/valid/all-kinds.json) rendered on the web and mobile: 13 player/equipment symbols and four movement notations (`pass`, `run`, `dribble`, `shot`). These are real captures from the independent v0.1.0 examples.

### React SVG

<img src="docs/screenshots/react-desktop.png" alt="React example with a 40 by 30 metre pitch, players, equipment, all four movement arrows and a smaller thumbnail of the same frame" width="760" />

The example supplies the surrounding page, frame controls and thumbnail panel; `DiagramSvg` draws the pitch and its contents.

### Kotlin/Compose Canvas

| Android | iOS |
| --- | --- |
| <img src="docs/screenshots/compose-android.png" alt="Android Compose Canvas rendering the equipment and movement diagram" width="260" /> | <img src="docs/screenshots/compose-iphone.png" alt="iPhone Compose Canvas rendering the same equipment and movement diagram" width="260" /> |

Captured on an Android emulator and iPhone simulator. `FootballDiagram` draws the diagram; the host app owns the screen, safe-area insets and controls. See the runnable [React](examples/react), [Android](examples/android) and [Compose/iOS](examples/compose) examples.

## Source release

The initial `v0.1.0` distribution is tagged source. JavaScript includes built ESM and TypeScript declarations; Kotlin is a standalone Gradle project. This release does not require a private repository, application backend, account or application stylesheet. npm-registry and Maven Central publication are separate distribution options, not prerequisites for these instructions.

```sh
npm install github:nick-cobra/football-diagrams#v0.1.0 react
```

Applications should resolve and pin the full commit in their lockfile. Review the release and dependency update before changing that pin.

## React

```tsx
import { parseDiagram } from 'football-diagrams';
import { DiagramSvg } from 'football-diagrams/react';

const diagram = parseDiagram({
  format_version: 1,
  title: 'Pass and move',
  area: { shape: 'rectangle', length_m: 30, width_m: 20 },
  frames: [{
    id: 'setup', title: 'Setup',
    objects: [{ kind: 'player', x: 5, y: 10, number: 1 }],
    arrows: [{ kind: 'pass', points: [{ x: 6, y: 10 }, { x: 20, y: 10 }] }],
  }],
});

export function Example() {
  return <DiagramSvg diagram={diagram} frameIndex={0} />;
}
```

`thumbnail` omits shirt/sequence badges and the area label. `className` and `style` belong to the host. Text is rendered as text, with no HTML injection interface. Empty documents and out-of-range frame selections draw nothing. React marker IDs are unique within a shared React root; separate server roots should supply distinct React `identifierPrefix` values.

The SVG defaults to `width="100%"` and derives its natural height from its viewBox. Host CSS (including a supplied class or a parent selector) overrides this presentation attribute; explicit `style` props take normal inline-style precedence. For a fixed-height thumbnail, size both the container and its SVG:

```css
.thumbnail { width: 355px; height: 168px; }
.thumbnail svg { display: block; width: 100%; height: 100%; }
```

The default SVG `preserveAspectRatio` centres the drawing inside that box without stretching it.

Run the independent example with `npm ci && npm run demo`. The command prints its local URL and does not open a browser.

## Kotlin/Compose

Download the tagged source or check out the exact release commit:

```sh
git clone --branch v0.1.0 --depth 1 https://github.com/nick-cobra/football-diagrams.git
```

Include its independent Gradle project in the consumer's `settings.gradle.kts`:

```kotlin
includeBuild("../football-diagrams/kotlin") {
    dependencySubstitution {
        substitute(module("io.github.nick-cobra:football-diagrams"))
            .using(project(":library"))
    }
}
```

Add `implementation("io.github.nick-cobra:football-diagrams:0.1.0")` to `commonMain`.

```kotlin
import io.github.footballdiagrams.Diagrams
import io.github.footballdiagrams.FootballDiagram

val diagram = Diagrams.parse(jsonText)

@Composable
fun Example() {
    FootballDiagram(diagram = diagram, frameIndex = 0)
}
```

The Kotlin project builds without Node or a JavaScript checkout setup. It targets Android, JVM, iOS device arm64 and iOS Simulator arm64. Initial supported toolchain: JDK 21, Gradle 9.5.1, Kotlin 2.4.20, Compose Multiplatform 1.12.1, Android KMP plugin 9.2.1, Android API 37/minimum 26. Native builds require a compatible installed Xcode. The host owns any Compose theme, safe-area insets, navigation and frame controls. On iOS, embed it in the host's `ComposeUIViewController`; set `CADisableMinimumFrameDurationOnPhone` to `true` in `Info.plist`, as required by Compose on high-refresh-rate iPhones. Modern UIKit hosts must adopt the scene lifecycle.

Independent source examples are in [`examples/android`](examples/android) and [`examples/compose`](examples/compose). From the repository root, run `kotlin/gradlew -p examples/android assembleDebug` for Android, or `kotlin/gradlew -p examples/compose jvmTest linkDebugFrameworkIosSimulatorArm64` for a standalone Kotlin consumer and iOS framework. The Compose example includes a UIKit scene host and its required plist entries; an existing Xcode app can use those with the built framework. Neither project needs Node, an API server or an application account.

## The format

[`schema/diagram.schema.json`](schema/diagram.schema.json) is the canonical JSON Schema Draft 2020-12 contract. See [FORMAT.md](FORMAT.md) for fields, units, versioning and rendering limits. TypeScript declarations and JavaScript validation are generated from it; the Kotlin parser validates the same schema before decoding its models. Both languages run the same [valid and invalid fixtures](fixtures).

The format contains drawing data. Product taxonomies, subscriptions, permissions, publication records and database identifiers belong to the host application. The library performs no network requests for content or account access.

## Verification

```sh
npm ci
npm test
npm run demo:build
cd kotlin
./gradlew :library:jvmTest :library:testAndroidHostTest
./gradlew :library:compileKotlinIosSimulatorArm64 :library:iosSimulatorArm64Test
```

Native test execution uses the installed simulator tooling. On shared machines, select and exclusively coordinate the intended device through your own device tooling before running simulator tests.

For a cold-consumer check, install the public Git pin in a new directory and use the exported entry points. For Kotlin, include the downloaded tagged project through the documented composite dependency. A sibling development checkout is not release-consumption evidence.

## Updating and rollback

Update the exact Git revision and lockfile together, then run the host's parser, document, render and platform tests. Keep TypeScript and Kotlin consumers on the same reviewed source revision. Roll back both the source pin and its lockfile entry to the previous verified commit, then repeat those checks. The public schema's `format_version` is distinct from the package's release version.

Library source is MIT licensed. The Gradle wrapper retains its Apache-2.0 licence; the generated JavaScript validator includes an Ajv MIT helper (see `LICENSES/`). Synthetic examples are included; no external drill catalogue or user data is bundled.
