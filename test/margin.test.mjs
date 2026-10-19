import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {frameGeometry,grassStripes} from '../dist/index.js';
import {DiagramSvg} from '../dist/react.js';

const area={shape:'rectangle',length_m:40,width_m:30};
test('explicit margin preserves pitch and glyph dimensions while framing more grass',()=>{
  const original=frameGeometry(area),expanded=frameGeometry(area,12);
  assert.equal(expanded.margin,12);
  assert.equal(expanded.viewBox,'-12 -12 64 54');
  for(const key of ['lengthM','widthM','playerRadius','unit','stripeWidth'])assert.equal(expanded[key],original[key],key);
  assert.deepEqual(frameGeometry(area,0),original);
  assert.deepEqual(frameGeometry(area,1),original);
});
test('invalid margins reject before rendering',()=>{
  for(const margin of [-1,NaN,Infinity,-Infinity,120.001]){
    assert.throws(()=>frameGeometry(area,margin),RangeError);
    const doc={format_version:1,title:'Invalid',area,frames:[{id:'f',title:'Setup',objects:[],arrows:[]}]};
    assert.throws(()=>renderToStaticMarkup(React.createElement(DiagramSvg,{diagram:doc,marginMetres:margin})),RangeError);
  }
});
test('maximum margin retains bounded finite stripes for every pitch extreme',()=>{
  for(const [length_m,width_m] of [[1e-50,1e-50],[120,90],[1e-50,90],[120,1e-50]]){
    const geometry=frameGeometry({...area,length_m,width_m},120);
    assert.equal(geometry.margin,120);
    const grass=grassStripes(geometry);
    assert.ok(grass.stripes.length>0&&grass.stripes.length<=256);
    assert.ok(grass.stripes.every(stripe=>Number.isFinite(stripe.x)&&Number.isFinite(stripe.width)&&stripe.width>0));
  }
});
