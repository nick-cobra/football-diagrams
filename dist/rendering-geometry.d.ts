import { type ArrowGeometry, type FrameGeometry } from './geometry.js';
import type { DiagramArrow } from './generated/types.js';
export interface RenderingViewport {
    widthM: number;
    heightM: number;
}
/** Quantised extents avoid rebuilding metre-space samples for every pixel of a
 * resize. The half-unit rounding error is covered by the four-unit padding. */
export declare function renderingViewport(geometry: FrameGeometry, widthPx?: number, heightPx?: number): RenderingViewport;
/** Renderer-only reduction; the public geometry helpers retain full paths. */
export declare function renderArrowGeometry(arrow: DiagramArrow, geometry: FrameGeometry, viewport?: RenderingViewport): ArrowGeometry;
