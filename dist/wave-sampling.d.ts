import type { Point } from './generated/types.js';
export interface WaveBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export declare function sampleWave(points: readonly Point[], amplitude: number, wavelength: number, emit: (x: number, y: number) => void, bounds?: WaveBounds, pointBudget?: number): void;
