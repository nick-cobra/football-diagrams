// Manual production CPU assessment; deterministic complexity checks live in tests.
// npm run build && NODE_ENV=production node scripts/benchmark-rendering.mjs
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseDiagram, frameGeometry, layoutLabels } from '../dist/index.js';
import { renderArrowGeometry } from '../dist/rendering-geometry.js';
import { DiagramSvg } from '../dist/react.js';
import cases from './rendering-cases.mjs';

function measure(fn, iterations) {
  const times=[];
  let value;
  for(let i=0;i<2;i++) value=fn();
  for(let i=0;i<iterations;i++) {
    const start=performance.now(); value=fn(); times.push(performance.now()-start);
  }
  times.sort((a,b)=>a-b);
  return {value,timing:{medianMs:times[Math.floor(times.length/2)],p95Ms:times[Math.min(times.length-1,Math.floor(times.length*.95))],iterations}};
}
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,mode:process.env.NODE_ENV,cpu:os.cpus()[0].model,cases:{}};
for(const [name,input] of Object.entries(cases)) {
  const doc=parseDiagram(input), frame=doc.frames[0], g=frameGeometry(doc.area);
  const iterations=name.startsWith('max')?3:30;
  const labels=measure(()=>layoutLabels(doc,frame,g),iterations);
  const arrows=measure(()=>frame.arrows.map(arrow=>renderArrowGeometry(arrow,g)),iterations);
  const ssr=measure(()=>renderToStaticMarkup(React.createElement(DiagramSvg,{diagram:doc})),iterations);
  report.cases[name]={objects:frame.objects.length,arrows:frame.arrows.length,labelCount:labels.value.length,
    sampledPoints:arrows.value.reduce((n,a)=>n+(a.d.match(/[ML]/g)||[]).length,0),
    pathChars:arrows.value.reduce((n,a)=>n+a.d.length,0),svgBytes:Buffer.byteLength(ssr.value),
    labels:labels.timing,arrowGeneration:arrows.timing,reactSsr:ssr.timing};
}
console.log(JSON.stringify(report,null,2));
