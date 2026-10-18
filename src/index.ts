import validate from "./generated/validate.js";
import type { Diagram } from "./generated/types.js";

export * from "./generated/types.js";
export * from "./geometry.js";

/** Decode the versioned document contract before passing external data to a renderer. */
export function parseDiagram(input: unknown): Diagram {
  const document: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (!validate(document)) throw new TypeError("Invalid Football Diagrams document");
  return document as Diagram;
}

export function stringifyDiagram(document: Diagram): string {
  return JSON.stringify(parseDiagram(document));
}
