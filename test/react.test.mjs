import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiagramSvg } from '../dist/react.js';
import { parseDiagram, frameGeometry, layoutLabels, arrowGeometry } from '../dist/index.js';

const fixture = async name => parseDiagram(await readFile(new URL(`../fixtures/valid/${name}.json`, import.meta.url), 'utf8'));

test('the React package renders every authored object and arrow kind', async () => {
  const diagram = await fixture('all-kinds');
  const html = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram }));
  const kinds = [...html.matchAll(/data-object-kind="([^"]+)"/g)].map(match => match[1]);
  assert.equal(kinds.length, 13);
  assert.deepEqual(new Set(kinds), new Set(diagram.frames[0].objects.map(object => object.kind)));
  assert.equal([...html.matchAll(/data-arrow-kind=/g)].length, 4);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Equipment and movement/);
});

test('empty and invalid frame selection produce no diagram', async () => {
  const diagram = await fixture('pass-and-move');
  for (const frameIndex of [-1, 4]) {
    assert.equal(renderToStaticMarkup(React.createElement(DiagramSvg, { diagram, frameIndex })), '');
  }
  assert.equal(renderToStaticMarkup(React.createElement(DiagramSvg, { diagram: await fixture('empty') })), '');
});

test('frame selection changes the authored positions and accessible title', async () => {
  const diagram = await fixture('multi-frame');
  const first = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram, frameIndex: 0 }));
  const next = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram, frameIndex: 1 }));
  assert.match(first, /data-frame-id="setup"/);
  assert.match(next, /data-frame-id="move"/);
  assert.notEqual(first, next);
});

test('two diagrams in one React tree have distinct marker IDs', async () => {
  const diagram = await fixture('pass-and-move');
  const html = renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(DiagramSvg, { diagram }), React.createElement(DiagramSvg, { diagram })));
  const ids = [...html.matchAll(/<marker id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 4);
  assert.equal(new Set(ids).size, 4);
});

test('thumbnail mode omits badges and area label while retaining the diagram', async () => {
  const diagram = await fixture('pass-and-move');
  const geometry = frameGeometry(diagram.area);
  const labels = layoutLabels(diagram, diagram.frames[0], geometry, { thumbnail: true });
  assert.ok(labels.every(label => !['area', 'number', 'sequence'].includes(label.kind)));
  const html = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram, thumbnail: true }));
  assert.match(html, /data-thumbnail="true"/);
  assert.equal([...html.matchAll(/data-object-kind=/g)].length, diagram.frames[0].objects.length);
});

test('rectangular dimensions and movement notation retain their geometry', async () => {
  const diagram = await fixture('all-kinds');
  const geometry = frameGeometry(diagram.area);
  assert.equal(geometry.lengthM, 40);
  assert.equal(geometry.widthM, 30);
  const shapes = diagram.frames[0].arrows.map(arrow => arrowGeometry(arrow, geometry));
  assert.equal(shapes[0].dashArray, undefined);
  assert.ok(shapes[1].dashArray);
  assert.ok(shapes[3].strokeWidth > shapes[0].strokeWidth);
  assert.ok(shapes[2].d.split('L').length > 10);
});

test('text is escaped by the renderer', async () => {
  const diagram = await fixture('pass-and-move');
  diagram.frames[0].objects[0].label = '<script>alert(1)</script>';
  const html = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram }));
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
