import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { parseDiagram, stringifyDiagram } from '../dist/index.js';

for (const kind of ['valid', 'invalid']) {
  const directory = new URL(`../fixtures/${kind}/`, import.meta.url);
  const files = (await readdir(directory)).filter(name => name.endsWith('.json'));
  assert.ok(files.length >= (kind === 'valid' ? 7 : 14));
  for (const name of files) {
    test(`${kind} shared fixture: ${name}`, async () => {
      const json = await readFile(new URL(name, directory), 'utf8');
      if (kind === 'valid') {
        const diagram = parseDiagram(json);
        assert.deepEqual(parseDiagram(stringifyDiagram(diagram)), diagram);
      } else {
        assert.throws(() => parseDiagram(json));
      }
    });
  }
}

test('non-finite numbers supplied as JavaScript objects are rejected', async () => {
  const diagram = parseDiagram(await readFile(new URL('../fixtures/valid/pass-and-move.json', import.meta.url), 'utf8'));
  for (const value of [NaN, Infinity, -Infinity]) {
    diagram.area.length_m = value;
    assert.throws(() => parseDiagram(diagram));
  }
});
