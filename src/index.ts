import validate from "./generated/validate.js";
import type { Diagram } from "./generated/types.js";

export * from "./generated/types.js";
export * from "./geometry.js";

/** Copy JSON data without carrying custom prototypes or invoking toJSON hooks. */
function ownData(value: unknown, parents = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") return value;
  if (parents.has(value)) throw new TypeError("Invalid Football Diagrams document");
  parents.add(value);
  const result = Array.isArray(value)
    ? Array.from({ length: value.length }, (_, index) => ownData(value[index], parents))
    : Object.fromEntries(Object.keys(value).map(key => [key, ownData((value as Record<string, unknown>)[key], parents)]));
  parents.delete(value);
  return result;
}

/** Decode the versioned document contract before passing external data to a renderer. */
export function parseDiagram(input: unknown): Diagram {
  const document: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (!validate(document)) throw new TypeError("Invalid Football Diagrams document");
  if (typeof input === "string") return document as Diagram;
  const snapshot = ownData(document);
  if (!validate(snapshot)) throw new TypeError("Invalid Football Diagrams document");
  return snapshot as Diagram;
}

export function stringifyDiagram(document: Diagram): string {
  parseDiagram(document);
  const encoded = JSON.stringify(document);
  // JSON hooks and property enumerability can change the value after validation.
  parseDiagram(encoded);
  return encoded;
}
