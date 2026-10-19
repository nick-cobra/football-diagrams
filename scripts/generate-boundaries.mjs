import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
const schema=JSON.parse(await readFile(new URL('../schema/diagram.schema.json',import.meta.url),'utf8'));
const schemaV2=JSON.parse(await readFile(new URL('../schema/diagram-v2.schema.json',import.meta.url),'utf8'));
const supportedVersions=new Set([schema.properties.format_version.const,schemaV2.properties.format_version.const]);
const base={format_version:1,title:'Boundary',area:{shape:'rectangle',length_m:30,width_m:20,label:'Area'},frames:[{id:'frame',title:'Frame',caption:'',objects:[{kind:'player',x:5,y:6,colour:'blue',label:'Player',short:'P',number:1,angle:0,width:2,ball:true}],arrows:[{kind:'pass',points:[{x:1,y:2},{x:3,y:4}],label:'Pass',sequence:1,badge:{x:2,y:3}}],areas:[{id:'zone',label:'Zone',x:10,y:10,width:5,height:5,colour:'blue'}]}]};
const cases=[];
const constraints=new Map();
function setAt(doc,path,value,omit=false){let parent=doc;for(const key of path.slice(0,-1))parent=parent[key];if(!path.length)return value;if(omit)delete parent[path.at(-1)];else parent[path.at(-1)]=value;return doc;}
function at(path){return path.reduce((value,key)=>value[key],base);}
function add(pointer,keyword,path,suffix,value,valid,omit=false){
 const id=`boundary-${(path.length?path.join('-'):'root')}-${keyword}-${suffix}`;
 const key=`${pointer}/${keyword}`;
 constraints.set(key,[...(constraints.get(key)||[]),id]);
 cases.push({id,valid,constraint:key,field:'/'+path.join('/'),document:setAt(structuredClone(base),path,value,omit)});
}
function neighbour(value,direction){if(value===0)return direction*Number.MIN_VALUE;const bytes=new ArrayBuffer(8),view=new DataView(bytes);view.setFloat64(0,value);view.setBigUint64(0,view.getBigUint64(0)+(Math.sign(value)===direction?1n:-1n));return view.getFloat64(0);}
function walk(node,pointer,path,nullable=false){
 if(node.$ref){const ref=node.$ref;return walk(ref.slice(2).split('/').reduce((n,key)=>n[key],schema),ref,path,nullable);}
 if(node.anyOf){add(pointer,'anyOf',path,'null',null,true);return walk(node.anyOf.find(n=>n.type!=='null'),pointer+'/anyOf/0',path,true);}
 const type=node.type;
 if(type){const wrong={object:[null,[],true,'object',1],array:[null,{},true,'array',1],string:[null,[],{},true,1],number:[null,[],{},true,'1'],integer:[null,[],{},true,'1',1.5],boolean:[null,[],{},'true',1]}[type];
 for(const [i,value]of wrong.entries())if(!(nullable&&value===null))add(pointer,'type',path,`wrong-${i}`,value,false);
 }
 if(node.const!==undefined){
  add(pointer,'const',path,'valid',node.const,true);
  let invalid=type==='integer'?node.const+1:'unknown';
  while(supportedVersions.has(invalid))invalid++;
  add(pointer,'const',path,'invalid',invalid,false);
 }
 if(node.enum){for(const value of node.enum)add(pointer,'enum',path,value,value,true);add(pointer,'enum',path,'invalid','unknown',false);}
 if(type==='object'){
  if(node.additionalProperties===false)add(pointer,'additionalProperties',path,'unknown',{...at(path),unexpected:true},false);
  for(const property of node.required||[])add(pointer,'required',path.concat(property),property,undefined,false,true);
  for(const[property,child]of Object.entries(node.properties)){
   if(!(node.required||[]).includes(property))add(pointer+'/properties/'+property,'optional',path.concat(property),'absent',undefined,true,true);
   walk(child,pointer+'/properties/'+property,path.concat(property));
  }
 }
 if(type==='array'){
  for(const keyword of ['minItems','maxItems'])if(node[keyword]!==undefined){const bound=node[keyword],invalid=keyword==='minItems'?bound-1:bound+1;
   const item=at(path)[0];
   add(pointer,keyword,path,'bound',Array.from({length:bound},()=>structuredClone(item)),true);
   add(pointer,keyword,path,'outside',Array.from({length:invalid},()=>structuredClone(item)),false);
  }
  if(node.minItems===undefined)add(pointer,'type',path,'empty',[],true);
  walk(node.items,pointer+'/items',path.concat(0));
 }
 if(type==='string')for(const keyword of ['minLength','maxLength'])if(node[keyword]!==undefined){
  const bound=node[keyword],invalid=keyword==='minLength'?bound-1:bound+1;
  add(pointer,keyword,path,'bound','x'.repeat(bound),true);
  add(pointer,keyword,path,'unicode-bound','⚽'.repeat(bound),true);
  add(pointer,keyword,path,'astral-bound','😀'.repeat(bound),true);
  add(pointer,keyword,path,'outside','x'.repeat(invalid),false);
 }
 if(type==='number'||type==='integer'){
  for(const keyword of ['minimum','maximum','exclusiveMinimum','exclusiveMaximum'])if(node[keyword]!==undefined){
   const bound=node[keyword],lower=keyword.endsWith('inimum'),exclusive=keyword.startsWith('exclusive');
   const inside=exclusive?neighbour(bound,lower?1:-1):bound;
   const outside=exclusive?bound:neighbour(bound,lower?-1:1);
   add(pointer,keyword,path,'bound',inside,true);
   add(pointer,keyword,path,'outside',outside,false);
  }
  if(type==='integer')add(pointer,'type',path,'fractional',1.5,false);
 }
}
walk(schema,'#',[]);
const root=new URL('../fixtures/',import.meta.url);
for(const kind of ['valid','invalid'])for(const name of await readdir(new URL(kind+'/',root)))if(name.startsWith('boundary-'))await unlink(new URL(kind+'/'+name,root));
for(const entry of cases)await writeFile(new URL(`${entry.valid?'valid':'invalid'}/${entry.id}.json`,root),JSON.stringify(entry.document)+'\n');
const manifest=cases.map(({document,...entry})=>({...entry,file:`${entry.valid?'valid':'invalid'}/${entry.id}.json`}));
await writeFile(new URL('boundary-manifest.json',root),JSON.stringify(manifest,null,2)+'\n');
const rows=[...constraints.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([constraint,ids])=>`| \`${constraint}\` | ${ids.map(id=>`\`${id}\``).join(', ')} |`);
await writeFile(new URL('../test/BOUNDARIES.md',import.meta.url),`# Shared protocol boundaries\n\nGenerated by \`node scripts/generate-boundaries.mjs\`. Each row maps a schema constraint to named valid boundary and invalid-neighbour fixtures. Both parsers consume the same files. Values are synthetic.\n\n| Schema constraint | Cases |\n| --- | --- |\n${rows.join('\n')}\n\nMetadata keywords (\`$schema\`, \`$id\`, \`title\`) are not value constraints. \`$ref\`, \`properties\`, \`items\` and \`$defs\` route to the rows for their resolved nodes. Null alternatives use the enclosing \`anyOf\` row; required/optional property presence is explicit. Other bounds and numeric representation cases also remain in the hand-authored corpus.\n\nKotlin fills omitted \`caption\` with an empty string, \`areas\` with an empty list, and object \`ball\` with false; nullable properties normalise to omission when encoded. JS retains authored absence/null. Compare authored non-null values and each parser's stable round trip, rather than requiring byte-identical optional-default encoding. Drawing numbers use binary64 precision. Malformed JSON and non-finite direct JS objects are tested separately because they are not JSON fixtures.\n`);
console.log(`${cases.length} cases mapped to ${constraints.size} constraints`);
