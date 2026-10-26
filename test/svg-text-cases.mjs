import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseDiagram, stringifyDiagram } from 'football-diagrams';
import { DiagramSvg } from 'football-diagrams/react';

// Shared by the Node SSR assertions and the browser's real XML parser. Import
// the public package entries, not a test implementation of the renderer.
const carriers = [
  ['diagram title', doc => doc, 'title', 'svg', 'aria-label'],
  ['frame title', doc => doc.frames[0], 'title', 'svg', 'aria-label'],
  ['frame ID', doc => doc.frames[0], 'id', 'svg', 'data-frame-id'],
  ['area label', doc => doc.area, 'label', '[data-label-kind="area"] text'],
  ['object label', doc => doc.frames[0].objects[0], 'label', '[data-label-kind="object"] text'],
  ['short badge', doc => doc.frames[0].objects[0], 'short', '[data-label-kind="number"] text'],
  ['zone ID', doc => doc.frames[0].areas[0], 'id', '[data-label-kind="sub_area"]', 'data-label-id'],
  ['zone label', doc => doc.frames[0].areas[0], 'label', '[data-label-kind="sub_area"] text'],
  ['arrow label', doc => doc.frames[0].arrows[0], 'label', '[data-label-kind="arrow"] text'],
  ['unrendered caption', doc => doc.frames[0], 'caption'],
];

const forbidden = [
  ...Array.from({ length: 32 }, (_, code) => code).filter(code => ![9, 10, 13].includes(code)),
  0xD800, 0xDBFF, 0xDC00, 0xDFFF, 0xFFFE, 0xFFFF,
];
const allowed = [9, 10, 13, 0x20, 0x7F, 0x85, 0xD7FF, 0xE000, 0xFFFD, 0x4E2D, 0x1F680, 0x10000, 0x1FFFE, 0x10FFFF];
const characters = [
  ...forbidden.map(code => ({ name: `U+${code.toString(16)}`, raw: String.fromCodePoint(code), shown: '\uFFFD' })),
  ...allowed.map(code => ({ name: `U+${code.toString(16)}`, raw: String.fromCodePoint(code), shown: String.fromCodePoint(code) })),
  { name: 'XML metacharacters', raw: '&<>"\'', shown: '&<>"\'' },
];

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export function svgTextCases() {
  const cases = [];
  for (const format_version of [1, 2]) {
    for (const [carrier, owner, key, selector, attribute] of carriers) {
      for (const character of characters) {
        // The short field accepts at most three Unicode code points.
        if (key === 'short' && [...character.raw].length > 2) continue;
        const doc = {
          format_version, title: 'Diagram',
          area: { shape: 'rectangle', length_m: 40, width_m: 30, label: 'Pitch' },
          frames: [{ id: 'frame', title: 'Frame', caption: 'Caption',
            objects: [{ kind: 'player', x: 20, y: 15, label: 'Player', short: 'P' }],
            areas: [{ id: 'zone', label: 'Zone', x: 2, y: 2, width: 5, height: 5 }],
            arrows: [{ kind: 'pass', label: 'Pass', points: [{ x: 5, y: 5 }, { x: 15, y: 5 }] }],
          }],
        };
        owner(doc)[key] = `A${character.raw}`;
        const diagram = freeze(parseDiagram(doc));
        const original = stringifyDiagram(diagram);
        const svg = renderToStaticMarkup(React.createElement(DiagramSvg, { diagram }));
        assert.equal(stringifyDiagram(diagram), original, 'rendering must not mutate the input');
        assert.deepEqual(parseDiagram(original), doc, 'JSON must retain the authored code units');
        cases.push({ name: `v${format_version} ${carrier} ${character.name}`, svg, selector, attribute,
          expected: `A${character.shown}`,
          forbidden: forbidden.includes(character.raw.codePointAt(0)),
        });
      }
    }
  }
  return cases;
}
