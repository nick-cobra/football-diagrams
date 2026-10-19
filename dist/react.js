"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LabelLayer } from "./react-labels.js";
import { renderFrameArrows, renderingViewport } from "./rendering-geometry.js";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { INK, LINE_PAINT, OUTSIDE_WASH, PERSON_KINDS, frameGeometry, grassStripes, isMover, layoutLabels, objectColour, personFill, shade, } from "./geometry.js";
// Server rendering has no measured viewport. The natural aspect is the initial
// value; client layout/ResizeObserver expands it before painting letterboxes.
const useMeasuredLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function useRenderingViewport(geometry, visible, inlineStyle) {
    const element = useRef(null);
    const [measured, setMeasured] = useState();
    const latest = useRef();
    const measure = () => {
        const svg = element.current;
        if (!svg)
            return;
        const style = window.getComputedStyle(svg);
        const contentExtent = (axis) => {
            const value = Number.parseFloat(style[axis]);
            if (style.boxSizing !== "border-box")
                return value;
            const edges = axis === "width" ? ["Left", "Right"] : ["Top", "Bottom"];
            return value - edges.reduce((sum, edge) => sum + Number.parseFloat(style.getPropertyValue(`border-${edge.toLowerCase()}-width`)) + Number.parseFloat(style.getPropertyValue(`padding-${edge.toLowerCase()}`)), 0);
        };
        const viewport = renderingViewport(geometry, contentExtent("width"), contentExtent("height"));
        const previous = latest.current;
        if (previous?.geometry === geometry && previous.viewport.widthM === viewport.widthM && previous.viewport.heightM === viewport.heightM)
            return;
        latest.current = { geometry, viewport };
        setMeasured(latest.current);
    };
    useMeasuredLayoutEffect(() => { measure(); });
    useMeasuredLayoutEffect(() => {
        const svg = element.current;
        if (!svg || typeof ResizeObserver === "undefined")
            return;
        let active = true;
        const observer = new ResizeObserver(() => { if (active)
            measure(); });
        observer.observe(svg);
        return () => { active = false; observer.disconnect(); };
    }, [geometry, visible]);
    const pixels = (value) => typeof value === "number" ? value
        : typeof value === "string" && /^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?px$/i.test(value.trim()) ? Number.parseFloat(value.trim()) : undefined;
    return { element, viewport: measured?.geometry === geometry ? measured.viewport
            : renderingViewport(geometry, pixels(inlineStyle?.width), pixels(inlineStyle?.height)) };
}
export function DiagramSvg({ diagram, frameIndex = 0, thumbnail = false, className, style, "data-testid": testId = "football-diagram" }) {
    const markerPrefix = useId();
    const geometry = useMemo(() => frameGeometry(diagram.area), [diagram.area]);
    const frame = diagram.frames[frameIndex];
    const { element, viewport } = useRenderingViewport(geometry, Boolean(frame), style);
    const labels = useMemo(() => (frame ? layoutLabels(diagram, frame, geometry, { thumbnail }) : []), [diagram, frame, geometry, thumbnail]);
    const arrows = useMemo(() => frame ? renderFrameArrows(frame.arrows, geometry, viewport) : [], [frame?.arrows, geometry, viewport.widthM, viewport.heightM]);
    if (!frame)
        return null;
    const grass = grassStripes(geometry);
    const { lengthM, widthM, margin, unit } = geometry;
    const arrowMarker = `${markerPrefix}-arrow`;
    const heavyMarker = `${markerPrefix}-arrow-heavy`;
    return (_jsxs("svg", { ref: element, viewBox: geometry.viewBox, role: "img", "aria-label": `${diagram.title} — ${frame.title}`, "data-testid": testId, "data-frame-id": frame.id, "data-thumbnail": thumbnail ? "true" : undefined, className: className, width: "100%", style: style, children: [_jsxs("defs", { children: [_jsx(ArrowMarker, { id: arrowMarker, size: 5.4 }), _jsx(ArrowMarker, { id: heavyMarker, size: 3.6 })] }), grass.stripes.map((stripe, index) => (_jsx("rect", { x: stripe.x, y: grass.y, width: stripe.width, height: grass.height, fill: stripe.fill }, `stripe-${index}`))), _jsx("path", { d: `M${-margin} ${-margin} H${lengthM + margin} V${widthM + margin} H${-margin} Z M0 0 V${widthM} H${lengthM} V0 Z`, fill: OUTSIDE_WASH, fillRule: "evenodd" }), _jsx("rect", { x: 0, y: 0, width: lengthM, height: widthM, fill: "none", stroke: LINE_PAINT, strokeWidth: unit * 0.16 }), (frame.areas ?? []).map((area, index) => (_jsx("rect", { x: area.x, y: area.y, width: area.width, height: area.height, fill: area.colour ? `${objectColour(area)}22` : "rgba(255,255,255,0.08)", stroke: area.colour ? objectColour(area) : LINE_PAINT, strokeWidth: unit * 0.1, strokeDasharray: `${unit * 0.5} ${unit * 0.4}` }, `sub-area-${index}`))), _jsx("g", { children: frame.objects.map((object, index) => (_jsx(EquipmentGlyph, { object: object, geometry: geometry }, `equip-${index}`))) }), _jsx("g", { children: arrows.map((geo, index) => {
                    const markerEnd = geo.markerEnd === "arrow-heavy" ? heavyMarker : arrowMarker;
                    return (_jsxs("g", { "data-arrow-kind": geo.kind, children: [_jsx("path", { d: geo.d, fill: "none", stroke: "rgba(0,0,0,0.28)", strokeWidth: geo.strokeWidth + unit * 0.1, strokeLinecap: "round", strokeLinejoin: "round", transform: "translate(0.12 0.16)" }), _jsx("path", { d: geo.d, fill: "none", stroke: "#ffffff", strokeWidth: geo.strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: geo.dashArray, markerEnd: `url(#${markerEnd})` })] }, `arrow-${index}`));
                }) }), _jsx("g", { children: frame.objects.map((object, index) => (_jsx(PersonGlyph, { object: object, frame: frame, geometry: geometry }, `person-${index}`))) }), _jsx(LabelLayer, { labels: labels, presentation: { className, style } })] }));
}
function ArrowMarker({ id, size }) {
    return (_jsx("marker", { id: id, viewBox: "0 0 10 10", refX: 7.5, refY: 5, markerWidth: size, markerHeight: size, orient: "auto-start-reverse", children: _jsx("path", { d: "M0 0.6 L9.5 5 L0 9.4 z", fill: "#ffffff" }) }));
}
function Cone({ x, y, size, fill, unit }) {
    return (_jsxs("g", { children: [_jsx("ellipse", { cx: x, cy: y + size * 0.62, rx: size * 0.78, ry: size * 0.3, fill: "rgba(0,0,0,0.22)" }), _jsx("path", { d: `M${x} ${y - size} L${x + size * 0.8} ${y + size * 0.62} L${x - size * 0.8} ${y + size * 0.62} Z`, fill: fill, stroke: "#ffffff", strokeWidth: unit * 0.1, strokeLinejoin: "round" })] }));
}
function Ball({ x, y, r, unit }) {
    return (_jsxs("g", { children: [_jsx("circle", { cx: x, cy: y, r: r, fill: "#ffffff", stroke: INK, strokeWidth: unit * 0.07 }), _jsx("circle", { cx: x, cy: y, r: r * 0.34, fill: INK }), Array.from({ length: 5 }, (_, i) => {
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                return (_jsx("circle", { cx: x + Math.cos(angle) * r * 0.68, cy: y + Math.sin(angle) * r * 0.68, r: r * 0.14, fill: INK }, i));
            })] }));
}
function EquipmentGlyph({ object, geometry }) {
    const { playerRadius: pr, unit } = geometry;
    const colour = objectColour(object);
    if (object.kind === "gate") {
        const gap = 2.1;
        const angle = ((object.angle ?? 0) * Math.PI) / 180;
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        const px = -uy;
        const py = ux;
        const c1 = { x: object.x - (ux * gap) / 2, y: object.y - (uy * gap) / 2 };
        const c2 = { x: object.x + (ux * gap) / 2, y: object.y + (uy * gap) / 2 };
        const bandWidth = pr * 0.9;
        const bandPath = `M${c1.x + px * bandWidth} ${c1.y + py * bandWidth} L${c2.x + px * bandWidth} ${c2.y + py * bandWidth} L${c2.x - px * bandWidth} ${c2.y - py * bandWidth} L${c1.x - px * bandWidth} ${c1.y - py * bandWidth} Z`;
        return (_jsxs("g", { "data-object-kind": "gate", children: [object.colour && object.colour !== "orange" && (_jsxs(_Fragment, { children: [_jsx("path", { d: bandPath, fill: "#ffffff", opacity: 0.55 }), _jsx("path", { d: bandPath, fill: colour, opacity: 0.45 })] })), _jsx(Cone, { x: c1.x, y: c1.y, size: pr * 0.8, fill: colour, unit: unit }), _jsx(Cone, { x: c2.x, y: c2.y, size: pr * 0.8, fill: colour, unit: unit })] }));
    }
    if (object.kind === "cone") {
        return (_jsx("g", { "data-object-kind": "cone", children: _jsx(Cone, { x: object.x, y: object.y, size: pr * 0.8, fill: colour, unit: unit }) }));
    }
    if (object.kind === "flat_marker") {
        return (_jsx("ellipse", { "data-object-kind": "flat_marker", cx: object.x, cy: object.y, rx: pr * 0.5, ry: pr * 0.26, fill: "none", stroke: colour, strokeWidth: unit * 0.16 }));
    }
    if (object.kind === "mannequin") {
        const w = pr * 1.0;
        const h = pr * 2.2;
        return (_jsxs("g", { "data-object-kind": "mannequin", children: [_jsx("ellipse", { cx: object.x, cy: object.y + h / 2, rx: w * 0.75, ry: w * 0.32, fill: "rgba(0,0,0,0.22)" }), _jsx("rect", { x: object.x - w / 2, y: object.y - h / 2, width: w, height: h, rx: w / 2, fill: "#2b3a4d", stroke: "#ffffff", strokeWidth: unit * 0.09 }), _jsx("circle", { cx: object.x, cy: object.y - h / 2 - w * 0.1, r: w * 0.42, fill: "#2b3a4d", stroke: "#ffffff", strokeWidth: unit * 0.09 })] }));
    }
    if (object.kind === "pole") {
        return (_jsxs("g", { "data-object-kind": "pole", children: [_jsx("line", { x1: object.x, y1: object.y - pr * 1.2, x2: object.x, y2: object.y + pr * 1.2, stroke: "#f0e13c", strokeWidth: unit * 0.16 }), _jsx("circle", { cx: object.x, cy: object.y - pr * 1.2, r: unit * 0.2, fill: "#f0e13c" })] }));
    }
    if (object.kind === "ladder") {
        const w = pr * 3.4;
        const h = pr * 1.15;
        return (_jsxs("g", { "data-object-kind": "ladder", children: [_jsx("rect", { x: object.x - w / 2, y: object.y - h / 2, width: w, height: h, fill: "none", stroke: "#ffd23c", strokeWidth: unit * 0.13 }), [1, 2, 3].map((i) => (_jsx("line", { x1: object.x - w / 2 + (w * i) / 4, y1: object.y - h / 2, x2: object.x - w / 2 + (w * i) / 4, y2: object.y + h / 2, stroke: "#ffd23c", strokeWidth: unit * 0.13 }, i)))] }));
    }
    if (object.kind === "goal" || object.kind === "mini_goal") {
        const mouth = object.width ?? (object.kind === "goal" ? 6 : 2.4);
        const depth = object.kind === "goal" ? 1.4 : 0.9;
        return (_jsxs("g", { "data-object-kind": object.kind, children: [_jsx("rect", { x: object.x, y: object.y - mouth / 2, width: depth, height: mouth, fill: "rgba(255,255,255,0.9)", stroke: INK, strokeWidth: unit * 0.09 }), [1, 2, 3, 4].map((i) => (_jsx("line", { x1: object.x, y1: object.y - mouth / 2 + (mouth * i) / 5, x2: object.x + depth, y2: object.y - mouth / 2 + (mouth * i) / 5, stroke: "#8b97a5", strokeWidth: unit * 0.045 }, `h${i}`))), [1, 2].map((i) => (_jsx("line", { x1: object.x + (depth * i) / 3, y1: object.y - mouth / 2, x2: object.x + (depth * i) / 3, y2: object.y + mouth / 2, stroke: "#8b97a5", strokeWidth: unit * 0.045 }, `v${i}`)))] }));
    }
    return null;
}
function PersonGlyph({ object, frame, geometry, }) {
    const { playerRadius: pr, unit } = geometry;
    if (object.kind === "ball") {
        return (_jsx("g", { "data-object-kind": "ball", children: _jsx(Ball, { x: object.x, y: object.y, r: pr * 0.55, unit: unit }) }));
    }
    if (!PERSON_KINDS.includes(object.kind))
        return null;
    const fill = personFill(object);
    const ring = isMover(object, frame, geometry);
    return (_jsxs("g", { "data-object-kind": object.kind, children: [_jsx("ellipse", { cx: object.x, cy: object.y + pr * 0.78, rx: pr * 0.95, ry: pr * 0.38, fill: "rgba(0,0,0,0.25)" }), ring && (_jsx("circle", { cx: object.x, cy: object.y, r: pr * 1.42, fill: "none", stroke: "rgba(255,255,255,0.85)", strokeWidth: unit * 0.14 })), _jsx("ellipse", { cx: object.x, cy: object.y + pr * 0.18, rx: pr, ry: pr * 0.66, fill: fill, stroke: "#ffffff", strokeWidth: unit * 0.11 }), _jsx("circle", { cx: object.x, cy: object.y - pr * 0.34, r: pr * 0.5, fill: shade(fill, 0.78), stroke: "#ffffff", strokeWidth: unit * 0.09 }), object.ball && _jsx(Ball, { x: object.x + pr * 1.25, y: object.y + pr * 0.7, r: pr * 0.55, unit: unit })] }));
}
