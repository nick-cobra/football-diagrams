import { type ArrowGeometry, type FrameGeometry } from './geometry.js';
import type { DiagramArrow } from './generated/types.js';
/** Renderer-only reduction; the public geometry helpers retain full paths. */
export declare function renderArrowGeometry(arrow: DiagramArrow, geometry: FrameGeometry): ArrowGeometry;
