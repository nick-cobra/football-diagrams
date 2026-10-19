import React from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {DiagramSvg} from 'football-diagrams/react';
import {parseDiagram} from 'football-diagrams';

export async function runMarginProbe() {
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host),reports=[];
  const area={shape:'rectangle',length_m:40,width_m:30};
  const frame={id:'f',title:'Setup',objects:[],arrows:[]};
  const render=(version,object,marginMetres,width=334,height)=>flushSync(()=>root.render(<DiagramSvg diagram={parseDiagram({format_version:version,title:'Margin',area,frames:[{...frame,objects:object?[object]:[]}]})} marginMetres={marginMetres} style={{width,height}}/>));
  const bitmap=async()=>{
    const svg=host.querySelector('svg'),size=svg.getBoundingClientRect();
    const canvas=document.createElement('canvas');canvas.width=Math.round(size.width);canvas.height=Math.round(size.height);
    const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
    try {const img=new Image();img.src=url;await img.decode();const context=canvas.getContext('2d');context.drawImage(img,0,0,canvas.width,canvas.height);return [...context.getImageData(0,0,canvas.width,canvas.height).data];}finally{URL.revokeObjectURL(url);}
  };
  try {
    for(const version of [1,2]) for(const [width,height] of [[334,undefined],[320,90],[90,320]]) {
      render(version,null,16,width,height);const empty=await bitmap();
      for(const [x,y] of [[50,15],[-10,15],[20,37.5],[20,-7.5]]) {
        render(version,{kind:'coach',x,y,ball:true},16,width,height);
        const svg=host.querySelector('svg'),bounds=svg.getBoundingClientRect();
        const groups=[host.querySelector('[data-object-kind="coach"]'),host.querySelector('[data-label-kind="number"]')];
        const inside=groups.every(group=>{
          const box=group.getBBox(),m=group.getScreenCTM();
          return [[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]].every(([a,b])=>{
            const p=new DOMPoint(a,b).matrixTransform(m);return p.x>=bounds.left-.1&&p.x<=bounds.right+.1&&p.y>=bounds.top-.1&&p.y<=bounds.bottom+.1;
          });
        });
        const actual=await bitmap();
        reports.push({version,width,height,x,y,inside,actorPaints:actual.some((value,i)=>value!==empty[i]),viewBox:svg.getAttribute('viewBox')});
      }
      const actor={kind:'coach',x:50,y:15,ball:true};
      render(version,actor,undefined,width,height);const original=await bitmap();
      render(version,actor,16,width,height);await bitmap();
      render(version,actor,undefined,width,height);const restored=await bitmap();
      reports.push({version,width,height,restored:original.every((value,i)=>value===restored[i])});
    }
    return reports;
  }finally{flushSync(()=>root.unmount());host.remove();}
}
