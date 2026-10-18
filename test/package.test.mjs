import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('the source distribution contains Kotlin sources and no build caches', () => {
  const [pack] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' }));
  const files = pack.files.map(file => file.path);
  assert.ok(files.includes('dist/react.js'));
  assert.ok(files.includes('kotlin/gradlew'));
  assert.ok(files.some(file => file.endsWith('/FootballDiagram.kt')));
  assert.ok(files.includes('schema/diagram.schema.json'));
  assert.ok(files.includes('fixtures/valid/all-kinds.json'));
  assert.ok(files.every(file => !/(^|\/)(build|node_modules|\.gradle|\.kotlin)(\/|$)/.test(file)));
});
