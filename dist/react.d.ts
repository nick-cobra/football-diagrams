import { type CSSProperties } from "react";
import type { Diagram } from "./generated/types.js";
export interface DiagramSvgProps {
    className?: string;
    style?: CSSProperties;
    diagram: Diagram;
    "data-testid"?: string;
    frameIndex?: number;
    thumbnail?: boolean;
}
export declare function DiagramSvg({ diagram, frameIndex, thumbnail, className, style, "data-testid": testId }: DiagramSvgProps): import("react").JSX.Element | null;
