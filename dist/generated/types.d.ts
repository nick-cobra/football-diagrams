export type ObjectColour = "red" | "blue" | "yellow" | "green" | "orange" | "white" | "teal";
export interface Diagram {
    format_version: 1;
    title: string;
    area: Area;
    /**
     * @maxItems 64
     */
    frames: Frame[];
}
export interface Area {
    shape: "rectangle";
    length_m: number;
    width_m: number;
    label?: string | null;
}
export interface Frame {
    id: string;
    title: string;
    caption?: string;
    /**
     * @maxItems 60
     */
    objects: DiagramObject[];
    /**
     * @maxItems 12
     */
    areas?: [] | [Zone] | [Zone, Zone] | [Zone, Zone, Zone] | [Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone] | [Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone, Zone];
    /**
     * @maxItems 30
     */
    arrows: DiagramArrow[];
}
export interface DiagramObject {
    kind: "player" | "opponent" | "neutral" | "coach" | "ball" | "cone" | "flat_marker" | "gate" | "mini_goal" | "goal" | "mannequin" | "pole" | "ladder";
    x: number;
    y: number;
    colour?: ObjectColour | null;
    label?: string | null;
    short?: string | null;
    number?: number | null;
    angle?: number | null;
    width?: number | null;
    ball?: boolean;
}
export interface Zone {
    id?: string | null;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    colour?: ObjectColour | null;
}
export interface DiagramArrow {
    kind: "pass" | "run" | "dribble" | "shot";
    /**
     * @minItems 2
     * @maxItems 12
     */
    points: [Point, Point] | [Point, Point, Point] | [Point, Point, Point, Point] | [Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point, Point, Point, Point, Point] | [Point, Point, Point, Point, Point, Point, Point, Point, Point, Point, Point, Point];
    label?: string | null;
    sequence?: number | null;
    badge?: Point | null;
}
export interface Point {
    x: number;
    y: number;
}
