# Diagram format 1

The canonical contract is [`schema/diagram.schema.json`](schema/diagram.schema.json), JSON Schema Draft 2020-12. Validators operate locally; schema references are embedded in both implementations.

## Document

Required fields are `format_version: 1`, `title`, `area` and `frames`. An empty frame list is valid and represents a document without a drawable frame. At most 64 frames are accepted.

`area` has `shape: "rectangle"`, positive `length_m` up to 120 and positive `width_m` up to 90. An optional `label` is drawn outside the grid. All positions and dimensions use metres, with the origin at the area's top-left, x increasing rightwards and y increasing downwards. Off-pitch coordinates are permitted; numeric drawing coordinates are bounded to ±1000. The schema does not restrict each coordinate to the playing area.

Each frame has an `id`, `title`, `objects` and `arrows`, plus optional `caption` and `areas`. The host displays captions and selects frames; the renderer draws one selected frame without tweening or authoring positions.

## Objects and arrows

Object kinds are `player`, `opponent`, `neutral`, `coach`, `ball`, `cone`, `flat_marker`, `gate`, `mini_goal`, `goal`, `mannequin`, `pole` and `ladder`. Each has x/y, with optional `colour`, `label`, `short`, `number`, `angle`, `width` and `ball`. Shirt numbers are integers 1–99. Named colours are red, blue, yellow, green, orange, white and teal.

`pass` is solid, `run` dashed, `dribble` wavy and `shot` heavy. Each arrow has 2–12 points, an optional label, optional integer sequence 1–20 and an optional badge-position override. Frames allow at most 60 objects, 30 arrows and 12 labelled rectangular sub-areas. Object widths are positive and at most 20 metres.

Optional nullable object labels, colours, numbers, angles, widths and badge positions accept explicit JSON null as well as omission. JSON Schema integers include mathematically equivalent spellings such as `1`, `1.0` and `1e0`; both parsers accept them. Unknown properties, enum values and unsupported versions reject. The schema defines the full string and array bounds.

## Rendering semantics and limits

Geometry derives the playing grid from its authored metre dimensions and adds an external grass margin. SVG and Canvas are separate renderers with the same notation and proportions; their font rasterisation is platform-specific.

Grass uses six stripes across the pitch and extends into the margin. For very small pitches, the stripe width increases to keep the whole viewport within 256 stripes. This bounded fallback also covers dimensions smaller than drawing precision, without changing the authored document.

Labels use a deterministic bounded candidate search. A densely crowded frame can still have overlapping labels after that search is exhausted. The algorithm does not promise collision-free placement for arbitrary input, nor does it infer player positions or football tactics.

Initial goal nets extend towards positive x from the authored goal-mouth position. Goal rotation is not applied. Gate rotation is supported; the existing ladder glyph remains axis-aligned. A caller should author coordinates with these semantics in mind. Changes to those drawing behaviours are reviewed independently of extracting and adopting the initial renderer.

Both renderers draw the selected frame. The React `thumbnail` option removes badges and the area label for small cards; the initial Compose entry point retains its existing full-diagram label semantics. A matching thumbnail presentation can be selected by a host using its own approved presentation; there is no claim that two distinct host layouts have identical pixels.

## Versioning

The published format-1 schema is immutable. A change to accepted document structure or meaning requires an explicitly versioned format contract and a documented reader/writer compatibility matrix. The initial readers support format 1 and reject unknown versions.

Library release versions separately describe parser, renderer and packaging changes. A package upgrade alone does not rewrite stored documents. Applications own migrations between explicitly supported format versions.

TypeScript uses ordinary arrays for authored collections; size and minimum-point limits are enforced by `parseDiagram` against the canonical schema. This keeps array construction practical without weakening runtime validation.
