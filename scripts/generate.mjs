import { readFile, writeFile } from 'node:fs/promises';
import { compile } from 'json-schema-to-typescript';
import assert from 'node:assert/strict';
import Ajv2020Module from 'ajv/dist/2020.js';
import standaloneModule from 'ajv/dist/standalone/index.js';
import { build } from 'esbuild';
const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
const standalone = standaloneModule.default ?? standaloneModule;
const schema = JSON.parse(await readFile('schema/diagram.schema.json', 'utf8'));
const schemaV2 = JSON.parse(await readFile('schema/diagram-v2.schema.json', 'utf8'));
// Format2 changes equipment meaning, with the same document structure. Refuse
// an unnoticed structural divergence rather than generating misleading types.
assert.deepEqual({ ...schemaV2, $id: schema.$id, properties: { ...schemaV2.properties, format_version: schema.properties.format_version } }, schema);
const supportedTypes = { ...schema, properties: { ...schema.properties, format_version: { type: 'integer', enum: [1, 2] } } };
const bannerComment = '// Generated from schema/diagram.schema.json and schema/diagram-v2.schema.json. Do not edit.';
const types = await compile(supportedTypes, 'Diagram', { ignoreMinAndMaxItems: true, bannerComment, style: { singleQuote: false } });
await writeFile('src/generated/types.ts', types);
const ajv = new Ajv2020({ allErrors: true, strict: true, ownProperties: true, code: { source: true, esm: true }, inlineRefs: true });
ajv.addSchema(schema);
ajv.addSchema(schemaV2);
const output = await build({
  stdin: { contents: standalone(ajv, { validateFormat1: schema.$id, validateFormat2: schemaV2.$id }), resolveDir: process.cwd(), sourcefile: 'validator.js' },
  bundle: true, format: 'esm', platform: 'neutral', write: false,
});
await writeFile('src/generated/validate.js', bannerComment + '\n' + output.outputFiles[0].text);
