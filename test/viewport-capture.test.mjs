import assert from 'node:assert/strict';
import test from 'node:test';
import {captureInitialDiagram} from '../scripts/lib/viewport-capture.mjs';

test('a cold blank frame is retained but never acknowledged as the baseline', async () => {
  let now = 0, acknowledgements = 0;
  const frames = ['white', 'painted'];
  const inspected = [], rejected = [];
  const frame = await captureInitialDiagram({
    deadline: 90000,
    now: () => now,
    capture: () => frames.shift(),
    isPainted: image => { inspected.push(image); return image === 'painted'; },
    preserveRejected: image => rejected.push(image),
    pause: async () => { now += 500; },
  });
  // The caller writes its acknowledgement only after this returns.
  acknowledgements++;
  assert.equal(frame, 'painted');
  assert.deepEqual(inspected, ['white', 'painted']);
  assert.deepEqual(rejected, ['white']);
  assert.equal(acknowledgements, 1);
  assert.equal(now, 500);
});

test('a permanently blank diagram fails at the original overall deadline without an acknowledgement', async () => {
  let now = 89000, acknowledged = false, attempts = 0;
  await assert.rejects(async () => {
    await captureInitialDiagram({
      deadline: 90000,
      now: () => now,
      capture: () => { attempts++; return 'white'; },
      isPainted: () => false,
      preserveRejected: () => {},
      pause: async () => { now += 500; },
    });
    acknowledged = true;
  }, /initial diagram did not paint before the viewport deadline/i);
  assert.equal(acknowledged, false);
  assert.equal(attempts, 2);
  assert.equal(now, 90000);
});

test('an already painted baseline is captured once with no additional delay', async () => {
  let attempts = 0;
  assert.equal(await captureInitialDiagram({
    deadline: 90000,
    now: () => 2000,
    capture: () => { attempts++; return 'painted'; },
    isPainted: () => true,
    preserveRejected: () => assert.fail('painted frame rejected'),
    pause: () => assert.fail('unnecessary pause'),
  }), 'painted');
  assert.equal(attempts, 1);
});

test('capture and inspection time do not extend the overall deadline', async () => {
  let now = 89999;
  await assert.rejects(captureInitialDiagram({
    deadline: 90000,
    now: () => now,
    capture: () => 'painted',
    isPainted: () => { now = 90001; return true; },
    preserveRejected: () => assert.fail('painted image is not blank'),
    pause: () => assert.fail('deadline already expired'),
  }), /initial diagram did not paint before the viewport deadline/i);
});
