import validate from "./generated/validate.js";
export * from "./generated/types.js";
export * from "./geometry.js";
/** Decode the versioned document contract before passing external data to a renderer. */
export function parseDiagram(input) {
    const document = typeof input === "string" ? JSON.parse(input) : input;
    if (!validate(document))
        throw new TypeError("Invalid Football Diagrams document");
    return document;
}
export function stringifyDiagram(document) {
    return JSON.stringify(parseDiagram(document));
}
