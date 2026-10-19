import { arrowGeometry } from './geometry.js';
import { sampleWave } from './wave-sampling.js';
/** Quantised extents avoid rebuilding metre-space samples for every pixel of a
 * resize. The half-unit rounding error is covered by the four-unit padding. */
export function renderingViewport(geometry, widthPx, heightPx) {
    const widthM = geometry.lengthM + 2 * geometry.margin;
    const heightM = geometry.widthM + 2 * geometry.margin;
    if (widthPx === undefined || heightPx === undefined || widthPx <= 0 || heightPx <= 0 || !Number.isFinite(widthPx) || !Number.isFinite(heightPx))
        return { widthM, heightM };
    const scale = Math.min(widthPx / widthM, heightPx / heightM);
    const extent = (actual, nominal) => nominal + Math.round(Math.max(0, actual - nominal) / geometry.unit) * geometry.unit;
    return { widthM: extent(widthPx / scale, widthM), heightM: extent(heightPx / scale, heightM) };
}
/** Renderer-only reduction; the public geometry helpers retain full paths. */
export function renderArrowGeometry(arrow, geometry, viewport = renderingViewport(geometry), pointBudget = 30_000) {
    if (arrow.kind !== 'dribble')
        return arrowGeometry(arrow, geometry);
    const { unit, margin, lengthM, widthM } = geometry;
    // Covers wave amplitude, both strokes, the translated shadow and arrowhead.
    // Extra original samples on either side also keep clipping intersections exact.
    const padding = unit * 4;
    // Default xMidYMid/meet centres the authored viewBox in a letterboxed SVG.
    const extraX = Math.max(0, viewport.widthM - lengthM - 2 * margin) / 2;
    const extraY = Math.max(0, viewport.heightM - widthM - 2 * margin) / 2;
    let d = '';
    sampleWave(arrow.points, unit * 0.3, unit * 2.3, (x, y) => {
        d += `${d === '' ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }, { left: -margin - extraX - padding, top: -margin - extraY - padding,
        right: lengthM + margin + extraX + padding, bottom: widthM + margin + extraY + padding }, pointBudget);
    return { kind: arrow.kind, d, strokeWidth: unit * 0.24, dashArray: undefined, markerEnd: 'arrow' };
}
/** At most 30,000 wave vertices across the active frame, including unique paths. */
export function renderFrameArrows(arrows, geometry, viewport = renderingViewport(geometry)) {
    const budget = Math.floor(30_000 / Math.max(1, arrows.filter(a => a.kind === 'dribble').length));
    return arrows.map(a => renderArrowGeometry(a, geometry, viewport, budget));
}
