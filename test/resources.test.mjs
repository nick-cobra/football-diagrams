import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDiagram,stringifyDiagram} from '../dist/index.js';
const small={format_version:1,title:'Limits',area:{shape:'rectangle',length_m:1,width_m:1},frames:[]};
test('JSON transport rejects excessive depth, token count and length before tree parsing',()=>{
 for(const source of ['['.repeat(32768)+'0'+']'.repeat(32768),'['+'0,'.repeat(262144)+'0]',JSON.stringify(small)+' '.repeat(8*1024*1024)])assert.throws(()=>parseDiagram(source),RangeError);
});
test('resource scanner respects strings, exact length limit and long valid numbers',()=>{
 for(const title of ['[{}]'.repeat(20),'\\"[{}]','\ud800','\0'])assert.equal(parseDiagram(stringifyDiagram({...small,title})).title,title);
 assert.equal(parseDiagram(JSON.stringify(small).padEnd(8*1024*1024,' ')).area.length_m,1);
 assert.equal(parseDiagram(JSON.stringify(small).replace('"length_m":1','"length_m":1.'+'0'.repeat(65536))).area.length_m,1);
 assert.throws(()=>parseDiagram('['.repeat(32)+'0'+']'.repeat(32)),TypeError);
});
test('maximum populated canonical v1 document fits the transport envelope',()=>{
 const s=n=>'\0'.repeat(n),n=-0.0000010000000000000002,point={x:n,y:n};
 const object={kind:'flat_marker',x:n,y:n,colour:'orange',label:s(120),short:s(3),number:99,angle:n,width:-n,ball:true};
 const arrow={kind:'dribble',points:Array(12).fill(point),label:s(120),sequence:20,badge:point};
 const zone={id:s(80),label:s(120),x:n,y:n,width:-n,height:-n,colour:'orange'};
 const frame={id:s(80),title:s(160),caption:s(400),objects:Array(60).fill(object),arrows:Array(30).fill(arrow),areas:Array(12).fill(zone)};
 const source=JSON.stringify({...small,title:s(160),area:{shape:'rectangle',length_m:-n,width_m:-n,label:s(120)},frames:Array(64).fill(frame)});
 assert.ok(source.length<8*1024*1024);assert.equal(parseDiagram(source).frames.length,64);
});
