"use client";

import { renderArrowGeometry } from "./rendering-geometry.js";

import { useId, useMemo, type CSSProperties } from "react";
import type { Diagram, Frame, DiagramObject } from "./generated/types.js";
import {
  INK,
  LINE_PAINT,
  OUTSIDE_WASH,
  PERSON_KINDS,
  frameGeometry,
  grassStripes,
  isMover,
  layoutLabels,
  objectColour,
  personFill,
  shade,
  type FrameGeometry,
  type LabelBox,
} from "./geometry.js";

export interface DiagramSvgProps {
  className?: string;
  style?: CSSProperties;
  diagram: Diagram;
  "data-testid"?: string;
  frameIndex?: number;
  thumbnail?: boolean;
}

export function DiagramSvg({ diagram, frameIndex = 0, thumbnail = false, className, style, "data-testid": testId = "football-diagram" }: DiagramSvgProps) {
  const markerPrefix = useId();
  const geometry = useMemo(() => frameGeometry(diagram.area), [diagram.area]);
  const frame = diagram.frames[frameIndex];
  const labels = useMemo(
    () => (frame ? layoutLabels(diagram, frame, geometry, { thumbnail }) : []),
    [diagram, frame, geometry, thumbnail],
  );

  if (!frame) return null;

  const grass = grassStripes(geometry);
  const { lengthM, widthM, margin, unit } = geometry;
  const arrowMarker = `${markerPrefix}-arrow`;
  const heavyMarker = `${markerPrefix}-arrow-heavy`;

  return (
    <svg
      viewBox={geometry.viewBox}
      role="img"
      aria-label={`${diagram.title} — ${frame.title}`}
      data-testid={testId}
      data-frame-id={frame.id}
      data-thumbnail={thumbnail ? "true" : undefined}
      className={className}
      width="100%"
      style={style}
    >
      <defs>
        <ArrowMarker id={arrowMarker} size={5.4} />
        <ArrowMarker id={heavyMarker} size={3.6} />
      </defs>

      {grass.stripes.map((stripe, index) => (
        <rect
          key={`stripe-${index}`}
          x={stripe.x}
          y={grass.y}
          width={stripe.width}
          height={grass.height}
          fill={stripe.fill}
        />
      ))}

      {/* Dim everything outside the playing grid, then paint the grid's line. */}
      <path
        d={`M${-margin} ${-margin} H${lengthM + margin} V${widthM + margin} H${-margin} Z M0 0 V${widthM} H${lengthM} V0 Z`}
        fill={OUTSIDE_WASH}
        fillRule="evenodd"
      />
      <rect
        x={0}
        y={0}
        width={lengthM}
        height={widthM}
        fill="none"
        stroke={LINE_PAINT}
        strokeWidth={unit * 0.16}
      />

      {(frame.areas ?? []).map((area, index) => (
        <rect
          key={`sub-area-${index}`}
          x={area.x}
          y={area.y}
          width={area.width}
          height={area.height}
          fill={area.colour ? `${objectColour(area)}22` : "rgba(255,255,255,0.08)"}
          stroke={area.colour ? objectColour(area) : LINE_PAINT}
          strokeWidth={unit * 0.1}
          strokeDasharray={`${unit * 0.5} ${unit * 0.4}`}
        />
      ))}

      <g>
        {frame.objects.map((object, index) => (
          <EquipmentGlyph key={`equip-${index}`} object={object} geometry={geometry} />
        ))}
      </g>

      <g>
        {frame.arrows.map((arrow, index) => {
          const geo = renderArrowGeometry(arrow, geometry);
          const markerEnd = geo.markerEnd === "arrow-heavy" ? heavyMarker : arrowMarker;
          return (
            <g key={`arrow-${index}`} data-arrow-kind={geo.kind}>
              {/* Drop shadow first so a white arrow stays legible over grass. */}
              <path
                d={geo.d}
                fill="none"
                stroke="rgba(0,0,0,0.28)"
                strokeWidth={geo.strokeWidth + unit * 0.1}
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(0.12 0.16)"
              />
              <path
                d={geo.d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={geo.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={geo.dashArray}
                markerEnd={`url(#${markerEnd})`}
              />
            </g>
          );
        })}
      </g>

      <g>
        {frame.objects.map((object, index) => (
          <PersonGlyph
            key={`person-${index}`}
            object={object}
            frame={frame}
            geometry={geometry}
          />
        ))}
      </g>

      <g data-testid="drill-diagram-v2-labels">
        {/* Authored IDs may repeat or match generated IDs. These drawing-only
            siblings use their layout positions for internal React identity. */}
        {labels.map((label, index) => (
          <LabelGlyph key={`${label.kind}-${index}`} label={label} />
        ))}
      </g>
    </svg>
  );
}

function ArrowMarker({ id, size }: { id: string; size: number }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={7.5}
      refY={5}
      markerWidth={size}
      markerHeight={size}
      orient="auto-start-reverse"
    >
      <path d="M0 0.6 L9.5 5 L0 9.4 z" fill="#ffffff" />
    </marker>
  );
}

function LabelGlyph({ label }: { label: LabelBox }) {
  const isBadge = label.kind === "number" || label.kind === "sequence";
  if (isBadge) {
    const radius = label.width / 2;
    return (
      <g data-label-id={label.id} data-label-kind={label.kind}>
        <circle
          cx={label.x + radius}
          cy={label.y + radius}
          r={radius}
          fill="#ffffff"
          stroke={INK}
          strokeWidth={radius * 0.14}
        />
        <text
          x={label.x + radius}
          y={label.y + radius}
          dy={radius * 0.42}
          textAnchor="middle"
          fontSize={label.fontSize}
          fontWeight={700}
          fill={INK}
        >
          {label.text}
        </text>
      </g>
    );
  }

  return (
    <g data-label-id={label.id} data-label-kind={label.kind}>
      <rect
        x={label.x}
        y={label.y}
        width={label.width}
        height={label.height}
        rx={label.height / 2}
        fill="rgba(255,255,255,0.93)"
      />
      <text
        x={label.x + label.width / 2}
        y={label.y + label.height / 2}
        dy={label.fontSize * 0.33}
        textAnchor="middle"
        fontSize={label.fontSize * 0.92}
        fontWeight={700}
        fill={INK}
      >
        {label.text}
      </text>
    </g>
  );
}

function Cone({ x, y, size, fill, unit }: { x: number; y: number; size: number; fill: string; unit: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y + size * 0.62} rx={size * 0.78} ry={size * 0.3} fill="rgba(0,0,0,0.22)" />
      <path
        d={`M${x} ${y - size} L${x + size * 0.8} ${y + size * 0.62} L${x - size * 0.8} ${y + size * 0.62} Z`}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={unit * 0.1}
        strokeLinejoin="round"
      />
    </g>
  );
}

function Ball({ x, y, r, unit }: { x: number; y: number; r: number; unit: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#ffffff" stroke={INK} strokeWidth={unit * 0.07} />
      <circle cx={x} cy={y} r={r * 0.34} fill={INK} />
      {Array.from({ length: 5 }, (_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        return (
          <circle
            key={i}
            cx={x + Math.cos(angle) * r * 0.68}
            cy={y + Math.sin(angle) * r * 0.68}
            r={r * 0.14}
            fill={INK}
          />
        );
      })}
    </g>
  );
}

function EquipmentGlyph({ object, geometry }: { object: DiagramObject; geometry: FrameGeometry }) {
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
    return (
      <g data-object-kind="gate">
        {/* The colour band appears only when the gate's colour is the call. */}
        {object.colour && object.colour !== "orange" && (
          <>
            <path d={bandPath} fill="#ffffff" opacity={0.55} />
            <path d={bandPath} fill={colour} opacity={0.45} />
          </>
        )}
        <Cone x={c1.x} y={c1.y} size={pr * 0.8} fill={colour} unit={unit} />
        <Cone x={c2.x} y={c2.y} size={pr * 0.8} fill={colour} unit={unit} />
      </g>
    );
  }

  if (object.kind === "cone") {
    return (
      <g data-object-kind="cone">
        <Cone x={object.x} y={object.y} size={pr * 0.8} fill={colour} unit={unit} />
      </g>
    );
  }

  if (object.kind === "flat_marker") {
    return (
      <ellipse
        data-object-kind="flat_marker"
        cx={object.x}
        cy={object.y}
        rx={pr * 0.5}
        ry={pr * 0.26}
        fill="none"
        stroke={colour}
        strokeWidth={unit * 0.16}
      />
    );
  }

  if (object.kind === "mannequin") {
    const w = pr * 1.0;
    const h = pr * 2.2;
    return (
      <g data-object-kind="mannequin">
        <ellipse cx={object.x} cy={object.y + h / 2} rx={w * 0.75} ry={w * 0.32} fill="rgba(0,0,0,0.22)" />
        <rect
          x={object.x - w / 2}
          y={object.y - h / 2}
          width={w}
          height={h}
          rx={w / 2}
          fill="#2b3a4d"
          stroke="#ffffff"
          strokeWidth={unit * 0.09}
        />
        <circle
          cx={object.x}
          cy={object.y - h / 2 - w * 0.1}
          r={w * 0.42}
          fill="#2b3a4d"
          stroke="#ffffff"
          strokeWidth={unit * 0.09}
        />
      </g>
    );
  }

  if (object.kind === "pole") {
    return (
      <g data-object-kind="pole">
        <line
          x1={object.x}
          y1={object.y - pr * 1.2}
          x2={object.x}
          y2={object.y + pr * 1.2}
          stroke="#f0e13c"
          strokeWidth={unit * 0.16}
        />
        <circle cx={object.x} cy={object.y - pr * 1.2} r={unit * 0.2} fill="#f0e13c" />
      </g>
    );
  }

  if (object.kind === "ladder") {
    const w = pr * 3.4;
    const h = pr * 1.15;
    return (
      <g data-object-kind="ladder">
        <rect
          x={object.x - w / 2}
          y={object.y - h / 2}
          width={w}
          height={h}
          fill="none"
          stroke="#ffd23c"
          strokeWidth={unit * 0.13}
        />
        {[1, 2, 3].map((i) => (
          <line
            key={i}
            x1={object.x - w / 2 + (w * i) / 4}
            y1={object.y - h / 2}
            x2={object.x - w / 2 + (w * i) / 4}
            y2={object.y + h / 2}
            stroke="#ffd23c"
            strokeWidth={unit * 0.13}
          />
        ))}
      </g>
    );
  }

  if (object.kind === "goal" || object.kind === "mini_goal") {
    const mouth = object.width ?? (object.kind === "goal" ? 6 : 2.4);
    const depth = object.kind === "goal" ? 1.4 : 0.9;
    return (
      <g data-object-kind={object.kind}>
        <rect
          x={object.x}
          y={object.y - mouth / 2}
          width={depth}
          height={mouth}
          fill="rgba(255,255,255,0.9)"
          stroke={INK}
          strokeWidth={unit * 0.09}
        />
        {[1, 2, 3, 4].map((i) => (
          <line
            key={`h${i}`}
            x1={object.x}
            y1={object.y - mouth / 2 + (mouth * i) / 5}
            x2={object.x + depth}
            y2={object.y - mouth / 2 + (mouth * i) / 5}
            stroke="#8b97a5"
            strokeWidth={unit * 0.045}
          />
        ))}
        {[1, 2].map((i) => (
          <line
            key={`v${i}`}
            x1={object.x + (depth * i) / 3}
            y1={object.y - mouth / 2}
            x2={object.x + (depth * i) / 3}
            y2={object.y + mouth / 2}
            stroke="#8b97a5"
            strokeWidth={unit * 0.045}
          />
        ))}
      </g>
    );
  }

  return null;
}

function PersonGlyph({
  object,
  frame,
  geometry,
}: {
  object: DiagramObject;
  frame: Frame;
  geometry: FrameGeometry;
}) {
  const { playerRadius: pr, unit } = geometry;

  if (object.kind === "ball") {
    return (
      <g data-object-kind="ball">
        <Ball x={object.x} y={object.y} r={pr * 0.55} unit={unit} />
      </g>
    );
  }

  if (!(PERSON_KINDS as readonly string[]).includes(object.kind)) return null;

  const fill = personFill(object);
  const ring = isMover(object, frame, geometry);

  return (
    <g data-object-kind={object.kind}>
      <ellipse cx={object.x} cy={object.y + pr * 0.78} rx={pr * 0.95} ry={pr * 0.38} fill="rgba(0,0,0,0.25)" />
      {ring && (
        <circle
          cx={object.x}
          cy={object.y}
          r={pr * 1.42}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={unit * 0.14}
        />
      )}
      {/* Shoulders then head: a person from above, not a token. */}
      <ellipse
        cx={object.x}
        cy={object.y + pr * 0.18}
        rx={pr}
        ry={pr * 0.66}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={unit * 0.11}
      />
      <circle
        cx={object.x}
        cy={object.y - pr * 0.34}
        r={pr * 0.5}
        fill={shade(fill, 0.78)}
        stroke="#ffffff"
        strokeWidth={unit * 0.09}
      />
      {object.ball && <Ball x={object.x + pr * 1.25} y={object.y + pr * 0.7} r={pr * 0.55} unit={unit} />}
    </g>
  );
}
