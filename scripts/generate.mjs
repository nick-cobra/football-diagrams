import { readFile, writeFile } from 'node:fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';
import Ajv2020Module from 'ajv/dist/2020.js';
import standaloneModule from 'ajv/dist/standalone/index.js';
import { build } from 'esbuild';
const Ajv2020 = Ajv2020Module.default ?? Ajv2020Module;
const standalone = standaloneModule.default ?? standaloneModule;
const schema = JSON.parse(await readFile('schema/diagram.schema.json', 'utf8'));
const types = await compileFromFile('schema/diagram.schema.json', { bannerComment: '// Generated from schema/diagram.schema.json. Do not edit.', style: { singleQuote: false } });
await writeFile('src/generated/types.ts', types);
const ajv = new Ajv2020({ allErrors: true, strict: true, code: { source: true, esm: true }, inlineRefs: true });
const validate = ajv.compile(schema);
const output = await build({
  stdin: { contents: standalone(ajv, validate), resolveDir: process.cwd(), sourcefile: 'validator.js' },
  bundle: true, format: 'esm', platform: 'neutral', write: false,
});
await writeFile('src/generated/validate.js', '// Generated from schema/diagram.schema.json. Do not edit.\n' + output.outputFiles[0].text);
