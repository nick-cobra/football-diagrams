import assert from 'node:assert/strict';
import test from 'node:test';
import { svgTextCases, svgImageCases } from './svg-text-cases.mjs';

test('public SSR declares the SVG namespace for standalone images', () => {
  for (const { name, svg } of svgImageCases()) {
    assert.match(svg, /^<svg\b[^>]* xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, name);
  }
});

test('public SSR replaces XML-forbidden code points in every emitted carrier without changing JSON', () => {
  const cases = svgTextCases();
  for (const { name, svg, selector, expected, forbidden } of cases) {
    assert.doesNotMatch(svg, /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/u, name);
    if (selector && forbidden) assert.ok(svg.includes(expected), `${name}: replacement must be visible`);
  }
});

test('public SSR preserves XML-legal whitespace and Unicode before XML normalisation', () => {
  for (const { name, svg, selector, expected, forbidden } of svgTextCases()) {
    if (selector && !forbidden && !name.endsWith('XML metacharacters')) {
      assert.ok(svg.includes(expected), `${name}: legal characters must remain intact`);
    }
  }
});
