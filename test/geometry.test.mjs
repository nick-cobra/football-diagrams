import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiagramSvg } from '../dist/react.js';
import { frameGeometry, grassStripes, layoutLabels, arrowGeometry, wavyPath, parseDiagram } from '../dist/index.js';
const vectors=JSON.parse(await readFile(new URL('../fixtures/geometry-vectors.json',import.meta.url),'utf8'));
const near=(actual,expected,label,tolerance=vectors.floatTolerance)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance,`${label}: ${actual} != ${expected}`);

test('shared frame scale, aspect, margin and boundary vectors',()=>{
 for(const {area,expected}of vectors.frames){
  const g=frameGeometry(area),viewport=g.viewBox.split(' ').map(Number);
  [g.lengthM,g.widthM,g.margin,g.playerRadius,g.unit,viewport[2],viewport[3],g.stripeWidth].forEach((v,i)=>near(v,expected[i],`${area.length_m}/${i}`));
  assert.ok(grassStripes(g).stripes.length<=256);
 }
});

test('shared label positions include badge overrides, a collision and thumbnail omissions',()=>{
 const doc=parseDiagram(vectors.labels.diagram),g=frameGeometry(doc.area);
 const labels=layoutLabels(doc,doc.frames[0],g);
 assert.equal(labels.length,vectors.labels.expected.length);
 for(const [id,...expected]of vectors.labels.expected){const label=labels.find(l=>l.id===id);assert.ok(label,id);[label.x,label.y,label.width,label.height,label.fontSize].forEach((value,i)=>near(value,expected[i],`${id}/${i}`));}
 assert.ok(layoutLabels(doc,doc.frames[0],g,{thumbnail:true}).every(l=>!['area','number','sequence'].includes(l.kind)));
});

test('shared arrow vectors retain bends, repeats, notation, endpoints and finite waves',()=>{
 const v=vectors.arrows,g=frameGeometry(v.area);
 for(const[kind,stroke]of Object.entries(v.stroke)){
  const arrow=arrowGeometry({kind,points:v.bentPoints},g);near(arrow.strokeWidth,stroke,kind);
  if(kind==='run')assert.deepEqual(arrow.dashArray.split(' ').map(Number),v.runDash);else assert.equal(arrow.dashArray,undefined);
  if(kind!=='dribble')assert.equal(arrow.d,'M-3 -4L0 0L3 4');
 }
 const points=[...wavyPath(v.wavePoints,.3,2.3).matchAll(/[ML]([^ ]+) ([^ML]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 assert.equal(points.length,v.waveCount);
 for(const sample of v.waveSamples){near(points[sample.index][0],sample.x,'wave x',.0051);near(points[sample.index][1],sample.y,'wave y',.0051);}
 assert.equal(wavyPath([{x:1,y:1},{x:1,y:1}],.3,2.3),'');
 assert.equal(wavyPath([v.wavePoints[0],v.wavePoints[0],v.wavePoints[1]],.3,2.3),wavyPath(v.wavePoints,.3,2.3));
});

// Read the actual exported SVG primitives, including shadows, without relying on
// renderer geometry helpers for expected glyph dimensions. Stroke extents are excluded.
function glyphBounds(html,kind){
 const tokens=[...html.matchAll(/<\/?[a-zA-Z][^>]*>/g)].map(m=>m[0]);
 const start=tokens.findIndex(t=>t.includes(`data-object-kind="${kind}"`));
 assert.ok(start>=0,kind);
 let depth=0;const bounds=[];
 for(let i=start;i<tokens.length;i++){
  const token=tokens[i],tag=token.match(/^<([^\s>]+)/)[1];
  const attrs=Object.fromEntries([...token.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  const n=key=>Number(attrs[key]);
  if(tag==='g')depth++;if(tag==='/g'&&--depth===0)break;
  if(tag==='ellipse')bounds.push([n('cx')-n('rx'),n('cy')-n('ry'),n('cx')+n('rx'),n('cy')+n('ry')]);
  if(tag==='circle')bounds.push([n('cx')-n('r'),n('cy')-n('r'),n('cx')+n('r'),n('cy')+n('r')]);
  if(tag==='rect')bounds.push([n('x'),n('y'),n('x')+n('width'),n('y')+n('height')]);
  if(tag==='line')bounds.push([Math.min(n('x1'),n('x2')),Math.min(n('y1'),n('y2')),Math.max(n('x1'),n('x2')),Math.max(n('y1'),n('y2'))]);
  if(tag==='path'){
   const coordinates=(attrs.d.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)||[]).map(Number),xs=coordinates.filter((_,i)=>i%2===0),ys=coordinates.filter((_,i)=>i%2===1);
   bounds.push([Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]);
  }
  if(i===start&&tag!=='g')break;
 }
 return [Math.min(...bounds.map(b=>b[0])),Math.min(...bounds.map(b=>b[1])),Math.max(...bounds.map(b=>b[2])),Math.max(...bounds.map(b=>b[3]))];
}

test('all actual SVG glyph bounds match shared hand-derived metre vectors',()=>{
 for(const probe of vectors.glyphs){
  const diagram={format_version:1,title:'Glyph',area:{shape:'rectangle',length_m:26,width_m:20},frames:[{id:'glyph',title:'Glyph',objects:[probe.object],arrows:[]}]};
  const html=renderToStaticMarkup(React.createElement(DiagramSvg,{diagram:parseDiagram(diagram)}));
  glyphBounds(html,probe.object.kind).forEach((value,i)=>near(value,probe.bounds[i],`${probe.object.kind}/${i}`));
 }
});

test('off-pitch and precision-limit arrow outputs stay finite; default badge uses the middle segment',()=>{
 const v=vectors.arrows,g=frameGeometry(v.area);
 for(const points of v.finitePoints)for(const kind of Object.keys(v.stroke))assert.doesNotMatch(arrowGeometry({kind,points},g).d,/NaN|Infinity/);
 const labels=layoutLabels({area:v.area},{id:'midpoint',title:'Midpoint',objects:[],arrows:[{kind:'pass',points:v.bentPoints,sequence:1}]},g);
 const badge=labels.find(l=>l.kind==='sequence');
 near(badge.x,v.midpointBadge[0],'midpoint x');near(badge.y,v.midpointBadge[1],'midpoint y');
});
