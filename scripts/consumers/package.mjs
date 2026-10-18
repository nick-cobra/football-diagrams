import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
export const run=(command,args,options={})=>execFileSync(command,args,{encoding:'utf8',stdio:'pipe',...options});
export const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
export function pack(source,evidence){
 mkdirSync(evidence,{recursive:true});
 const [result]=JSON.parse(run('npm',['pack','--ignore-scripts','--json','--pack-destination',evidence],{cwd:source}));
 const paths=result.files.map(file=>file.path);
 for(const required of ['dist/index.js','dist/index.d.ts','dist/react.js','dist/react.d.ts','dist/geometry.js','dist/geometry.d.ts','schema/diagram.schema.json','fixtures/valid/all-kinds.json','kotlin/gradlew','kotlin/library/build.gradle.kts','LICENSE','LICENSES/Ajv-MIT.txt','LICENSES/Gradle-Apache-2.0.txt']){
  if(!paths.includes(required))throw new Error(`Packed payload is missing ${required}`);
 }
 for(const file of paths){
  if(/(^|\/)(node_modules|build|\.gradle|\.kotlin|\.git|\.env(?:\..*)?|local\.properties|\.npmrc|\.yarnrc(?:\.yml)?)(\/|$)|\.(?:keystore|jks|p12|key)$/.test(file))throw new Error(`Forbidden packed file: ${file}`);
  if(/\.(?:js|ts|kt|kts|json)$/.test(file)){
   const content=readFileSync(join(source,file),'utf8');
   if(/app\.cobrahq|@cobrahq\/|SUPABASE_SERVICE_ROLE_KEY|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(content))throw new Error(`Private application import/secret marker in ${file}`);
  }
 }
 const archive=join(evidence,result.filename);
 const manifest={archive:result.filename,sha256:hash(archive),files:result.files.map(file=>({...file,sha256:hash(join(source,file.path))}))};
 writeFileSync(join(evidence,'package-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return {archive,manifest};
}
