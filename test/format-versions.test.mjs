import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import test from 'node:test';
import Ajv from 'ajv/dist/2020.js';
import {parseDiagram,stringifyDiagram} from '../dist/index.js';
const fixture=async name=>JSON.parse(await readFile(new URL(`../fixtures/${name}`,import.meta.url),'utf8'));

test('published format1 schema bytes stay immutable',async()=>{
  const bytes=await readFile(new URL('../schema/diagram.schema.json',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'593606670f2d0a494faf52a552ec798075a66929325e0e451adebe668455361c');
});
test('the unchanged format1 schema still rejects format2 accepted by the new reader',async()=>{
  const schema=JSON.parse(await readFile(new URL('../schema/diagram.schema.json',import.meta.url),'utf8'));
  const legacy=new Ajv({strict:true}).compile(schema);
  for(const name of ['unsupported-version.json','boundary-format_version-const-invalid.json']){
    const document=await fixture(`legacy-v1-invalid/${name}`);
    assert.equal(legacy(document),false);
    assert.equal(parseDiagram(document).format_version,2);
  }
});
for(const version of [1,2])test(`public parser and serializer retain explicit format${version}`,async()=>{
  const doc=await fixture('valid/authored-equipment-v2.json');doc.format_version=version;
  for(const input of [doc,JSON.stringify(doc)]){
    const accepted=parseDiagram(input);
    assert.deepEqual(accepted,doc);
    assert.deepEqual(parseDiagram(stringifyDiagram(accepted)),doc);
  }
});
test('format2 retains nullable values and numeric version spellings',async()=>{
  const doc=await fixture('valid/authored-equipment-v2.json');
  doc.frames[0].objects[0].angle=null;doc.frames[0].objects[0].width=null;
  for(const spelling of ['2','2.0','2e0']){
    const encoded=JSON.stringify(doc).replace('"format_version":2',`"format_version":${spelling}`);
    assert.deepEqual(parseDiagram(encoded),doc);
  }
});
test('unknown versions and otherwise invalid format2 documents still reject',async()=>{
  const doc=await fixture('valid/authored-equipment-v2.json');
  for(const version of [0,3,'2',null,2.1])assert.throws(()=>parseDiagram({...doc,format_version:version}),/Invalid/);
  for(const object of [{...doc.frames[0].objects[0],width:0},{...doc.frames[0].objects[0],unknown:true}])
    assert.throws(()=>parseDiagram({...doc,frames:[{...doc.frames[0],objects:[object]}]}),/Invalid/);
});

test('format2 retains every applicable v1 positive and negative boundary',async()=>{
  const {readdir}=await import('node:fs/promises');
  for(const kind of ['valid','invalid']) for(const name of await readdir(new URL(`../fixtures/${kind}/`,import.meta.url))){
    let doc;
    try {doc=await fixture(`${kind}/${name}`);} catch(error) {if(kind==='invalid'&&error instanceof SyntaxError)continue;throw error;}
    if(doc?.format_version!==1)continue;
    doc.format_version=2;
    if(kind==='valid')assert.deepEqual(parseDiagram(doc),doc,name);
    else assert.throws(()=>parseDiagram(doc),/Invalid/,name);
  }
});
