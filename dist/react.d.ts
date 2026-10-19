import { type CSSProperties } from "react";
import type { Diagram } from "./generated/types.js";
export interface DiagramSvgProps {
    className?: string;
    style?: CSSProperties;
    diagram: Diagram;
    "data-testid"?: string;
    frameIndex?: number;
    thumbnail?: boolean;
    /** Uniform grass margin in metres; finite 0..120, never smaller than the default. */
    marginMetres?: number;
}
export declare function DiagramSvg({ diagram, frameIndex, thumbnail, marginMetres, className, style, "data-testid": testId }: DiagramSvgProps): import("react").JSX.Element | null;
