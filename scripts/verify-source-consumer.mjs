import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pack, run, hash } from './consumers/package.mjs';
import { executedTests } from './consumers/test-results.mjs';
const [pin,device,output='artifacts/source-consumer']=process.argv.slice(2);
if(!/^(?:[a-f\d]{40}|v\d+\.\d+\.\d+(?:-[\w.-]+)?)$/.test(pin||''))throw new Error('Supply an immutable public Git commit SHA or release tag. This command never creates a tag or release.');
if(!device || device==='booted')throw new Error('Supply an explicitly owned/leased iOS simulator UDID.');
const evidence=resolve(output);mkdirSync(evidence,{recursive:true});
const scratch=mkdtempSync(join(tmpdir(),'football-cold-source-'));
const source=join(scratch,'source');
const execute=(command,args,cwd,label,env=process.env)=>{
 console.log(`Verifying ${label}...`);
 try {const result=run(command,args,{cwd,env,maxBuffer:32*1024*1024});writeFileSync(join(evidence,label+'.log'),result);return result;}
 catch(error){writeFileSync(join(evidence,label+'.log'),String(error.stdout||'')+String(error.stderr||''));throw new Error(`${label} failed (exit ${error.status}); inspect ${join(evidence,label+'.log')}`);}
};
const quote=value=>JSON.stringify(value).replaceAll('$','\\$');
try{
 execute('git',['clone','--quiet','--no-local','https://github.com/nick-cobra/football-diagrams.git',source],scratch,'clone');
 // A public fork PR head can be reachable only through the upstream pull ref,
 // rather than an advertised branch fetched by clone. Fetch it explicitly when needed.
 if(/^[a-f\d]{40}$/.test(pin)) {
  try { run('git',['cat-file','-e',`${pin}^{commit}`],{cwd:source}); }
  catch {
   const pullHead=(process.env.GITHUB_REF||'').replace(/\/merge$/,'/head');
   execute('git',['fetch','--quiet','--no-tags','origin',/^refs\/pull\/\d+\/head$/.test(pullHead)?pullHead:pin],source,'fetch-pin');
  }
 }
 const sha=run('git',['rev-parse',`${pin}^{commit}`],{cwd:source}).trim();
 execute('git',['checkout','--quiet','--detach',sha],source,'checkout');
 const {archive,manifest}=pack(source,evidence);
 const extracted=join(scratch,'payload');mkdirSync(extracted);
 execute('tar',['-xf',archive,'-C',extracted],scratch,'extract');
 const payload=join(extracted,'package');
 for(const file of manifest.files)if(hash(join(payload,file.path))!==file.sha256)throw new Error(`Extracted asset hash mismatch: ${file.path}`);
 const gradle=join(payload,'kotlin/gradlew');
 const settings=`pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\ndependencyResolutionManagement { repositories { google(); mavenCentral() } }\nrootProject.name = "ColdInstalledConsumer"\nincludeBuild(${quote(join(payload,'kotlin'))}) { dependencySubstitution { substitute(module("io.github.nick-cobra:football-diagrams")).using(project(":library")) } }\n`;
 const consumer=join(scratch,'consumer');mkdirSync(consumer);
 writeFileSync(join(consumer,'settings.gradle.kts'),settings);
 writeFileSync(join(consumer,'gradle.properties'),'android.useAndroidX=true\norg.gradle.jvmargs=-Xmx3g\n');
 writeFileSync(join(consumer,'build.gradle.kts'),`plugins { kotlin("multiplatform") version "2.4.20"; kotlin("plugin.compose") version "2.4.20" }\nkotlin { jvmToolchain(21); jvm(); iosSimulatorArm64 { binaries.framework { baseName = "ColdConsumer"; isStatic = true } }; sourceSets { commonMain.dependencies { implementation("io.github.nick-cobra:football-diagrams:0.2.0") }; commonTest.dependencies { implementation(kotlin("test")) } } }\n`);
 mkdirSync(join(consumer,'src/commonMain/kotlin'),{recursive:true});
 const document=JSON.stringify({format_version:1,title:'Cold source',area:{shape:'rectangle',length_m:30,width_m:20},frames:[{id:'f',title:'Frame',objects:[],arrows:[]}]});
 writeFileSync(join(consumer,'src/commonMain/kotlin/Consumer.kt'),`import androidx.compose.runtime.Composable\nimport io.github.footballdiagrams.*\nval sample = Diagrams.parse("""${document}""")\n@Composable fun Consumer() { FootballDiagram(sample,0) }\n`);
 mkdirSync(join(consumer,'src/commonTest/kotlin'),{recursive:true});
 writeFileSync(join(consumer,'src/commonTest/kotlin/ConsumerTest.kt'),`import io.github.footballdiagrams.*\nimport kotlin.test.*\nclass ConsumerTest { @Test fun publicContractActuallyRuns() { assertEquals(30.0,sample.area.lengthMetres.toDouble()); assertEquals(sample,Diagrams.parse(Diagrams.stringify(sample))); assertTrue(diagramGeometry(sample.area).aspectRatio>1f) } }\n`);
 execute(gradle,['-p',consumer,'jvmTest','--rerun','linkDebugFrameworkIosSimulatorArm64','iosSimulatorArm64Test','--device',device,'--rerun','--console=plain'],scratch,'kotlin-consumer');
 const android=join(scratch,'android');mkdirSync(android);
 // Public example host is test input; its library dependency resolves exclusively
 // to the extracted distribution, never the fresh Git checkout or a sibling repo.
 cpSync(join(source,'examples/android'),android,{recursive:true,filter:path=>!/(?:^|\/)(build|\.gradle|\.kotlin|local\.properties)(?:\/|$)/.test(path)});
 writeFileSync(join(android,'settings.gradle.kts'),settings);
 execute(gradle,['-p',android,'assembleDebug','--console=plain'],scratch,'android-consumer');
 const apks=readdirSync(join(android,'build/outputs/apk/debug')).filter(name=>name.endsWith('.apk'));
 if(apks.length!==1)throw new Error('Expected exactly one independently assembled debug APK');
 const actualApk=join(android,'build/outputs/apk/debug',apks[0]);
 const framework=join(consumer,'build/bin/iosSimulatorArm64/debugFramework/ColdConsumer.framework/ColdConsumer');
 if(!existsSync(framework))throw new Error('Independent iOS framework is missing');
 const counts={};
 for(const target of ['jvmTest','iosSimulatorArm64Test']){
  const directory=join(consumer,'build/test-results',target);mkdirSync(join(evidence,target),{recursive:true});
  for(const file of readdirSync(directory).filter(name=>name.endsWith('.xml'))){
   cpSync(join(directory,file),join(evidence,target,file));
  }
  counts[target]=executedTests(directory);
 }
 for(const react of ['18.3.1','19.3.1'])execute(process.execPath,[fileURLToPath(new URL('./verify-js-consumer.mjs',import.meta.url)),source,join(evidence,`js-${react}`)],scratch,`js-${react}`,{...process.env,REACT_VERSION:react});
 const report={requestedPin:pin,commit:sha,packageSha256:manifest.sha256,consumerToolchain:{kotlin:"2.4.20",compose:"1.12.1",androidPlugin:"9.2.1",compileSdk:37,minSdk:26},node:process.version,java:run('java',['--version']).trim(),gradle:execute(gradle,['--version'],scratch,'gradle-version'),xcode:run('xcodebuild',['-version']).trim(),simulator:device,tests:counts,android:{assembled:true,sha256:hash(actualApk)},ios:{framework:true,sha256:hash(framework)}};
 writeFileSync(join(evidence,'source-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`Cold public source ${sha}: JVM/native tests, Android APK, iOS framework and installed JS passed. Evidence: ${evidence}`);
}finally{rmSync(scratch,{recursive:true,force:true});}
