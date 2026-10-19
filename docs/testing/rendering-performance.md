# Rendering performance

The rendering budget and cache checks are deterministic tests, without universal timing thresholds. Run `npm test` and `./kotlin/gradlew -p kotlin :library:jvmTest :library:testAndroidHostTest` (JDK 21). Browser CI also runs the installed consumer's geometry-read probe on React 18 and 19.

## Geometry and invalidation

Renderer-only dribble sampling retains the original integer sample indices and phase inside a conservatively padded viewport. Omitted off-screen runs connect outside that padding. The padding is four geometry units: it covers amplitude, shadow translation, stroke/join extents and arrowhead reach. Original endpoint neighbours retain marker direction. Excess measured extents are rounded to geometry units to avoid regenerating samples for every pixel of a resize; the half-unit rounding error remains inside the conservative padding. Public `wavyPath`, `arrowGeometry`, `wavyPoints` and `arrowPathPoints` continue returning full geometry.

The maximum 30-arrow regression shrinks from 2,435,400 to 20,460 rendered points. Tests compare the actual visible polyline edges with full helper output across crossing/off-screen segments, bends, repeats, zero-length paths, subnormal pitches and extreme aspect ratios. Ordinary geometry and reviewed Android pixels remain unchanged.

React memoises prepared paths by selected arrow-list, pitch geometry and measured viewport extents. Client layout and ResizeObserver account for SVG letterboxing and parent resizing. SSR uses explicit numeric/px inline dimensions when supplied, otherwise the natural viewBox aspect; external CSS dimensions are resolved on hydration. Presentation, accessible titles, thumbnails and invalid frame selection still update. Compose remembers metre-space Paths by selected arrow geometry and pitch; a composition-owned cache retains only the most recent scaled drawing. A scale-only resize copies/transforms Paths in the native graphics backend without a Kotlin vertex walk; changed viewport extents (including a constrained Canvas aspect) also rebuild the metre-space samples. Arrow kind/point, pitch and viewport changes rebuild the relevant geometry. Arrow text/sequence/badge changes retain unchanged prepared geometry. Text measurement and host properties are outside the arrow cache. Treat inputs as snapshots and replace changed values/lists.

The Android native-Skia cache regression verifies Path identity on repeated draws, replacement on resize, reuse of metre-space preparation and eviction of an older scale. The installed React probe counts reads of authored points, including parent updates and invalidation cases. Both reuse regressions were observed failing before their fixes. Additional native-Skia pixel comparisons verify constrained Canvas dimensions against the full sampled reference; browser raster comparisons cover wide/tall/square SVGs and parent resizing. The letterbox regressions were also observed failing before viewport-aware sampling.

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

## Label fitting and text-layout reuse

The label fixes at `53c2d55` retain at most two text layouts per active Compose
label (original and fitted). The composition-owned LRU is bounded to twice the active label count; changes
to that count replace/resize the measurer. Position-only or same-capacity content
updates retain it, with older text/size entries evicted within the fixed bound.
Density, font scale, layout direction and font resolver remain Compose inputs.
`TextLayoutTest` checks paragraph identity across repeated dense-frame passes,
including long pills that require two measurements, and verifies invalidation.
It also checks wide Latin, CJK, emoji and multiline badge bounds at two sizes
and density/font-scale combinations. The wide-labels native and browser images
record actual painting; existing native image baselines remain unchanged.

A JDK 21 / Android API 36 native-Skia host diagnostic at 600 px and density/font
scale 1 used 120 distinct player-number/name labels and the renderer's actual
`measureDiagramLabel` function. Across 30 warm measurement passes, the default
eight-entry control took a median **3.478 ms**, with **120 new paragraphs** per
pass. The composition-owned renderer measurer took **0.063 ms**, with **zero new
paragraphs** per unchanged pass. These timings cover text measurement CPU in a
host test, not whole-Canvas drawing, GPU work or device FPS.

The same production React/IAB probe described above measured a dense frame at
**13.8 ms** mount/initial layout and **0.6 ms** median unchanged parent update
(10 warm samples), with no observed long tasks. Font fitting adds initial DOM
measurement work; repeated updates retain the earlier geometry optimisation.
The maximum-arrow frame remained **475,880 SVG bytes**, with **0.2 ms** median
parent updates (3 samples). These are observations, not timing assertions.

React reads all SVG label bounds before one batched state update. Badge metrics
use enlarged text coordinates mapped back to metres, avoiding SVG rounding of
sub-unit font sizes and preserving ordinary number sizes. Font-loading events,
viewport changes, observed text-bound changes and host commits refresh measurements. SSR uses deterministic
estimated boxes until hydration can measure the host font. The browser probe
checks real transformed text bounds for all label kinds, including late-loaded
fonts; these updates must not regenerate arrow geometry.

A separate iOS Simulator release run of the Kotlin sources at `be0ec53` used
the same diagnostic-only Canvas probe, iPhone 18 Pro profile, iOS 27.0, density
3 and 1206 px width as the preceding assessment. The dense frame's warmed
Canvas CPU median was **0.567 ms** (41 callbacks), compared with **3.267 ms**
at `155f03a` before text-cache sizing. Maximum-frame arrows remained **0.037 ms**
(9 callbacks). Unrelated parent updates caused zero actual Canvas callbacks
in all five cases. A fifth case displayed the wide-labels fixture for UIKit
visual inspection. Initial text preparation and GPU completion remain outside
these warmed CPU timings; this is simulator evidence, not physical-device FPS.


## Compose update invalidation

At `bd67ce0`, Compose retains the text measurer across position-only and
same-capacity content updates, with an LRU bound of twice the active label count.
A count change replaces the cache. Arrow preparation keys only kind/points and
pitch geometry; label/sequence/badge edits retain prepared paths. A remembered
content-only frame keeps caption/identity edits out of label placement and paint,
while accessibility still reads the original diagram/frame titles.

`ComposeInvalidationTest` first failed on each of the three original behaviours.
It verifies paragraph and Path reuse, required geometry invalidation, no paint-input
reads on metadata-only updates, accessibility updates, and changed/restored actual
pixels for label, badge, kind, point, object-text and zone edits. `TextLayoutTest`
also proves bounded eviction, count-driven resizing, and font/density/direction
invalidation. All seven reviewed native images remain unchanged.

The release iOS Simulator harness above was extended to alternate two prebuilt
immutable snapshots (or frame indices), after ten warm updates. Separate timers
inside the composable body and actual Canvas callback cover 41 updates per case.
GPU completion and host snapshot construction are excluded. The baseline is the
current-main tree at `f7c7cf`; two baseline runs reversed diagnostic-control order.
The fixed run uses actual `bd67ce0` sources with counters/timers only.

| Update | Before: Canvas CPU median | Fixed: Canvas CPU median | Fixed reuse evidence, 41 updates |
| --- | ---: | ---: | --- |
| Move one player, dense frame | 3.336–3.893 ms | 0.689 ms | 0 measurer replacements |
| Same-text frame navigation | 3.887–4.102 ms | 0.544 ms | 0 measurer replacements |
| Change one arrow sequence, max frame | 0.831–0.840 ms | 0.048 ms | 0 arrow source/Path rebuilds |
| Caption only, dense frame | 0.851–0.907 ms | No Canvas callbacks | 0 label placements |

Caption-only composable-body CPU fell from 1.178–1.239 ms to 0.020 ms. Moving a
player still needs label placement: fixed composable-body CPU was 0.795 ms,
separate from its 0.689 ms Canvas callback. Dense arrow-label edits also retained
arrow geometry and the text measurer, while still placing and painting the
changed label (1.314 ms composition, 0.897 ms Canvas). A sequence toggle between
absent/present changes the label count and therefore intentionally replaces the
small text cache. Warm forced redraws remained 0.615 ms for the dense case.

These are Apple M5 Pro / iPhone 18 Pro profile / iOS 27.0 Simulator observations,
not device FPS or universal timing thresholds. Deterministic reuse/eviction and
actual pixel tests are the regression gates. No production diagnostic API, global
cache, release or version change is introduced.
