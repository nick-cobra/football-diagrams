import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram, frameGeometry, layoutLabels } from 'football-diagrams';

export async function runLabelProbe() {
  const doc=parseDiagram({format_version:1,title:'Measured text',area:{shape:'rectangle',length_m:80,width_m:50,label:'WWWWWWWWWWWW'},frames:[{id:'f',title:'Wide glyphs',objects:[
    ...['WWW','漢漢漢','😀😀😀','99'].map((short,i)=>({kind:'player',x:10+i*20,y:20,short,label:'WWWWWWWWWWWW'})),
    {kind:'player',x:10,y:40,short:'7'},{kind:'coach',x:40,y:40},
  ],areas:[{label:'WWWWWWWWWWWW',x:2,y:35,width:30,height:10}],arrows:[{kind:'dribble',points:[{x:5,y:30},{x:40,y:30}],sequence:20,label:'WWWWWWWWWWWW'}]}]});
  const nominal=layoutLabels(doc,doc.frames[0],frameGeometry(doc.area));
  let reads=0;
  const arrow=doc.frames[0].arrows[0],points=arrow.points;
  // PersonGlyph checks only the arrow start on every paint. Count the next
  // point so this assertion detects geometry/layout work, not mover shading.
  arrow.points=new Proxy(points,{get(target,key,receiver){if(key==='1')reads++;return Reflect.get(target,key,receiver);}});
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host),reports=[];
  const render=(fontFamily,width=900)=>flushSync(()=>root.render(<DiagramSvg diagram={doc} style={{width,fontFamily}}/>));
  const check=name=>{
    const rows=[...host.querySelectorAll('[data-label-kind]')].map(g=>{
      const t=g.querySelector('text'),b=t.getBBox(),matrix=g.getCTM().inverse().multiply(t.getCTM());
      const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
      const circle=g.querySelector('circle'),rect=g.querySelector('rect');
      const within=circle ? corners.every(p=>Math.hypot(p.x-circle.cx.baseVal.value,p.y-circle.cy.baseVal.value)<=circle.r.baseVal.value*.9+.001)
        : corners.every(p=>p.x>=rect.x.baseVal.value-.001&&p.x<=rect.x.baseVal.value+rect.width.baseVal.value+.001&&p.y>=rect.y.baseVal.value-.001&&p.y<=rect.y.baseVal.value+rect.height.baseVal.value+.001);
      const expected=nominal.find(label=>label.id===g.dataset.labelId);
      const effectiveFontSize=Number(t.getAttribute('font-size'))*Math.hypot(matrix.a,matrix.b);
      return {kind:g.dataset.labelKind,text:t.textContent,withinBackground:within,ordinarySizePreserved:!['7','C'].includes(t.textContent)||Math.abs(effectiveFontSize-expected.fontSize)<.005};
    });
    reports.push({name,rows});
  };
  let face;
  try {
    render('Arial,sans-serif');check('Arial');
    const initialReads=reads;
    render('Courier New,monospace',320);check('font and size changed');
    face=new FontFace('DiagramProbeFont','local("Courier New"),local("Liberation Mono")');
    document.fonts.add(face);
    render('DiagramProbeFont,serif');
    await document.fonts.load('16px DiagramProbeFont');
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    check('font loaded');
    for(let i=0;i<5;i++)render('DiagramProbeFont,serif');
    check('parent updates');
    host.style.fontFamily='Courier New,monospace';render('inherit');
    host.style.fontFamily='Arial,sans-serif';
    await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
    check('inherited font changed without a React commit');
    const parentReads=reads-initialReads;
    // A late font-ready callback after unmount must be harmless.
    return {reports,parentReads,fontStatus:face.status};
  } finally {flushSync(()=>root.unmount());host.remove();if(face)document.fonts.delete(face);}
}
