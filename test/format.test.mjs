import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseDiagram } from '../dist/index.js';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
test('a supported document is accepted from an object and JSON text', async () => {
  const doc = await read('../fixtures/valid/pass-and-move.json');
  assert.deepEqual(parseDiagram(doc), doc);
  assert.deepEqual(parseDiagram(JSON.stringify(doc)), doc);
});
test('an unsupported format version is rejected at the public parser boundary', async () => {
  const doc = await read('../fixtures/invalid/unsupported-version.json');
  assert.throws(() => parseDiagram(doc), /Invalid Football Diagrams document/);
});
test('a missing format version is rejected', async () => {
  const doc = await read('../fixtures/valid/pass-and-move.json');
  delete doc.format_version;
  assert.throws(() => parseDiagram(doc), /Invalid Football Diagrams document/);
});
