import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseDiagram, stringifyDiagram } from '../dist/index.js';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
test('a supported document is accepted from an object and JSON text', async () => {
  const doc = await read('../fixtures/valid/pass-and-move.json');
  assert.deepEqual(parseDiagram(doc), doc);
  assert.deepEqual(parseDiagram(JSON.stringify(doc)), doc);
});
test('an unsupported format version is rejected at the public parser boundary', async () => {
  const doc = await read('../fixtures/invalid/unsupported-version.json');
  assert.throws(() => parseDiagram(doc), /Invalid Football Diagrams document/);
});
test('a missing format version is rejected', async () => {
  const doc = await read('../fixtures/valid/pass-and-move.json');
  delete doc.format_version;
  assert.throws(() => parseDiagram(doc), /Invalid Football Diagrams document/);
});

test('required fields must be own properties at every object level',async()=>{
  const base=await read('../fixtures/valid/pass-and-move.json');
  const inheritedRoot=Object.create(base);
  const inheritedArea={...base,area:Object.create(base.area)};
  const inheritedFrame={...base,frames:[Object.create(base.frames[0])]};
  for(const document of [inheritedRoot,inheritedArea,inheritedFrame]){
    assert.throws(()=>parseDiagram(document),/Invalid Football Diagrams document/);
    assert.throws(()=>stringifyDiagram(document),/Invalid Football Diagrams document/);
  }
  const own=Object.assign(Object.create({nonJsonProperty:'ignored'}),base);
  assert.deepEqual(parseDiagram(stringifyDiagram(own)),base);
});

test('serialization validates the actual JSON after non-enumerable and toJSON behaviour',async()=>{
  const base=await read('../fixtures/valid/pass-and-move.json');
  const hook=(value,result)=>Object.assign(Object.create(Object.defineProperty({},'toJSON',{value:()=>result})),value);
  const hiddenTitle={...base};Object.defineProperty(hiddenTitle,'title',{enumerable:false});
  assert.throws(()=>parseDiagram(hiddenTitle),/Invalid Football Diagrams document/);
  assert.throws(()=>stringifyDiagram(hiddenTitle),/Invalid Football Diagrams document/);
  const invalid=[hook(base,{}),hook(base,undefined),{...base,area:hook(base.area,null)}];
  for(const document of invalid){
    assert.doesNotThrow(()=>parseDiagram(document));
    assert.throws(()=>stringifyDiagram(document),/Invalid Football Diagrams document/);
  }
  const encoded={...base,title:'Encoded by hook'};
  assert.deepEqual(parseDiagram(stringifyDiagram(hook(base,encoded))),encoded);
});

test('object parsing isolates inherited optional values without mutating the source',async()=>{
  const base=await read('../fixtures/valid/pass-and-move.json');
  const prototype={label:{invalid:true},short:123,colour:123,width:NaN,ball:true};
  const object=Object.assign(Object.create(prototype),{kind:'player',x:5,y:5});
  base.frames[0].objects=[object];
  base.frames[0]=Object.assign(Object.create({areas:'not an array'}),base.frames[0]);
  delete base.frames[0].areas;
  base.area=Object.assign(Object.create({label:{invalid:true}}),base.area);
  delete base.area.label;
  const parsed=parseDiagram(base);
  assert.deepEqual(parsed.frames[0].objects[0],{kind:'player',x:5,y:5});
  assert.equal(parsed.frames[0].areas,undefined);
  assert.equal(parsed.area.label,undefined);
  assert.equal(Object.getPrototypeOf(object),prototype);
  assert.deepEqual(parseDiagram(stringifyDiagram(base)),parsed);
  parsed.frames[0].objects[0].x=99;
  assert.equal(object.x,5);
});

test('parsing snapshots data without invoking serialization hooks',async()=>{
  const base=await read('../fixtures/valid/pass-and-move.json');
  let called=0;
  Object.defineProperty(base,'toJSON',{value(){called++;return {...base,title:'Encoded'};}});
  assert.deepEqual(parseDiagram(base),{...base});
  assert.equal(called,0);
  assert.equal(parseDiagram(stringifyDiagram(base)).title,'Encoded');
  assert.equal(called,1);
});

test('serialization rejects original non-finite values even when toJSON would hide them',async()=>{
  const base=await read('../fixtures/valid/pass-and-move.json');
  const document=structuredClone(base);
  document.frames[0].objects[0].width=NaN;
  let called=false;
  Object.setPrototypeOf(document,{get toJSON(){called=true;return ()=>base;}});
  assert.throws(()=>stringifyDiagram(document),/Invalid Football Diagrams document/);
  assert.equal(called,false);
});
