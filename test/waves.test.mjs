import assert from 'node:assert/strict';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import {wavyPath,arrowGeometry,frameGeometry} from '../dist/index.js';

const points=[{x:0,y:0},{x:1,y:0}];
const wave=(amplitude,wavelength,input=points)=>runInNewContext('wavyPath(input,amplitude,wavelength)',{wavyPath,input,amplitude,wavelength},{timeout:100});

test('public waves reject invalid or excessive sampling requests without hanging',()=>{
  for(const wavelength of [0,-1,NaN,Infinity,-Infinity,Number.MIN_VALUE,1e-20])assert.throws(()=>wave(.3,wavelength),RangeError);
  for(const amplitude of [NaN,Infinity,-Infinity])assert.throws(()=>wave(amplitude,2.3),RangeError);
  assert.throws(()=>wave(.3,2.3,[{x:0,y:0},{x:Infinity,y:1}]),RangeError);
  assert.throws(()=>wave(.3,2.3,[{x:-1e308,y:0},{x:1e308,y:0}]),RangeError);
  assert.throws(()=>wave(-1.6e308,2.3,[{x:1.6e308,y:0},{x:1.6e308,y:1}]),RangeError);
  const many=Array.from({length:11_000},(_,i)=>({x:i%2,y:0}));
  assert.throws(()=>wavyPath(many,.3,2.3),RangeError);
});

test('the largest format-1 arrow remains inside the wave work budget',()=>{
  const input=Array.from({length:12},(_,i)=>({x:i%2?1000:-1000,y:i%2?1000:-1000}));
  const d=arrowGeometry({kind:'dribble',points:input},frameGeometry({shape:'rectangle',length_m:1e-50,width_m:20})).d;
  assert.ok((d.match(/[ML]/g)||[]).length<100_000);
  assert.ok(d.startsWith('M-1000.00 -1000.00'));
  assert.ok(d.endsWith('1000.00 1000.00'));
  assert.doesNotMatch(d,/NaN|Infinity/);
  assert.equal(wave(0,1e300),'M0.00 0.00L0.10 0.00L0.20 0.00L0.30 0.00L0.40 0.00L0.50 0.00L0.60 0.00L0.70 0.00L0.80 0.00L0.90 0.00L1.00 0.00');
});
