import { arrowGeometry, type ArrowGeometry, type FrameGeometry } from './geometry.js';
import type { DiagramArrow } from './generated/types.js';
import { sampleWave } from './wave-sampling.js';

export interface RenderingViewport { widthM: number; heightM: number }

/** Quantised extents avoid rebuilding metre-space samples for every pixel of a
 * resize. The half-unit rounding error is covered by the four-unit padding. */
export function renderingViewport(geometry: FrameGeometry, widthPx?: number, heightPx?: number): RenderingViewport {
  const widthM = geometry.lengthM + 2 * geometry.margin;
  const heightM = geometry.widthM + 2 * geometry.margin;
  if (widthPx === undefined || heightPx === undefined || widthPx <= 0 || heightPx <= 0 || !Number.isFinite(widthPx) || !Number.isFinite(heightPx)) return { widthM, heightM };
  const scale = Math.min(widthPx / widthM, heightPx / heightM);
  const extent = (actual: number, nominal: number) => nominal + Math.round(Math.max(0, actual - nominal) / geometry.unit) * geometry.unit;
  return { widthM: extent(widthPx / scale, widthM), heightM: extent(heightPx / scale, heightM) };
}

/** Renderer-only reduction; the public geometry helpers retain full paths. */
export function renderArrowGeometry(arrow: DiagramArrow, geometry: FrameGeometry, viewport = renderingViewport(geometry)): ArrowGeometry {
  if (arrow.kind !== 'dribble') return arrowGeometry(arrow, geometry);
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
    right: lengthM + margin + extraX + padding, bottom: widthM + margin + extraY + padding });
  return { kind: arrow.kind, d, strokeWidth: unit * 0.24, dashArray: undefined, markerEnd: 'arrow' };
}
