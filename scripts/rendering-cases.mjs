import { readFileSync } from 'node:fs';

const base = { format_version: 1, title: 'Performance probe', area: { shape: 'rectangle', length_m: 40, width_m: 30 } };
const dense = {
  id: 'dense', title: 'Dense',
  objects: Array.from({length:60}, (_,i) => ({kind:'player',x:2+(i%10)*3.8,y:2+Math.floor(i/10)*4.8,number:i+1,label:`Player ${i+1}`})),
  arrows: Array.from({length:30}, (_,i) => ({kind:'dribble',points:Array.from({length:12},(_,j)=>({x:2+j*3.2,y:2+((i+j)%10)*2.7})),sequence:i%20+1,label:`Move ${i+1}`})),
  areas: Array.from({length:12}, (_,i) => ({label:`Zone ${i+1}`,x:(i%4)*10,y:Math.floor(i/4)*10,width:9,height:9})),
};
const limit = {id:'limit',title:'Schema limit',objects:[],arrows:[{
  kind:'dribble',points:Array.from({length:12},(_,i)=>({x:i%2?1000:-1000,y:i%2?1000:-1000})),
}]};
export default {
  ordinary: JSON.parse(readFileSync(new URL('../fixtures/valid/all-kinds.json',import.meta.url),'utf8')),
  dense: {...base,frames:[dense]},
  maxArrow: {...base,area:{...base.area,length_m:1,width_m:1},frames:[limit]},
  maxFrame: {...base,area:{...base.area,length_m:1,width_m:1},frames:[{...limit,arrows:Array.from({length:30},()=>structuredClone(limit.arrows[0]))}]},
};
