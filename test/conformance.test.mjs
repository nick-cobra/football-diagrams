import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { parseDiagram, stringifyDiagram } from '../dist/index.js';

for (const kind of ['valid', 'invalid']) {
  const directory = new URL(`../fixtures/${kind}/`, import.meta.url);
  const files = (await readdir(directory)).filter(name => name.endsWith('.json'));
  assert.ok(files.length >= (kind === 'valid' ? 7 : 14));
  for (const name of files) {
    test(`${kind} shared fixture: ${name}`, async () => {
      const json = await readFile(new URL(name, directory), 'utf8');
      if (kind === 'valid') {
        const diagram = parseDiagram(json);
        if (name.startsWith('numeric-')) assert.deepEqual(diagram, JSON.parse(json));
        assert.deepEqual(parseDiagram(stringifyDiagram(diagram)), diagram);
      } else {
        assert.throws(() => parseDiagram(json));
      }
    });
  }
}

test('non-finite numbers supplied as JavaScript objects are rejected', async () => {
  const diagram = parseDiagram(await readFile(new URL('../fixtures/valid/pass-and-move.json', import.meta.url), 'utf8'));
  for (const value of [NaN, Infinity, -Infinity]) {
    diagram.area.length_m = value;
    assert.throws(() => parseDiagram(diagram));
  }
});

test('non-finite direct objects reject at every numeric field family', async () => {
  const base = JSON.parse(await readFile(new URL('../fixtures/valid/numeric-precision.json', import.meta.url), 'utf8'));
  const paths = [
    ['format_version'], ['area','length_m'], ['area','width_m'],
    ...['x','y','angle','width','number'].map(key=>['frames',0,'objects',0,key]),
    ...['x','y'].map(key=>['frames',0,'arrows',0,'points',0,key]),
    ...['x','y'].map(key=>['frames',0,'arrows',0,'badge',key]),
    ['frames',0,'arrows',0,'sequence'],
    ...['x','y','width','height'].map(key=>['frames',0,'areas',0,key]),
  ];
  for(const path of paths)for(const value of [NaN,Infinity,-Infinity]){
    const document=structuredClone(base);
    const parent=path.slice(0,-1).reduce((node,key)=>node[key],document);
    parent[path.at(-1)]=value;
    assert.throws(()=>parseDiagram(document),path.join('/'));
    assert.throws(()=>stringifyDiagram(document),path.join('/'));
  }
});

test('boundary inventory matches the documented corpus and every schema assertion', async () => {
  const root=new URL('../fixtures/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('boundary-manifest.json',root),'utf8'));
  const names=[];
  for(const kind of ['valid','invalid'])for(const name of await readdir(new URL(kind+'/',root)))if(name.startsWith('boundary-'))names.push(`${kind}/${name}`);
  assert.deepEqual(names.sort(),manifest.map(entry=>entry.file).sort());
  assert.equal(new Set(manifest.map(entry=>entry.id)).size,manifest.length);
  const covered=new Set(manifest.map(entry=>entry.constraint));
  const schema=JSON.parse(await readFile(new URL('../schema/diagram.schema.json',import.meta.url),'utf8'));
  const assertions=new Set(['type','const','enum','required','additionalProperties','anyOf','minLength','maxLength','minItems','maxItems','minimum','maximum','exclusiveMinimum','exclusiveMaximum']);
  function visit(node,path){
    if(!node||typeof node!=='object'||Array.isArray(node))return;
    for(const[key,value]of Object.entries(node)){
      const pointer=path+'/'+key;
      if(assertions.has(key))assert.ok(covered.has(pointer),`missing schema assertion ${pointer}`);
      if(key==='anyOf')value.filter(entry=>entry.type!=='null').forEach((entry,index)=>visit(entry,pointer+'/'+index));
      else if(key==='properties'||key==='$defs')for(const[name,child]of Object.entries(value))visit(child,pointer+'/'+name);
      else if(key==='items')visit(value,pointer);
    }
  }
  visit(schema,'#');
});
