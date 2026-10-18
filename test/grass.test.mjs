import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { frameGeometry, grassStripes } from '../dist/geometry.js';

test('valid tiny pitches produce bounded, finite grass and cover the viewport', () => {
  for (const length_m of [Number.MIN_VALUE, 1e-50, 1e-7, 0.01, 30, 120]) {
    const geometry = frameGeometry({ shape: 'rectangle', length_m, width_m: 20 });
    // Interrupt even a non-progressing loop, so this regression cannot hang CI.
    const { stripes } = runInNewContext('grassStripes(geometry)', { grassStripes, geometry }, { timeout: 100 });
    assert.ok(stripes.length > 0 && stripes.length <= 256, `stripe count for ${length_m}`);
    assert.equal(stripes[0].x, -geometry.margin);
    let edge = -geometry.margin;
    for (const stripe of stripes) {
      assert.ok(Number.isFinite(stripe.x) && Number.isFinite(stripe.width));
      assert.ok(stripe.width > 0);
      assert.ok(Math.abs(stripe.x - edge) < 1e-10);
      edge = stripe.x + stripe.width;
    }
    assert.ok(Math.abs(edge - (length_m + geometry.margin)) < 1e-10);
  }
});

test('ordinary grass retains six pitch stripes plus its external margin', () => {
  const { stripes } = grassStripes(frameGeometry({ shape:'rectangle', length_m:30, width_m:20 }));
  assert.equal(stripes.length, 8);
  stripes.forEach((stripe, i) => {
    assert.ok(Math.abs(stripe.x - (-2.8 + i * 5)) < 1e-10);
    assert.ok(Math.abs(stripe.width - (i === 7 ? 0.6 : 5)) < 1e-10);
    assert.equal(stripe.fill, i % 2 ? '#5aa25a' : '#529952');
  });
});

test('a non-empty tiny diagram renders finite SVG', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { DiagramSvg } = await import('../dist/react.js');
  const diagram = { format_version:1, title:'Tiny pitch', area:{shape:'rectangle', length_m:1e-50, width_m:20}, frames:[{id:'tiny',title:'Tiny frame',objects:[],arrows:[]}] };
  const html = runInNewContext('renderToStaticMarkup(createElement(DiagramSvg, {diagram}))',
    {renderToStaticMarkup,createElement,DiagramSvg,diagram}, {timeout:1000});
  assert.match(html, /<svg/);
  assert.doesNotMatch(html, /NaN|Infinity/);
  assert.equal([...html.matchAll(/fill="#5[2a]/g)].length, 256);
});
