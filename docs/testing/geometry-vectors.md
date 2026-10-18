# Shared numeric geometry vectors

`fixtures/geometry-vectors.json` is a hand-derived numeric oracle, consumed by JS tests, Kotlin common tests (JVM/Android host/iOS native), and an Android Canvas recording test. It is not generated from either renderer's outputs. Keep it independent when reviewing a behaviour change.

The frame rows give length, width, margin, player radius, unit, viewport width/height and stripe width in that order. They cover rectangular/square, minimal drawing precision and maximum valid areas, including scale floors. Numeric comparison permits 0.0001 metres for Float drawing calculations. SVG dribble paths intentionally round to two decimals, so their sample tolerance is 0.0051 metres; Kotlin's unrounded points use the Float tolerance.

Glyph bounds exclude stroke extents and include authored shadows. The 26m reference area makes the player radius exactly 1m and unit 1.3m. Examples: a cone spans x ±0.64m and y -0.8m to 0.736m; an unrotated goal spans x 0–1.4m and y ±3m; a person includes its shadow at y 1.16m. All 13 symbols are checked against actual SVG primitives and actual Compose Canvas calls, not a separate dimension helper. Extra rows retain the initial coloured gate rotation, goal width override and unrotated goal/ladder semantics. Drawing helpers only become module-internal for test access; their operations are unchanged.

The label document deliberately puts one zone outside the pitch and one object label beside a number badge. The object label's first candidate collides, so it moves exactly one unit down. Other rows check the area/sub-area pill formula, sequence-position override and arrow label. Additional assertions cover default middle-segment badges, tiny/maximal off-pitch coordinates, repeated/degenerate points and pinned wave endpoints. The 2.875m wave uses ten steps and a 2.3m wavelength: samples at 0.575m and 1.725m reach ±0.3m; its final endpoint is pinned flat.

Kotlin-specific numeric checks cover pixel scale, text fitting/pill clamping and density/font-scale conversion. React-specific thumbnail checks omit area/number/sequence labels. The platforms retain their documented presentation differences.

Verification included temporary unit-floor mutations in both implementations: the shared expected values failed, then passed after restoration. Reviewed browser/Android image tests separately guard raster output. Never regenerate these numbers to hide a regression; an intentional change needs its own behaviour decision and explanation of the revised calculations.
