import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram } from 'football-diagrams';

// Read rendered primitives in SVG metre coordinates, including every ancestor
// transform. Expectations below are independent authored endpoint vectors.
export function runEquipmentProbe() {
  const host=document.createElement('div');document.body.appendChild(host);
  const root=createRoot(host), failures=[];
  const near=(a,b)=>Math.abs(a-b)<.00001;
  const check=(name,actual,expected)=>{if(!actual.every((p,i)=>near(p.x,expected[i][0])&&near(p.y,expected[i][1])))failures.push({name,actual,expected});};
  const render=(object,version=2)=>{
    const doc=parseDiagram({format_version:version,title:'Equipment',area:{shape:'rectangle',length_m:30,width_m:24},frames:[{id:'f',title:'Setup',objects:[object],arrows:[]}]});
    flushSync(()=>root.render(<DiagramSvg diagram={doc} style={{width:640}}/>));
    return host.querySelector(`[data-object-kind="${object.kind}"]`);
  };
  const point=(element,x,y)=>new DOMPoint(x,y).matrixTransform(host.querySelector('svg').getCTM().inverse().multiply(element.getCTM()));
  const r=Math.SQRT2;
  const axes=[
    [undefined,[[12,10],[12,14]], [1,0]], [null,[[12,10],[12,14]],[1,0]],
    [0,[[10,12],[14,12]],[0,-1]], [90,[[12,10],[12,14]],[1,0]],
    [180,[[14,12],[10,12]],[0,1]], [270,[[12,14],[12,10]],[-1,0]],
    [45,[[12-r,12-r],[12+r,12+r]],[Math.SQRT1_2,-Math.SQRT1_2]],
  ];
  try {
    for(const kind of ['goal','mini_goal']) for(const [angle,mouth,direction] of axes) {
      const object={kind,x:12,y:12,width:4,...(angle===undefined?{}:{angle})};
      const group=render(object),rect=group.querySelector('rect'),depth=kind==='goal'?1.4:.9;
      const x=rect.x.baseVal.value,y=rect.y.baseVal.value,w=rect.width.baseVal.value,h=rect.height.baseVal.value;
      check(`${kind}/${angle}/mouth`,[point(rect,x,y),point(rect,x,y+h)],mouth);
      check(`${kind}/${angle}/back`,[point(rect,x+w,y),point(rect,x+w,y+h)],mouth.map(([a,b])=>[a+direction[0]*depth,b+direction[1]*depth]));
      // Net endpoints must lie on the same rotated rectangle, not the old axis.
      for(const [i,line] of [...group.querySelectorAll('line')].entries()) {
        const actual=[point(line,line.x1.baseVal.value,line.y1.baseVal.value),point(line,line.x2.baseVal.value,line.y2.baseVal.value)];
        const expected=i<4 ? [0,1].map(t=>[mouth[0][0]+(mouth[1][0]-mouth[0][0])*(i+1)/5+direction[0]*depth*t,mouth[0][1]+(mouth[1][1]-mouth[0][1])*(i+1)/5+direction[1]*depth*t])
          : mouth.map(([a,b])=>[a+direction[0]*depth*(i-3)/3,b+direction[1]*depth*(i-3)/3]);
        check(`${kind}/${angle}/net${i}`,actual,expected);
      }
      const legacy=render(object,1).outerHTML;
      const unrotated=render({...object,angle:90},1).outerHTML;
      if(legacy!==unrotated) failures.push({name:`legacy ${kind} angle ignored`});
    }
    for(const kind of ['goal','mini_goal']) for(const width of [undefined,null]) {
      const rect=render({kind,x:12,y:12,width}).querySelector('rect');
      if(!near(rect.height.baseVal.value,kind==='goal'?6:2.4)) failures.push({name:`${kind} default mouth`});
    }
    for(const [angle,axis] of [[0,[1,0]],[90,[0,1]],[45,[Math.SQRT1_2,Math.SQRT1_2]]]) for(const width of [2,3,4,undefined,null]) for(const version of [1,2]) {
      const group=render({kind:'gate',x:12,y:12,colour:'yellow',angle,width},version);
      const gap=version===2?(width??2.1):2.1;
      const expected=[-1,1].map(sign=>[12+sign*axis[0]*gap/2,12+sign*axis[1]*gap/2]);
      // The cone apex and base shadow encode its authored centre.
      const centres=[...group.querySelectorAll('ellipse')].map(e=>({x:e.cx.baseVal.value,y:e.cy.baseVal.value-(e.rx.baseVal.value/.78)*.62}));
      check(`gate/${version}/${angle}/${width}/centres`,centres,expected);
      const vertices=group.querySelector('path').getAttribute('d').match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
      const points=Array.from({length:4},(_,i)=>[vertices[i*2],vertices[i*2+1]]);
      check(`gate/${version}/${angle}/${width}/band`,[{x:(points[0][0]+points[3][0])/2,y:(points[0][1]+points[3][1])/2},{x:(points[1][0]+points[2][0])/2,y:(points[1][1]+points[2][1])/2}],expected);
    }
    return failures;
  } finally {flushSync(()=>root.unmount());host.remove();}
}
