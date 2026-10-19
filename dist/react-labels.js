"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { INK } from "./geometry.js";
const useMeasuredLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
// SVG font metrics round at small user-unit sizes. Measure badge glyphs at
// a larger font size, then map them back into metre space with one transform.
const BADGE_TEXT_SCALE = 1000;
const estimatedPaint = (label) => ({ x: label.x, y: label.y, width: label.width, height: label.height, scale: 1 });
/** Font metrics are a DOM input. Read every label before committing one state
 * update; no per-label effects or interleaved layout reads/style writes. The
 * public metre-space layout stays deterministic and independent of web fonts. */
export function LabelLayer({ labels, presentation }) {
    const element = useRef(null);
    const [measured, setMeasured] = useState();
    const latest = useRef();
    const measure = () => {
        const group = element.current;
        if (!group)
            return;
        const texts = group.querySelectorAll("[data-label-kind] > text");
        if (texts.length !== labels.length)
            return;
        const paints = labels.map((label, index) => {
            // getBBox excludes this text's transform. Font hinting can still cause
            // subpixel variation under scale; the update guard keeps that stable.
            const box = texts[index].getBBox();
            const paint = estimatedPaint(label);
            if (label.kind === "number" || label.kind === "sequence") {
                const radius = label.width / 2, cx = label.x + radius, cy = label.y + radius;
                const dx = Math.max(Math.abs(box.x / BADGE_TEXT_SCALE - cx), Math.abs((box.x + box.width) / BADGE_TEXT_SCALE - cx));
                const dy = Math.max(Math.abs(box.y / BADGE_TEXT_SCALE - cy), Math.abs((box.y + box.height) / BADGE_TEXT_SCALE - cy));
                const corner = Math.hypot(dx, dy);
                paint.scale = corner > 0 ? Math.min(1, radius * 0.86 / corner) : 1;
            }
            else {
                const paddingX = label.fontSize * 0.75, paddingY = label.fontSize * 0.2;
                paint.x = Math.min(label.x, box.x - paddingX);
                paint.y = Math.min(label.y, box.y - paddingY);
                paint.width = Math.max(label.x + label.width, box.x + box.width + paddingX) - paint.x;
                paint.height = Math.max(label.y + label.height, box.y + box.height + paddingY) - paint.y;
            }
            return paint;
        });
        const previous = latest.current;
        if (previous?.labels === labels && paints.every((p, i) => {
            const old = previous.paints[i];
            return p.x === old.x && p.y === old.y && p.width === old.width && p.height === old.height && Math.abs(p.scale - old.scale) <= Math.min(p.scale, old.scale) * 0.015;
        }))
            return;
        latest.current = { labels, paints };
        setMeasured(latest.current);
    };
    // The parent supplies a fresh presentation on each host commit, including
    // inherited style changes. Our own measurement commit must not remeasure
    // hinted text recursively under the scale it just applied.
    useMeasuredLayoutEffect(() => { measure(); }, [labels, presentation]);
    useMeasuredLayoutEffect(() => {
        const group = element.current;
        if (!group)
            return;
        let active = true;
        const refresh = () => { if (active)
            measure(); };
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(refresh);
        if (group.ownerSVGElement)
            observer?.observe(group.ownerSVGElement);
        // Inherited CSS can change fonts without a React commit or SVG resize.
        // Observe untransformed text bounds, not our fitted background/group bounds.
        // One observer owns only the current label set and disconnects on replacement.
        group.querySelectorAll("[data-label-kind] > text").forEach(text => observer?.observe(text));
        window.addEventListener("resize", refresh);
        const fonts = document.fonts;
        fonts?.addEventListener("loadingdone", refresh);
        fonts?.addEventListener("loadingerror", refresh);
        return () => {
            active = false;
            observer?.disconnect();
            window.removeEventListener("resize", refresh);
            fonts?.removeEventListener("loadingdone", refresh);
            fonts?.removeEventListener("loadingerror", refresh);
        };
    }, [labels]);
    return (_jsx("g", { ref: element, "data-testid": "drill-diagram-v2-labels", children: labels.map((label, index) => (_jsx(LabelGlyph, { label: label, paint: measured?.labels === labels ? measured.paints[index] : estimatedPaint(label) }, `${label.kind}-${index}`))) }));
}
function LabelGlyph({ label, paint }) {
    const isBadge = label.kind === "number" || label.kind === "sequence";
    const radius = label.width / 2, cx = label.x + radius, cy = label.y + radius;
    const textScale = isBadge ? BADGE_TEXT_SCALE : 1;
    return (_jsxs("g", { "data-label-id": label.id, "data-label-kind": label.kind, children: [isBadge ? (_jsx("circle", { cx: cx, cy: cy, r: radius, fill: "#ffffff", stroke: INK, strokeWidth: radius * 0.14 })) : (_jsx("rect", { x: paint.x, y: paint.y, width: paint.width, height: paint.height, rx: paint.height / 2, fill: "rgba(255,255,255,0.93)" })), _jsx("text", { x: (label.x + label.width / 2) * textScale, y: (label.y + label.height / 2) * textScale, dy: (isBadge ? radius * 0.42 : label.fontSize * 0.33) * textScale, textAnchor: "middle", fontSize: (isBadge ? label.fontSize : label.fontSize * 0.92) * textScale, fontWeight: 700, fill: INK, textRendering: isBadge ? "geometricPrecision" : undefined, transform: isBadge ? `translate(${cx} ${cy}) scale(${paint.scale / textScale}) translate(${-cx * textScale} ${-cy * textScale})` : undefined, children: label.text })] }));
}
