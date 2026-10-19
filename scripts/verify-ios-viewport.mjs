// Requires an explicitly owned simulator. Local SDK execution must hold its lease.
import {execFileSync,spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,cpSync,rmSync,openSync,closeSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {randomUUID} from 'node:crypto';
const [device,output='artifacts/ios-viewport']=process.argv.slice(2);
if(!device || device==='booted')throw Error('Supply an explicitly owned simulator UDID');
const evidence=resolve(output);mkdirSync(evidence,{recursive:true});
const root=mkdtempSync(join(tmpdir(),'football-viewport-'));
const app=join(root,'Viewport.app'),bundle='io.github.footballdiagrams.viewport.t'+randomUUID().replaceAll('-','');
const xr=(...args)=>execFileSync('xcrun',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const log=openSync(join(evidence,'console.log'),'w');let child;
try {
 mkdirSync(app);
 const framework=resolve('examples/compose/build/bin/iosSimulatorArm64/debugFramework');
 const sdk=xr('--sdk','iphonesimulator','--show-sdk-path');
 const plist={CFBundleExecutable:'ViewportHost',CFBundleIdentifier:bundle,CFBundleName:'Viewport regression',CFBundlePackageType:'APPL',CFBundleShortVersionString:'1',CFBundleVersion:'1',MinimumOSVersion:'17.0',LSRequiresIPhoneOS:true,UIDeviceFamily:[1,2],CADisableMinimumFrameDurationOnPhone:true,UILaunchScreen:{},UIApplicationSceneManifest:{UIApplicationSupportsMultipleScenes:true,UISceneConfigurations:{}}};
 writeFileSync(join(app,'Info.plist'),JSON.stringify(plist));
 execFileSync('plutil',['-convert','xml1',join(app,'Info.plist')]);
 xr('swiftc','-O','-parse-as-library','-sdk',sdk,'-target','arm64-apple-ios17.0-simulator','-F',framework,'-framework','FootballDiagramsDemo',resolve('scripts/ios-viewport/ViewportHost.swift'),'-o',join(app,'ViewportHost'));
 execFileSync('codesign',['--force','--sign','-',app],{stdio:'inherit'});
 xr('simctl','install',device,app);
 const container=xr('simctl','get_app_container',device,bundle,'data');
 const report=join(container,'Documents/viewport.json');
 let exited=false;
 child=spawn('xcrun',['simctl','launch','--console',device,bundle],{stdio:['ignore',log,log]});
 child.on('exit',()=>{exited=true});
 const deadline=Date.now()+90000;let rows=[];
 while(Date.now()<deadline) {
  if(existsSync(report))rows=JSON.parse(readFileSync(report,'utf8'));
  if(rows.at(-1)?.complete || rows.some(r=>r.error) || exited)break;
  await new Promise(r=>setTimeout(r,500));
 }
 if(existsSync(join(container,'Documents')))cpSync(join(container,'Documents'),evidence,{recursive:true});
 if(rows.at(-1)?.complete!==true || rows.filter(r=>r.restoredPixelsMatch).length!==4)throw Error(`Native viewport regression failed; inspect ${evidence}`);
 console.log('Native viewport: four real-component cases survived initial/transition zero sizes and restored identical pixels.');
} finally {
 try{xr('simctl','terminate',device,bundle)}catch{}
 if(child && child.exitCode===null)await new Promise(r=>child.once('exit',r));
 try{xr('simctl','uninstall',device,bundle)}catch{}
 closeSync(log);rmSync(root,{recursive:true,force:true});
}
