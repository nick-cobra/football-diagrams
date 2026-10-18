import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram } from 'football-diagrams';

// Exercise the installed package in an actual React root. Reads of authored
// points detect geometry work deterministically, without wall-clock thresholds.
export function runCacheProbe() {
  let reads = 0;
  const arrow = (y) => {
    const points = [{x:2,y},{x:25,y:y+2}];
    return {kind:'dribble',get points(){reads++;return points;}};
  };
  const doc = parseDiagram({format_version:1,title:'Cache',area:{shape:'rectangle',length_m:40,width_m:30},frames:[
    {id:'same',title:'First',objects:[],arrows:[]}, {id:'same',title:'Last',objects:[],arrows:[]},
  ]});
  doc.frames[0].arrows=[arrow(3)];doc.frames[1].arrows=[arrow(15)];
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host), checks=[];
  let counter=0;
  const render=(props={})=>flushSync(()=>root.render(<div><span>{counter++}</span><DiagramSvg diagram={doc} {...props}/></div>));
  const path=()=>host.querySelector('[data-arrow-kind] path[marker-end]')?.getAttribute('d');
  const check=(name,pass)=>checks.push({name,pass});
  try {
    render(); const initial=reads, original=path();
    for(let i=0;i<5;i++)render();
    check('parent updates reuse arrow geometry',reads===initial);
    const parentReads=reads-initial;
    render({thumbnail:true,className:'thumbnail',style:{width:240,height:160},'data-testid':'changed'});
    check('presentation changes reuse geometry and update host props',reads===initial && host.querySelector('svg').getAttribute('class')==='thumbnail' && host.querySelector('svg').getAttribute('data-thumbnail')==='true' && host.querySelector('svg').getAttribute('data-testid')==='changed');
    render({diagram:{...doc,title:'Accessible replacement'}});
    check('title changes update accessibility while reusing geometry',reads===initial && host.querySelector('svg').getAttribute('aria-label')==='Accessible replacement — First');
    render({frameIndex:1}); const last=path();
    check('frame selection invalidates geometry even with the same authored id',reads>initial && last!==original);
    render({frameIndex:-1});check('invalid frame removes the SVG',host.querySelector('svg')===null);
    render();check('restoring a frame paints the original path',path()===original);
    const before=reads;
    const replacement={...doc,frames:[{...doc.frames[0],arrows:[arrow(8)]}]};
    render({diagram:replacement});const replaced=path();
    check('arrow replacement invalidates geometry',reads>before && replaced!==original);
    const after=reads;
    render({diagram:{...replacement,area:{...doc.area,length_m:60}}});
    check('pitch replacement invalidates geometry',reads>after && path()!==replaced);
    const svg=host.querySelector('svg');
    check('markers resolve inside the current SVG',[...svg.querySelectorAll('[marker-end]')].every(p=>[...svg.querySelectorAll('marker')].some(m=>p.getAttribute('marker-end')===`url(#${m.id})`)));
    return {checks,initialReads:initial,parentReads};
  } finally {flushSync(()=>root.unmount());host.remove();}
}
