const MAX_WAVE_POINTS = 100_000;
/** Keep original sample indices/phase. Removed runs stay wholly outside the
 * padded viewport, so their straight connectors cannot change visible pixels.
 * Endpoint neighbours preserve the original marker orientation and joins. */
function sampleRanges(a, dx, dy, steps, bounds) {
    if (!bounds)
        return [[0, steps]];
    let enter = 0, leave = 1;
    const axes = [
        [a.x, dx, bounds.left, bounds.right], [a.y, dy, bounds.top, bounds.bottom],
    ];
    for (const [start, delta, low, high] of axes) {
        if (delta === 0) {
            if (start < low || start > high) {
                enter = 1;
                leave = 0;
                break;
            }
        }
        else {
            const t0 = (low - start) / delta, t1 = (high - start) / delta;
            enter = Math.max(enter, Math.min(t0, t1));
            leave = Math.min(leave, Math.max(t0, t1));
        }
    }
    const ranges = [[0, 1]];
    if (enter <= leave)
        ranges.push([Math.max(0, Math.floor(enter * steps) - 1), Math.min(steps, Math.ceil(leave * steps) + 1)]);
    ranges.push([steps - 1, steps]);
    return ranges;
}
export function sampleWave(points, amplitude, wavelength, emit, bounds) {
    if (!Number.isFinite(amplitude) || !Number.isFinite(wavelength) || wavelength <= 0 ||
        !points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) {
        throw new RangeError('Wave arguments must be finite and wavelength must be positive');
    }
    let count = 0;
    for (let segment = 0; segment < points.length - 1; segment += 1) {
        const a = points[segment], b = points[segment + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length === 0)
            continue;
        const ux = dx / length, uy = dy / length;
        const steps = Math.max(10, Math.round(length / (wavelength / 6)));
        if (!Number.isFinite(steps) || count + steps + 1 > MAX_WAVE_POINTS) {
            throw new RangeError(`Wave sampling exceeds ${MAX_WAVE_POINTS} generated points`);
        }
        count += steps + 1;
        let last = -1;
        for (const [start, end] of sampleRanges(a, dx, dy, steps, bounds)) {
            for (let i = Math.max(start, last + 1); i <= end; i += 1) {
                const base = (i / steps) * length;
                const offset = i === 0 || i === steps ? 0 : Math.sin((base / wavelength) * 2 * Math.PI) * amplitude;
                const x = a.x + ux * base - uy * offset, y = a.y + uy * base + ux * offset;
                if (!Number.isFinite(x) || !Number.isFinite(y))
                    throw new RangeError('Wave coordinates must remain finite');
                emit(x, y);
                last = i;
            }
        }
    }
}
