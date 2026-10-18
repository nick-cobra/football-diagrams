export const GRASS_LIGHT = "#5aa25a";
export const GRASS_DARK = "#529952";
export const OUTSIDE_WASH = "rgba(12,42,12,0.20)";
export const LINE_PAINT = "rgba(255,255,255,0.92)";
export const INK = "#22303f";
export const OBJECT_COLOURS = {
    red: "#e04545",
    blue: "#2f7df6",
    yellow: "#f5c518",
    green: "#2e8b57",
    orange: "#f08c2e",
    white: "#ffffff",
    teal: "#14b8a6",
};
export const KIND_FILL = {
    player: "#1d6ff2",
    opponent: "#e04545",
    neutral: "#f0b429",
    coach: "#223047",
};
export const PERSON_KINDS = ["player", "opponent", "neutral", "coach"];
export function frameGeometry(area) {
    const lengthM = area.length_m;
    const widthM = area.width_m;
    const margin = Math.max(2.8, lengthM * 0.09);
    return {
        lengthM,
        widthM,
        margin,
        playerRadius: Math.max(0.72, lengthM / 26),
        unit: Math.max(1.0, lengthM / 20),
        viewBox: `${-margin} ${-margin} ${lengthM + 2 * margin} ${widthM + 2 * margin}`,
        stripeWidth: lengthM / 6,
    };
}
export function grassStripes(geometry) {
    const { margin, lengthM, widthM, stripeWidth } = geometry;
    const stripes = [];
    for (let x = -margin; x < lengthM + margin; x += stripeWidth) {
        const index = Math.round((x + margin) / stripeWidth);
        stripes.push({
            x,
            width: Math.min(stripeWidth, lengthM + margin - x),
            fill: index % 2 ? GRASS_LIGHT : GRASS_DARK,
        });
    }
    return { stripes, y: -margin, height: widthM + 2 * margin };
}
export function personFill(object) {
    if (object.colour)
        return OBJECT_COLOURS[object.colour] ?? KIND_FILL[object.kind] ?? KIND_FILL.player;
    return KIND_FILL[object.kind] ?? KIND_FILL.player;
}
export function objectColour(object) {
    return object.colour ? (OBJECT_COLOURS[object.colour] ?? OBJECT_COLOURS.orange) : OBJECT_COLOURS.orange;
}
export function shade(hex, factor) {
    const n = Number.parseInt(hex.slice(1), 16);
    const channel = (shift) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
    return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}
export function polyPath(points) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join("");
}
export function wavyPath(points, amplitude, wavelength) {
    let d = "";
    for (let segment = 0; segment < points.length - 1; segment += 1) {
        const a = points[segment];
        const b = points[segment + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length === 0)
            continue;
        const ux = dx / length;
        const uy = dy / length;
        const px = -uy;
        const py = ux;
        const steps = Math.max(10, Math.round(length / (wavelength / 6)));
        for (let i = 0; i <= steps; i += 1) {
            const base = (i / steps) * length;
            // Pin the ends flat so the arrow starts and finishes on its stated point.
            const offset = i === 0 || i === steps ? 0 : Math.sin((base / wavelength) * 2 * Math.PI) * amplitude;
            const x = a.x + ux * base + px * offset;
            const y = a.y + uy * base + py * offset;
            d += `${d === "" ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        }
    }
    return d;
}
export function arrowGeometry(arrow, geometry) {
    const { unit } = geometry;
    const shot = arrow.kind === "shot";
    const d = arrow.kind === "dribble"
        ? wavyPath(arrow.points, unit * 0.3, unit * 2.3)
        : polyPath(arrow.points);
    return {
        kind: arrow.kind,
        d,
        strokeWidth: shot ? unit * 0.42 : unit * 0.24,
        dashArray: arrow.kind === "run" ? `${unit * 0.7} ${unit * 0.55}` : undefined,
        markerEnd: shot ? "arrow-heavy" : "arrow",
    };
}
export function isMover(object, frame, geometry) {
    if (frame.arrows.length === 0)
        return false;
    return frame.arrows.some((arrow) => {
        const start = arrow.points[0];
        return Math.hypot(start.x - object.x, start.y - object.y) < geometry.playerRadius * 1.9;
    });
}
function pillBox(text, fontSize) {
    return {
        width: text.length * fontSize * 0.56 + fontSize * 1.5,
        height: fontSize * 1.55,
    };
}
function overlaps(a, b, gap) {
    return (a.x < b.x + b.width + gap &&
        b.x < a.x + a.width + gap &&
        a.y < b.y + b.height + gap &&
        b.y < a.y + a.height + gap);
}
function* candidateOffsets(step) {
    yield { x: 0, y: 0 };
    for (let ring = 1; ring <= 6; ring += 1) {
        yield { x: 0, y: step * ring };
        yield { x: 0, y: -step * ring };
        yield { x: step * ring, y: 0 };
        yield { x: -step * ring, y: 0 };
        yield { x: step * ring, y: step * ring };
        yield { x: -step * ring, y: -step * ring };
    }
}
export function layoutLabels(doc, frame, geometry, options) {
    const thumbnail = options?.thumbnail ?? false;
    const { unit, playerRadius, margin } = geometry;
    const wanted = [];
    const push = (id, kind, text, x, y, fontSize, box) => {
        const size = box ?? pillBox(text, fontSize);
        wanted.push({
            id,
            kind,
            text,
            x,
            y,
            width: size.width,
            height: size.height,
            fontSize,
            anchorX: x,
            anchorY: y,
        });
    };
    if (doc.area.label && !thumbnail) {
        const fontSize = unit * 0.8;
        const { width, height } = pillBox(doc.area.label, fontSize);
        push("area", "area", doc.area.label, 0, -margin * 0.5 - height / 2, fontSize, { width, height });
    }
    for (const [index, area] of (frame.areas ?? []).entries()) {
        const fontSize = unit * 0.7;
        const { width, height } = pillBox(area.label, fontSize);
        push(area.id ?? `sub-area-${index}`, "sub_area", area.label, area.x + unit * 0.3, area.y + unit * 0.3, fontSize, { width, height });
    }
    for (const [index, object] of frame.objects.entries()) {
        if (!PERSON_KINDS.includes(object.kind))
            continue;
        const short = object.number != null ? String(object.number) : (object.short ?? (object.kind === "coach" ? "C" : ""));
        if (short && !thumbnail) {
            const radius = unit * 0.58;
            push(`object-${index}-badge`, "number", short, object.x - playerRadius * 0.95 - radius, object.y + playerRadius * 0.8 - radius, radius * (short.length > 1 ? 0.95 : 1.25), { width: radius * 2, height: radius * 2 });
        }
    }
    for (const [index, arrow] of frame.arrows.entries()) {
        if (arrow.sequence == null || thumbnail)
            continue;
        const midpoint = Math.floor((arrow.points.length - 1) / 2);
        const a = arrow.points[midpoint];
        const b = arrow.points[midpoint + 1] ?? a;
        const cx = arrow.badge ? arrow.badge.x : (a.x + b.x) / 2;
        const cy = arrow.badge ? arrow.badge.y : (a.y + b.y) / 2 - unit * 1.15;
        const radius = unit * 0.72;
        push(`arrow-${index}-sequence`, "sequence", String(arrow.sequence), cx - radius, cy - radius, unit * 0.9, { width: radius * 2, height: radius * 2 });
    }
    for (const [index, object] of frame.objects.entries()) {
        // Two characters or fewer already fit inside the glyph's own badge, so a
        // pill beside it would repeat what the picture says.
        if (!object.label || object.label.length <= 2)
            continue;
        const fontSize = unit * 0.65;
        const { width, height } = pillBox(object.label, fontSize);
        push(`object-${index}-label`, "object", object.label, object.x - playerRadius, object.y + playerRadius * 1.9 - height / 2, fontSize, { width, height });
    }
    for (const [index, arrow] of frame.arrows.entries()) {
        if (!arrow.label)
            continue;
        const last = arrow.points[arrow.points.length - 1];
        const fontSize = unit * 0.65;
        const { width, height } = pillBox(arrow.label, fontSize);
        push(`arrow-${index}-label`, "arrow", arrow.label, last.x - unit, last.y - unit * 1.6 - height / 2, fontSize, { width, height });
    }
    const gap = unit * 0.18;
    const step = unit * 1.0;
    const placed = [];
    for (const label of wanted) {
        let chosen = label;
        for (const offset of candidateOffsets(step)) {
            const candidate = { ...label, x: label.anchorX + offset.x, y: label.anchorY + offset.y };
            if (!placed.some((other) => overlaps(candidate, other, gap))) {
                chosen = candidate;
                break;
            }
            // Keep the last candidate so a hopelessly crowded frame still renders
            // every label rather than dropping one silently.
            chosen = candidate;
        }
        placed.push(chosen);
    }
    return placed;
}
