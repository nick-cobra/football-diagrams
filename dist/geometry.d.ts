import type { Point, DiagramArrow, Diagram, Frame, ObjectColour, DiagramObject } from "./generated/types.js";
export declare const GRASS_LIGHT = "#5aa25a";
export declare const GRASS_DARK = "#529952";
export declare const OUTSIDE_WASH = "rgba(12,42,12,0.20)";
export declare const LINE_PAINT = "rgba(255,255,255,0.92)";
export declare const INK = "#22303f";
export declare const OBJECT_COLOURS: Record<ObjectColour, string>;
export declare const KIND_FILL: Record<string, string>;
export declare const PERSON_KINDS: readonly ["player", "opponent", "neutral", "coach"];
export interface FrameGeometry {
    lengthM: number;
    widthM: number;
    margin: number;
    playerRadius: number;
    unit: number;
    viewBox: string;
    stripeWidth: number;
}
export declare function frameGeometry(area: Diagram["area"]): FrameGeometry;
export declare function grassStripes(geometry: FrameGeometry): {
    stripes: {
        x: number;
        width: number;
        fill: string;
    }[];
    y: number;
    height: number;
};
export declare function personFill(object: DiagramObject): string;
export declare function objectColour(object: {
    colour?: ObjectColour | null;
}): string;
export declare function shade(hex: string, factor: number): string;
export declare function polyPath(points: readonly Point[]): string;
export declare function wavyPath(points: readonly Point[], amplitude: number, wavelength: number): string;
export interface ArrowGeometry {
    kind: DiagramArrow["kind"];
    d: string;
    strokeWidth: number;
    dashArray?: string;
    markerEnd: string;
}
export declare function arrowGeometry(arrow: DiagramArrow, geometry: FrameGeometry): ArrowGeometry;
export declare function isMover(object: DiagramObject, frame: Frame, geometry: FrameGeometry): boolean;
export type LabelKind = "area" | "sub_area" | "number" | "sequence" | "object" | "arrow";
export interface LabelBox {
    id: string;
    kind: LabelKind;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    anchorX: number;
    anchorY: number;
}
export interface LayoutLabelsOptions {
    thumbnail?: boolean;
}
export declare function layoutLabels(doc: Pick<Diagram, "area">, frame: Frame, geometry: FrameGeometry, options?: LayoutLabelsOptions): LabelBox[];
