"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { INK, type FrameGeometry, type LabelBox } from "./geometry.js";

const useMeasuredLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
// SVG font metrics round at small user-unit sizes. Measure badge glyphs at
// a larger font size, then map them back into metre space with one transform.
const BADGE_TEXT_SCALE = 1000;
interface LabelPaint { x: number; y: number; width: number; height: number; scale: number; shiftX: number; shiftY: number }
const estimatedPaint = (label: LabelBox): LabelPaint => ({ x: label.x, y: label.y, width: label.width, height: label.height, scale: 1, shiftX: 0, shiftY: 0 });
const isBadge = (label: LabelBox) => label.kind === "number" || label.kind === "sequence";

/** Fit one complete pill, preserving its text/background alignment. Font bounds
 * remain in untransformed metre space so observing the fitted group cannot
 * shrink it repeatedly. Badge placement belongs to the authored actor/arrow. */
function fitPill(paint: LabelPaint, geometry: FrameGeometry): LabelPaint {
  const minX = -geometry.margin, minY = -geometry.margin;
  const width = geometry.lengthM + geometry.margin * 2;
  const height = geometry.widthM + geometry.margin * 2;
  const scale = Math.min(1, width / paint.width, height / paint.height);
  const cx = paint.x + paint.width / 2, cy = paint.y + paint.height / 2;
  const halfWidth = paint.width * scale / 2, halfHeight = paint.height * scale / 2;
  return { ...paint, scale,
    shiftX: Math.max(minX + halfWidth, Math.min(minX + width - halfWidth, cx)) - cx,
    shiftY: Math.max(minY + halfHeight, Math.min(minY + height - halfHeight, cy)) - cy,
  };
}

/** Font metrics are a DOM input. Read every label before committing one state
 * update; no per-label effects or interleaved layout reads/style writes. The
 * public metre-space layout stays deterministic and independent of web fonts. */
export function LabelLayer({ labels, geometry, presentation }: { labels: LabelBox[]; geometry: FrameGeometry; presentation: { className?: string; style?: CSSProperties } }) {
  const element = useRef<SVGGElement>(null);
  type Measurement = { labels: LabelBox[]; geometry: FrameGeometry; paints: LabelPaint[] };
  const [measured, setMeasured] = useState<Measurement>();
  const latest = useRef<Measurement>();
  const measure = () => {
    const group = element.current;
    if (!group) return;
    const texts = group.querySelectorAll<SVGTextElement>("[data-label-kind] > text");
    if (texts.length !== labels.length) return;
    const paints = labels.map((label, index): LabelPaint => {
      // getBBox excludes this text's transform. Font hinting can still cause
      // subpixel variation under scale; the update guard keeps that stable.
      const box = texts[index]!.getBBox();
      const paint = estimatedPaint(label);
      if (isBadge(label)) {
        const radius = label.width / 2, cx = label.x + radius, cy = label.y + radius;
        const dx = Math.max(Math.abs(box.x / BADGE_TEXT_SCALE - cx), Math.abs((box.x + box.width) / BADGE_TEXT_SCALE - cx));
        const dy = Math.max(Math.abs(box.y / BADGE_TEXT_SCALE - cy), Math.abs((box.y + box.height) / BADGE_TEXT_SCALE - cy));
        const corner = Math.hypot(dx, dy);
        paint.scale = corner > 0 ? Math.min(1, radius * 0.86 / corner) : 1;
      } else {
        const paddingX = label.fontSize * 0.75, paddingY = label.fontSize * 0.2;
        paint.x = Math.min(label.x, box.x - paddingX);
        paint.y = Math.min(label.y, box.y - paddingY);
        paint.width = Math.max(label.x + label.width, box.x + box.width + paddingX) - paint.x;
        paint.height = Math.max(label.y + label.height, box.y + box.height + paddingY) - paint.y;
      }
      return isBadge(label) ? paint : fitPill(paint, geometry);
    });
    const previous = latest.current;
    if (previous?.labels === labels && previous.geometry === geometry && paints.every((p, i) => {
      const old = previous.paints[i]!;
      return p.x === old.x && p.y === old.y && p.width === old.width && p.height === old.height && p.shiftX === old.shiftX && p.shiftY === old.shiftY && Math.abs(p.scale - old.scale) <= Math.min(p.scale, old.scale) * 0.015;
    })) return;
    latest.current = { labels, geometry, paints };
    setMeasured(latest.current);
  };
  // The parent supplies a fresh presentation on each host commit, including
  // inherited style changes. Our own measurement commit must not remeasure
  // hinted text recursively under the scale it just applied.
  useMeasuredLayoutEffect(() => { measure(); }, [labels, geometry, presentation]);
  useMeasuredLayoutEffect(() => {
    const group = element.current;
    if (!group) return;
    let active = true;
    const refresh = () => { if (active) measure(); };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(refresh);
    if (group.ownerSVGElement) observer?.observe(group.ownerSVGElement);
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
  }, [labels, geometry]);
  return (
    <g ref={element} data-testid="drill-diagram-v2-labels">
      {/* Authored IDs can repeat. Drawing siblings use their layout positions. */}
      {labels.map((label, index) => (
        <LabelGlyph key={`${label.kind}-${index}`} label={label}
          paint={measured?.labels === labels && measured.geometry === geometry ? measured.paints[index]! : isBadge(label) ? estimatedPaint(label) : fitPill(estimatedPaint(label), geometry)} />
      ))}
    </g>
  );
}

function LabelGlyph({ label, paint }: { label: LabelBox; paint: LabelPaint }) {
  const badge = isBadge(label);
  const radius = label.width / 2, cx = label.x + radius, cy = label.y + radius;
  const textScale = badge ? BADGE_TEXT_SCALE : 1;
  return (
    <g data-label-id={label.id} data-label-kind={label.kind}
      transform={!badge && (paint.scale !== 1 || paint.shiftX !== 0 || paint.shiftY !== 0)
        ? `translate(${paint.x + paint.width / 2 + paint.shiftX} ${paint.y + paint.height / 2 + paint.shiftY}) scale(${paint.scale}) translate(${-paint.x - paint.width / 2} ${-paint.y - paint.height / 2})` : undefined}>
      {!badge && <title>{label.text}</title>}
      {badge ? (
        <circle cx={cx} cy={cy} r={radius} fill="#ffffff" stroke={INK} strokeWidth={radius * 0.14} />
      ) : (
        <rect x={paint.x} y={paint.y} width={paint.width} height={paint.height} rx={paint.height / 2} fill="rgba(255,255,255,0.93)" />
      )}
      <text x={(label.x + label.width / 2) * textScale} y={(label.y + label.height / 2) * textScale}
        dy={(badge ? radius * 0.42 : label.fontSize * 0.33) * textScale}
        textAnchor="middle" fontSize={(badge ? label.fontSize : label.fontSize * 0.92) * textScale}
        fontWeight={700} fill={INK} textRendering={badge ? "geometricPrecision" : undefined}
        transform={badge ? `translate(${cx} ${cy}) scale(${paint.scale / textScale}) translate(${-cx * textScale} ${-cy * textScale})` : undefined}>
        {label.text}
      </text>
    </g>
  );
}
