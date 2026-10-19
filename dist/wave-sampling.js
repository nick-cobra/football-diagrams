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
export function sampleWave(points, amplitude, wavelength, emit, bounds, pointBudget = Infinity) {
    if (!Number.isFinite(amplitude) || !Number.isFinite(wavelength) || wavelength <= 0 ||
        !points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) {
        throw new RangeError('Wave arguments must be finite and wavelength must be positive');
    }
    let count = 0;
    const segments = points.slice(0, -1).flatMap((a, index) => {
        const b = points[index + 1], dx = b.x - a.x, dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length === 0)
            return [];
        const steps = Math.max(10, Math.round(length / (wavelength / 6)));
        if (!Number.isFinite(steps) || count + steps + 1 > MAX_WAVE_POINTS) {
            throw new RangeError(`Wave sampling exceeds ${MAX_WAVE_POINTS} generated points`);
        }
        count += steps + 1;
        return [{ a, dx, dy, length, steps }];
    });
    // Frame-wide allocation is supplied by renderers only. Public full paths are
    // unchanged. Count clipped ranges before allocating any sampled geometry.
    let factor = 1;
    const stepCount = (length) => Math.max(10, Math.round(length / (wavelength * factor / 6)));
    while (segments.reduce((n, s) => n + 4 + sampleRanges(s.a, s.dx, s.dy, stepCount(s.length), bounds)
        .reduce((sum, [a, b]) => sum + b - a + 1, 0), 0) > pointBudget) {
        if (factor >= 2 ** 20)
            throw new RangeError('Wave point budget is too small');
        factor *= 2;
    }
    for (const { a, dx, dy, length, steps: originalSteps } of segments) {
        const ux = dx / length, uy = dy / length, steps = stepCount(length);
        const output = (i, count, period) => {
            const base = (i / count) * length;
            const offset = i === 0 || i === count ? 0 : Math.sin((base / period) * 2 * Math.PI) * amplitude;
            const x = a.x + ux * base - uy * offset, y = a.y + uy * base + ux * offset;
            if (!Number.isFinite(x) || !Number.isFinite(y))
                throw new RangeError('Wave coordinates must remain finite');
            emit(x, y);
        };
        if (factor > 1) {
            output(0, originalSteps, wavelength);
            output(1, originalSteps, wavelength);
        }
        let last = -1;
        for (const [start, end] of sampleRanges(a, dx, dy, steps, bounds)) {
            for (let i = Math.max(start, last + 1); i <= end; i += 1) {
                if (factor === 1 || (i / steps > 1 / originalSteps && i / steps < (originalSteps - 1) / originalSteps)) {
                    output(i, steps, wavelength * factor);
                }
                last = i;
            }
        }
        if (factor > 1) {
            output(originalSteps - 1, originalSteps, wavelength);
            output(originalSteps, originalSteps, wavelength);
        }
    }
}
