import { type CSSProperties } from "react";
import { type LabelBox } from "./geometry.js";
/** Font metrics are a DOM input. Read every label before committing one state
 * update; no per-label effects or interleaved layout reads/style writes. The
 * public metre-space layout stays deterministic and independent of web fonts. */
export declare function LabelLayer({ labels, presentation }: {
    labels: LabelBox[];
    presentation: {
        className?: string;
        style?: CSSProperties;
    };
}): import("react").JSX.Element;
