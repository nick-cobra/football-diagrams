import type { Diagram } from "./generated/types.js";
export * from "./generated/types.js";
export * from "./geometry.js";
/** Decode the versioned document contract before passing external data to a renderer. */
export declare function parseDiagram(input: unknown): Diagram;
export declare function stringifyDiagram(document: Diagram): string;
