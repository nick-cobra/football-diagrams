# Diagram format 1

The canonical contract is [`schema/diagram.schema.json`](schema/diagram.schema.json), JSON Schema Draft 2020-12. Validators operate locally; schema references are embedded in both implementations.

Both parsers require JSON syntax, including standard number tokens and escaped control characters inside strings. Decimal spellings such as `+30`, `030`, `.30` and `30.` are invalid JSON, regardless of their numeric meaning.

Serialisers escape unpaired UTF-16 surrogates in accepted string values so UTF-8 storage and transport preserve their code units. Ordinary Unicode characters and valid surrogate pairs retain their normal JSON representation.

## JSON transport resource envelope

Before constructing a JSON tree, both parsers limit string inputs to **8 Mi UTF-16
code units**, **262,144 tokens** and **32 nested containers**. Tokens count opening
containers, strings (including keys), numbers and literals; separators and closing
containers do not count. Brackets inside strings are not containers. Inputs outside
this envelope reject with `RangeError` in JavaScript or `SerializationException`
in Kotlin, rather than risking stack exhaustion or excessive intermediate trees.

This is a parser transport budget, separate from the unchanged format-1 schema.
A fully populated canonical v1 document, including maximum escaped string lengths,
fits the envelope and is regression-tested in both languages. Excessive whitespace
or exceptionally long equivalent numeric spellings can exceed the transport limit;
callers must bound incoming payloads before parsing them. Ordinary numeric and
Unicode semantics remain unchanged.

## Document

Required fields are `format_version: 1`, `title`, `area` and `frames`. An empty frame list is valid and represents a document without a drawable frame. At most 64 frames are accepted.

`area` has `shape: "rectangle"`, positive `length_m` up to 120 and positive `width_m` up to 90. An optional `label` is drawn outside the grid. All positions and dimensions use metres, with the origin at the area's top-left, x increasing rightwards and y increasing downwards. Off-pitch coordinates are permitted; numeric drawing coordinates are bounded to ±1000. The schema does not restrict each coordinate to the playing area.

Each frame has an `id`, `title`, `objects` and `arrows`, plus optional `caption` and `areas`. The host displays captions and selects frames; the renderer draws one selected frame without tweening or authoring positions.

## Objects and arrows

Object kinds are `player`, `opponent`, `neutral`, `coach`, `ball`, `cone`, `flat_marker`, `gate`, `mini_goal`, `goal`, `mannequin`, `pole` and `ladder`. Each has x/y, with optional `colour`, `label`, `short`, `number`, `angle`, `width` and `ball`. Shirt numbers are integers 1–99. Named colours are red, blue, yellow, green, orange, white and teal.

`pass` is solid, `run` dashed, `dribble` wavy and `shot` heavy. Each arrow has 2–12 points, an optional label, optional integer sequence 1–20 and an optional badge-position override. Frames allow at most 60 objects, 30 arrows and 12 labelled rectangular sub-areas. Object widths are positive and at most 20 metres.

Repeated arrow vertices are valid. Arrowheads follow the last nonzero segment at the renderer's drawing precision; an entirely zero-length pass/run/shot uses the deterministic zero-angle fallback. A dribble with no nonzero segment has no drawable path.

The public `wavyPath`/`wavyPoints` helpers require finite amplitudes, positive finite wavelengths and finite drawing coordinates. They reject requests exceeding 100,000 generated points per call, including excessively small wavelengths, rather than looping or allocating without a bound. Every format-1 arrow fits this budget: at most 11 segments spanning ±1000 metres, with the renderers' minimum wavelength of 2.3 metres, need fewer than 82,000 points. These helper guards do not change accepted documents or ordinary dribble geometry.

Optional nullable object labels, colours, numbers, angles, widths and badge positions accept explicit JSON null as well as omission. JSON Schema integers include mathematically equivalent spellings such as `1`, `1.0` and `1e0`; both parsers accept them. Unknown properties, enum values and unsupported versions reject. The schema defines the full string and array bounds.

Parsers retain drawing numbers as IEEE-754 binary64 (`Number` in JavaScript, `Double` in Kotlin), including positive values below the Float range. Values round to binary64 precision at the parser boundary and round-trip at that precision. Schema checks, including integer classification, use that decoded value: a decimal spelling that rounds to an integer is treated as that integer, while a representable fractional value is rejected for integer fields. The format-1 schema is unchanged. Kotlin's drawing-number properties previously used `Float`; source consumers assigning those properties to Float variables must now convert explicitly, and compiled consumers must rebuild. Compose converts to Float only for drawing calculations; a subpixel dimension may draw as zero without changing the stored document or its encoded value. `DiagramArea` and `DiagramPoint` also accept Float constructor arguments for existing callers.

## Rendering semantics and limits

Geometry derives the playing grid from its authored metre dimensions and adds an external grass margin. SVG and Canvas are separate renderers with the same notation and proportions; their font rasterisation is platform-specific.

Drawing is clipped to the renderer's measured viewport, including its grass margin. Off-pitch coordinates remain valid; content outside that viewport does not paint over neighbouring host UI.

Renderers retain the original dribble sample phase and endpoints but omit intermediate samples far outside the viewport. A conservative padding includes waves, strokes, shadows and arrowheads; off-screen runs connect outside that padding. The public full-path geometry helpers continue returning the complete sampled paths. This bounds rendering work by the visible region without changing valid documents or clipping away visible arrow sections.

Grass uses six stripes across the pitch and extends into the margin. For very small pitches, the stripe width increases to keep the whole viewport within 256 stripes. This bounded fallback also covers dimensions smaller than drawing precision, without changing the authored document.

Labels use a deterministic bounded candidate search. A densely crowded frame can still have overlapping labels after that search is exhausted. The algorithm does not promise collision-free placement for arbitrary input, nor does it infer player positions or football tactics.

Object labels of any accepted length are drawn as pills. A label matching the object's visible shirt/short/coach badge is drawn once in that badge; React thumbnails hide badges and retain the label pill instead. Equipment labels are always retained. Renderers fit badge text within its circle without moving the badge centre. React expands pill backgrounds to contain actual font bounds after hydration, then uniformly fits complete pills and clamps their centres to the natural viewport. Full text is retained, with a native SVG title for inspection at small sizes. The server uses deterministic estimated fitting until client fonts can be measured; the public deterministic label-layout helpers continue to return estimated metre-space boxes.

Initial goal nets extend towards positive x from the authored goal-mouth position. Goal rotation is not applied. Gate rotation is supported; the existing ladder glyph remains axis-aligned. A caller should author coordinates with these semantics in mind. Changes to those drawing behaviours are reviewed independently of extracting and adopting the initial renderer.

Both renderers draw the selected frame. The React `thumbnail` option removes badges and the area label for small cards; the initial Compose entry point retains its existing full-diagram label semantics. A matching thumbnail presentation can be selected by a host using its own approved presentation; there is no claim that two distinct host layouts have identical pixels.

## Versioning

The published format-1 schema is immutable. A change to accepted document structure or meaning requires an explicitly versioned format contract and a documented reader/writer compatibility matrix. The initial readers support format 1 and reject unknown versions.

Library release versions separately describe parser, renderer and packaging changes. A package upgrade alone does not rewrite stored documents. Applications own migrations between explicitly supported format versions.

TypeScript uses ordinary arrays for authored collections; size and minimum-point limits are enforced by `parseDiagram` against the canonical schema. This keeps array construction practical without weakening runtime validation.

For JavaScript object inputs, required fields must be own enumerable properties; inherited properties are not part of the JSON object contract. `parseDiagram` returns a validated plain data snapshot without custom prototypes or inherited optional values, leaving the source untouched and without invoking `toJSON`. `stringifyDiagram` validates both the supplied data and the actual serialised JSON, including any `toJSON` result. Non-enumerable required fields or hooks producing an invalid document cause serialisation to reject. Hooks producing valid documents follow normal JavaScript serialisation semantics. Non-finite supplied numbers reject before any hook runs.

### Renderer geometry budget

Renderers allocate at most 30,000 dribble sample vertices across the active frame,
shared equally among its dribble arrows. They count visible samples before
allocating paths. If a constrained or extremely letterboxed viewport would exceed
that allocation, they double the rendered wavelength until the paths fit. This
reduces wave detail under resource pressure; authored points, amplitude, arrow
kind and original endpoint neighbours (and therefore arrowhead direction) remain.
Ordinary diagrams retain their exact original samples. The public geometry helpers
still return the complete authored waveform and keep their existing 100,000-point
per-path guard. No schema or stored document is changed by rendering detail levels.

Compose also clips distant Run centre lines before native dash expansion. Each
visible re-entry carries an invisible phase prefix; interior vertices and joins
are retained, and the arrowhead and translated shadow use the same geometry.
Native Float distance quantisation can produce subpixel antialiasing differences
on distant paths; ordinary in-bounds paths keep the original native path. At most
30,000 dash intervals are allocated across the frame's Run arrows, counting
contour prefixes. If an extreme constraint exposes more, dash on/off lengths
increase together by powers of two until the allocation fits. The stored arrow
and its endpoints remain unchanged.

## Format 2: authored equipment geometry (unreleased)

[`schema/diagram-v2.schema.json`](schema/diagram-v2.schema.json) defines format 2.
It has the same fields, bounds, nullable defaults and resource envelope as format 1,
with `format_version: 2`. The published format-1 schema and drawing meaning remain
unchanged. The public `football-diagrams/schema` export continues to identify
format 1; `football-diagrams/schema/v2` identifies format 2.

For `goal` and `mini_goal`, `angle` is the goal-mouth axis, clockwise from positive
x in the document's downwards-y coordinates. `0` and `180` are horizontal mouths;
`90` and `270` are vertical. The complete mouth and net rotate around authored x/y.
The old vertical mouth with a net extending towards positive x is rotated by
`angle - 90` degrees. Consequently, nets point towards negative y at 0, positive x
at 90, positive y at 180, and negative x at 270. Oblique angles work continuously.
Omitted or null angles default to 90 and preserve the old appearance. Mouth widths
still default to 6m for goals and 2.4m for mini goals; net depths remain 1.4m/0.9m.
There is no inferred byline direction.

For `gate`, `width` is the distance in metres between the two cone centres. The
colour band ends at those same centres. Omitted or null width retains 2.1m. Gate
angles retain their format-1 convention (0 horizontal, 90 vertical). Format 1
continues to ignore explicit gate widths and goal angles. Other equipment,
including ladders, retains its existing drawing meaning in both versions.

The standalone [`authored-equipment-v2.json`](fixtures/valid/authored-equipment-v2.json)
example includes horizontal, vertical and oblique goals and 2/3/4m gates. Set the
explicit document version to 2 when authoring that geometry. Merely upgrading a
library does not reinterpret existing version-1 documents. Host applications own
any deliberate content/adaptor migration.

| Reader / writer | Writes format 1 | Writes format 2 |
| --- | --- | --- |
| Released library 0.2.1 reader | Accepted; original geometry | Rejected as unsupported |
| Unreleased 0.3.0-dev.1 reader | Accepted; original geometry | Accepted; authored equipment geometry |

New parsers and serialisers retain the selected version and reject unknown
versions. The default Kotlin constructor still selects format 1; explicit
`formatVersion = 2` is required for new geometry. Existing `gateCones(target)`
callers retain format-1 geometry; use `gateCones(target, formatVersion)` when
inspecting a versioned document. This development version is an immutable-source
integration prerequisite; it is not a tag, package publication or release.
