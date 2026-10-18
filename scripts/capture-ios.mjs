import { execFileSync } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const [device, destination]=process.argv.slice(2);
if(!device || !destination)throw new Error('Usage: node scripts/capture-ios.mjs <explicit-owned-simulator-UDID> <output-directory>. Coordinate/lease the device first.');
const output=resolve(destination);
mkdirSync(output,{recursive:true});
const app=join(output,'FootballDiagramsDemo.app');
mkdirSync(app,{recursive:true});
const run=(command,args)=>execFileSync(command,args,{stdio:'inherit'});
const capture=(command,args)=>execFileSync(command,args,{encoding:'utf8'}).trim();
const state=JSON.parse(capture('xcrun',['simctl','list','devices','available','--json']));
const selected=Object.values(state.devices).flat().find(entry=>entry.udid===device);
if(!selected)throw new Error('The selected simulator is unavailable.');
run('./kotlin/gradlew',['-p','examples/compose','linkDebugFrameworkIosSimulatorArm64']);
const frameworks=resolve('examples/compose/build/bin/iosSimulatorArm64/debugFramework');
if(!existsSync(join(frameworks,'FootballDiagramsDemo.framework')))throw new Error('Framework not built');
const sdk=capture('xcrun',['--sdk','iphonesimulator','--show-sdk-path']);
run('xcrun',['--sdk','iphonesimulator','swiftc','-module-name','FootballDiagramsCaptureHost','-parse-as-library','-sdk',sdk,'-target','arm64-apple-ios18.5-simulator','-F',frameworks,'-framework','FootballDiagramsDemo','examples/compose/ios/Demo.swift','-o',join(app,'FootballDiagramsDemo')]);
copyFileSync('examples/compose/ios/Info.plist',join(app,'Info.plist'));
run('codesign',['--force','--sign','-',app]);
if(selected.state!=='Booted')run('xcrun',['simctl','boot',device]);
run('xcrun',['simctl','bootstatus',device,'-b']);
run('xcrun',['simctl','install',device,app]);
run('xcrun',['simctl','launch',device,'io.github.footballdiagrams.demo']);
// Poll screenshots until UIKit/Compose has presented a stable frame, bounded to 10 seconds.
let previous='';
for(let attempt=0;attempt<10;attempt++){
 await new Promise(resolve=>setTimeout(resolve,1000));
 const file=join(output,'ios.png');
 run('xcrun',['simctl','io',device,'screenshot',file]);
 const {readFileSync}=await import('node:fs');
 const {createHash}=await import('node:crypto');
 const hash=createHash('sha256').update(readFileSync(file)).digest('hex');
 if(hash===previous)break;
 previous=hash;
}
writeFileSync(join(output,'toolchain.txt'),[capture('xcodebuild',['-version']),capture('xcrun',['swift','--version']),`Device: ${device} ${selected.name}`].join('\n')+'\n');
console.log(`Inspect ${join(output,'ios.png')} for real content, safe areas and clipping. A stable screenshot alone is not a visual approval.`);
