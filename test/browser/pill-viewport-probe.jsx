import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram } from 'football-diagrams';

export async function runPillViewportProbe() {
  const host=document.createElement('div');document.body.appendChild(host);
  let root;
  const reports=[];
  const hydrationErrors=[];
  const settle=async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);};
  let face;
  try {
    for(const version of [1,2]) for(const kind of ['object','arrow','area','sub_area']) {
      const value='W'.repeat(120);
      const frame={id:'f',title:'Setup',objects:[],arrows:[]};
      const area={shape:'rectangle',length_m:20,width_m:20};
      if(kind==='object')frame.objects=[{kind:'player',x:10,y:10,label:value}];
      if(kind==='arrow')frame.arrows=[{kind:'pass',points:[{x:4,y:10},{x:16,y:10}],label:value}];
      if(kind==='area')area.label=value;
      if(kind==='sub_area')frame.areas=[{label:value,x:5,y:5,width:10,height:10}];
      const doc=parseDiagram({format_version:version,title:'Viewport',area,frames:[frame]});
      const render=(width,fontFamily)=>flushSync(()=>root.render(<DiagramSvg diagram={doc} style={{width,fontFamily}}/>));
      const check=name=>{
        const svg=host.querySelector('svg'),viewport=svg.getBoundingClientRect();
        const group=host.querySelector(`[data-label-kind="${kind}"]`);
        const corners=element=>{
          const b=element.getBBox(),m=element.getScreenCTM();
          return [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));
        };
        const inside=element=>corners(element).every(p=>p.x>=viewport.left-.1&&p.x<=viewport.right+.1&&p.y>=viewport.top-.1&&p.y<=viewport.bottom+.1);
        reports.push({version,kind,name,textRetained:group.querySelector('text').textContent===value,textInside:inside(group.querySelector('text')),backgroundInside:inside(group.querySelector('rect'))});
      };
      if(!root) {
        host.innerHTML=document.getElementById('pill-ssr-template').innerHTML;
        root=hydrateRoot(host,<DiagramSvg diagram={doc} style={{width:334,fontFamily:'Arial,sans-serif'}}/>,{onRecoverableError:error=>hydrationErrors.push(error.message)});
        await settle();check('hydrated SSR');
      }
      render(334,'Arial,sans-serif');check('334px');
      render(168,'Courier New,monospace');check('168px/font changed');
      host.style.fontFamily='Arial,sans-serif';render(334,'inherit');
      host.style.fontFamily='Courier New,monospace';await settle();check('inherited font changed');
      // Resize without a React commit; observer owns the current text set.
      host.querySelector('svg').style.width='168px';await settle();check('host resized');
      face=new FontFace('PillViewportFont','local("Courier New"),local("Liberation Mono")');document.fonts.add(face);
      render(334,'PillViewportFont,serif');await document.fonts.load('16px PillViewportFont');await document.fonts.ready;await settle();check('font loaded');
      for(let i=0;i<4;i++)render(334,'PillViewportFont,serif');check('parent commits');
      document.fonts.delete(face);face=undefined;
    }
    return {reports,hydrationErrors};
  } finally {if(root)flushSync(()=>root.unmount());host.remove();if(face)document.fonts.delete(face);}
}
