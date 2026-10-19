import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { arrowGeometry, frameGeometry, parseDiagram } from '../dist/index.js';
import { renderArrowGeometry } from '../dist/rendering-geometry.js';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiagramSvg } from '../dist/react.js';
const points = d => [...d.matchAll(/[ML]([^ ]+) ([^ML]+)/g)].map(m => ({x:+m[1],y:+m[2]}));
// Independent line/rectangle intersection: retain original visible edges, not
// just their endpoint bounds (a diagonal can miss a corner of the viewport).
const visibleEdges = (path, rect) => path.slice(1).flatMap((b,i) => {
 const a=path[i], dx=b.x-a.x, dy=b.y-a.y;
 if(dx===0&&dy===0)return [];
 let lo=0,hi=1;
 for(const [p,q] of [[-dx,a.x-rect[0]],[dx,rect[2]-a.x],[-dy,a.y-rect[1]],[dy,rect[3]-a.y]]) {
  if(p===0) { if(q<0)return []; }
  else { const t=q/p; if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return []; }
 }
 return [[a,b]];
});

test('ordinary arrows keep exactly the reviewed public helper output', async()=>{
 const doc=parseDiagram(await readFile(new URL('../fixtures/valid/all-kinds.json',import.meta.url),'utf8'));
 const g=frameGeometry(doc.area);
 for(const arrow of doc.frames[0].arrows)assert.deepEqual(renderArrowGeometry(arrow,g),arrowGeometry(arrow,g));
});

test('visible waves retain their original samples, phase, joins and endpoint direction',()=>{
 for(const area of [{length_m:1,width_m:1},{length_m:1e-50,width_m:90},{length_m:120,width_m:90}]) {
  const g=frameGeometry({shape:'rectangle',...area});
  const rect=[-g.margin-g.unit,-g.margin-g.unit,g.lengthM+g.margin+g.unit,g.widthM+g.margin+g.unit];
  const paths=[
   [{x:-1000,y:-1000},{x:1000,y:1000}],
   [{x:-1000,y:2},{x:1000,y:2},{x:1000,y:2},{x:2,y:-1000},{x:2,y:1000}],
   [{x:-1000,y:-20},{x:1000,y:-20}],
   [{x:1,y:1},{x:1,y:1},{x:1000,y:3},{x:1,y:1},{x:1,y:1}],
   [{x:-1000,y:-1000},{x:1000,y:-1000},{x:0,y:0},{x:0,y:0}],
  ];
  let seed=7391;
  const coordinate=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32*2000-1000;};
  for(let i=0;i<20;i++)paths.push(Array.from({length:4},()=>({x:coordinate(),y:coordinate()})));
  for(const input of paths) {
   const arrow={kind:'dribble',points:input};
   const full=points(arrowGeometry(arrow,g).d),bounded=points(renderArrowGeometry(arrow,g).d);
   assert.deepEqual(visibleEdges(bounded,rect),visibleEdges(full,rect),JSON.stringify({area,input}));
   assert.deepEqual(bounded.slice(0,2),full.slice(0,2));
   assert.deepEqual(bounded.slice(-2),full.slice(-2));
  }
  assert.equal(renderArrowGeometry({kind:'dribble',points:[{x:1,y:1},{x:1,y:1}]},g).d,'');
 }
});

test('whole-frame rendering work is bounded by the viewport, not offscreen path length',()=>{
 const doc=parseDiagram({format_version:1,title:'Limit',area:{shape:'rectangle',length_m:1,width_m:1},frames:[{id:'limit',title:'Limit',objects:[],arrows:Array.from({length:30},()=>({kind:'dribble',points:Array.from({length:12},(_,i)=>({x:i%2?1000:-1000,y:i%2?1000:-1000}))}))}]});
 const g=frameGeometry(doc.area);
 const full=arrowGeometry(doc.frames[0].arrows[0],g).d;
 assert.ok(points(full).length>80_000,'Public helper retains its complete output');
 const rendered=doc.frames[0].arrows.map(a=>renderArrowGeometry(a,g));
 assert.ok(rendered.reduce((n,a)=>n+points(a.d).length,0)<25_000);
 const html=renderToStaticMarkup(React.createElement(DiagramSvg,{diagram:doc}));
 assert.ok(html.length<800_000,`Actual renderer emitted ${html.length} bytes`);
 assert.doesNotMatch(html,/NaN|Infinity/);
});

test('letterboxed SVGs retain waves throughout the measured viewport',()=>{
 const g=frameGeometry({shape:'rectangle',length_m:1,width_m:1});
 const arrow={kind:'dribble',points:[{x:-1000,y:0},{x:1000,y:0}]};
 const viewport={widthM:39.6,heightM:6.6};
 const extra=(viewport.widthM-g.lengthM-2*g.margin)/2;
 const rect=[-g.margin-extra,-g.margin,g.lengthM+g.margin+extra,g.widthM+g.margin];
 assert.deepEqual(visibleEdges(points(renderArrowGeometry(arrow,g,viewport).d),rect),visibleEdges(points(arrowGeometry(arrow,g).d),rect));
});


test('fixed numeric SVG dimensions also preserve letterboxed paths during SSR',()=>{
 const g=frameGeometry({shape:'rectangle',length_m:1,width_m:1});
 const arrow={kind:'dribble',points:[{x:-1000,y:0},{x:1000,y:0}]};
 const doc={format_version:1,title:'SSR',area:{shape:'rectangle',length_m:1,width_m:1},frames:[{id:'ssr',title:'SSR',objects:[],arrows:[arrow]}]};
 for(const style of [{width:600,height:100},{width:'600px',height:'100px'}]) {
  const html=renderToStaticMarkup(React.createElement(DiagramSvg,{diagram:doc,style}));
  const d=html.match(/<path d="([^"]+)" fill="none" stroke="rgba/)[1];
  const rect=[-19.3,-2.8,20.3,3.8];
  assert.deepEqual(visibleEdges(points(d),rect),visibleEdges(points(arrowGeometry(arrow,g).d),rect));
 }
});
