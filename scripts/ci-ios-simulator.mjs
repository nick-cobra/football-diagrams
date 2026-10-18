import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
if (!process.env.GITHUB_ACTIONS || !process.env.GITHUB_ENV) throw new Error('This helper owns resources only on GitHub-hosted CI. Local runs must select and coordinate their own simulator.');
const run = args => execFileSync('xcrun', ['simctl',...args], {encoding:'utf8'}).trim();
const devices=JSON.parse(run(['list','devices','available','--json'])).devices;
const candidate=Object.entries(devices).filter(([runtime])=>runtime.includes('.iOS-')).flatMap(([runtime,list])=>list.filter(device=>device.isAvailable && device.name.startsWith('iPhone')).map(device=>({runtime,type:device.deviceTypeIdentifier}))).at(-1);
if(!candidate?.type)throw new Error('No available iPhone simulator runtime/type; native tests must execute, not silently skip.');
const udid=run(['create',`football-diagrams-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`,candidate.type,candidate.runtime]);
// Record ownership before boot, so an interrupted boot can still be cleaned up.
appendFileSync(process.env.GITHUB_ENV,`SIMULATOR_UDID=${udid}\n`);
console.log(`Created owned simulator ${udid} (${candidate.runtime}, ${candidate.type})`);
run(['boot',udid]);
execFileSync('xcrun',['simctl','bootstatus',udid,'-b'],{stdio:'inherit'});
