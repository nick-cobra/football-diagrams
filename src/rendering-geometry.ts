import { arrowGeometry, type ArrowGeometry, type FrameGeometry } from './geometry.js';
import type { DiagramArrow } from './generated/types.js';
import { sampleWave } from './wave-sampling.js';

/** Renderer-only reduction; the public geometry helpers retain full paths. */
export function renderArrowGeometry(arrow: DiagramArrow, geometry: FrameGeometry): ArrowGeometry {
  if (arrow.kind !== 'dribble') return arrowGeometry(arrow, geometry);
  const { unit, margin, lengthM, widthM } = geometry;
  // Covers wave amplitude, both strokes, the translated shadow and arrowhead.
  // Extra original samples on either side also keep clipping intersections exact.
  const padding = unit * 4;
  let d = '';
  sampleWave(arrow.points, unit * 0.3, unit * 2.3, (x, y) => {
    d += `${d === '' ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }, { left: -margin - padding, top: -margin - padding,
    right: lengthM + margin + padding, bottom: widthM + margin + padding });
  return { kind: arrow.kind, d, strokeWidth: unit * 0.24, dashArray: undefined, markerEnd: 'arrow' };
}
