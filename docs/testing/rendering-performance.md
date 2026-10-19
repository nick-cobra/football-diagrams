# Rendering performance

The rendering budget and cache checks are deterministic tests, without universal timing thresholds. Run `npm test` and `./kotlin/gradlew -p kotlin :library:jvmTest :library:testAndroidHostTest` (JDK 21). Browser CI also runs the installed consumer's geometry-read probe on React 18 and 19.

## Geometry and invalidation

Renderer-only dribble sampling retains the original integer sample indices and phase inside a conservatively padded viewport. Omitted off-screen runs connect outside that padding. The padding is four geometry units: it covers amplitude, shadow translation, stroke/join extents and arrowhead reach. Original endpoint neighbours retain marker direction. Excess measured extents are rounded to geometry units to avoid regenerating samples for every pixel of a resize; the half-unit rounding error remains inside the conservative padding. Public `wavyPath`, `arrowGeometry`, `wavyPoints` and `arrowPathPoints` continue returning full geometry.

The maximum 30-arrow regression shrinks from 2,435,400 to 20,460 rendered points. Tests compare the actual visible polyline edges with full helper output across crossing/off-screen segments, bends, repeats, zero-length paths, subnormal pitches and extreme aspect ratios. Ordinary geometry and reviewed Android pixels remain unchanged.

React memoises prepared paths by selected arrow-list, pitch geometry and measured viewport extents. Client layout and ResizeObserver account for SVG letterboxing and parent resizing. SSR uses explicit numeric/px inline dimensions when supplied, otherwise the natural viewBox aspect; external CSS dimensions are resolved on hydration. Presentation, accessible titles, thumbnails and invalid frame selection still update. Compose remembers metre-space points by selected arrows and pitch geometry; a composition-owned cache retains only the most recent scale's Paths, heads and strokes. A scale-only resize rebuilds scaled drawing; changed viewport extents (including a constrained Canvas aspect) also rebuild the metre-space samples. Frame/arrow/pitch replacement rebuilds the relevant geometry. Text measurement and host properties are outside the arrow cache. Treat inputs as snapshots and replace changed values/lists.

The Android native-Skia cache regression verifies Path identity on repeated draws, replacement on resize, reuse of metre-space points and eviction of an older scale. The installed React probe counts reads of authored points, including parent updates and invalidation cases. Both reuse regressions were observed failing before their fixes. Additional native-Skia pixel comparisons verify constrained Canvas dimensions against the full sampled reference; browser raster comparisons cover wide/tall/square SVGs and parent resizing. The letterbox regressions were also observed failing before viewport-aware sampling.

## Manual measurements

Reproduce the Node CPU assessment from the repository root:

```sh
npm run build
NODE_ENV=production node scripts/benchmark-rendering.mjs
```

It validates four synthetic documents and reports complete renderer-path generation and fresh React SSR, including point/markup counts. These are CPU measurements, not browser/GPU timings.

The following local measurements compare v0.2.0 (`eeeeea5`) with performance implementation `ccb59b3` on Apple M5 Pro. Numbers illustrate this machine and harness; they are not hardware-independent promises.

| Maximum valid frame | v0.2.0 | Performance fixes |
| --- | ---: | ---: |
| Rendered dribble points | 2,435,400 | 20,460 |
| SSR SVG bytes | 72,008,660 | 475,880 |
| Node renderer-path generation, median | 441.8 ms | 2.36 ms |
| Fresh React SSR, median | 432.0 ms | 2.78 ms |
| Browser first render/commit/layout | 471.1 ms | 4.7 ms |
| Browser unchanged-parent update, median | 347.0 ms | 0.1 ms |
| Compose warmed Canvas CPU callback, median | 169.485 ms | 0.034 ms |

Node 26 production assessment: three timed maximum-frame samples after two warmups. Browser: production React 18.3.1, in-app Chromium 155, DPR 2, 600px SVG; three timed maximum-frame updates. Ordinary/dense SVG sizes remain 11,854/210,215 bytes. The browser had no observed long tasks during the fixed cases.

Compose: Kotlin/Native release framework and Swift `-O`, iPhone 18 Pro profile on iOS 27.0 Simulator, density 3, 1206px Canvas width. A diagnostic-only timer/state read was inserted inside the actual Canvas callback in a temporary source copy. Nine timed maximum-frame callbacks followed warmup. Median frame-clock interval improved from 184.411 to 16.667 ms (eight intervals); 30 unrelated parent updates caused zero Canvas callbacks before and after. Ordinary callbacks changed from 0.098 to 0.053 ms; the dense 60-object/30-arrow/12-zone case from 4.259 to 3.942 ms (41 samples each).

The Compose timer covers actual CPU draw-callback execution. In the fixed implementation, previously prepared arrow geometry is reused; initial composition/geometry preparation and GPU completion are outside that warmed measurement. Simulator scheduling is not physical-device FPS, and these are not Android-device measurements. Android host native-Skia images and tests provide separate regression evidence. Raw local reports, diagnostic patch/source identity, build logs and actual browser/UIKit captures are retained with this task's performance evidence. No release is performed by the benchmark or these fixes.
