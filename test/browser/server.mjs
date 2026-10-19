import { createServer } from 'node:http';
import { mkdtemp, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../../', import.meta.url));
const consumer = await mkdtemp(join(tmpdir(), 'football-browser-'));
const [pack] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', consumer], {cwd:root,encoding:'utf8'}));
const react = process.env.REACT_VERSION || '18.3.1';
await writeFile(join(consumer,'package.json'), JSON.stringify({name:'independent-browser-consumer',private:true,type:'module'}));
execFileSync('npm', ['install','--ignore-scripts','--no-audit','--no-fund','--save-exact',join(consumer,pack.filename),`react@${react}`,`react-dom@${react}`], {cwd:consumer,stdio:'pipe'});
for (const file of ['app.jsx','client.jsx','ssr.jsx','cache-probe.jsx']) await copyFile(new URL(file, import.meta.url), join(consumer,file));
const documents = await Promise.all(['all-kinds','multi-frame','square','off-pitch','empty','short-labels','key-collisions','repeated-arrows'].map(async name => JSON.parse(await readFile(join(root,`fixtures/valid/${name}.json`),'utf8'))));
await writeFile(join(consumer,'documents.json'), JSON.stringify(documents));
await build({absWorkingDir:consumer,entryPoints:['client.jsx'],bundle:true,format:'esm',outfile:join(consumer,'client.js'),jsx:'automatic'});
await build({absWorkingDir:consumer,entryPoints:['ssr.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:join(consumer,'ssr.mjs'),jsx:'automatic'});
const html = execFileSync(process.execPath, ['ssr.mjs'], {cwd:consumer,encoding:'utf8'});
const client = await readFile(join(consumer,'client.js'));
const server = createServer((req,res) => {
  if (req.url==='/favicon.ico') {res.writeHead(204);res.end();return;}
  res.setHeader('Content-Type',req.url==='/client.js' ? 'text/javascript' : 'text/html; charset=utf-8');
  res.end(req.url==='/client.js' ? client : html);
});
server.listen(4391,'127.0.0.1',()=>console.log(`Independent installed React ${react} consumer: http://127.0.0.1:4391`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(async()=>{await rm(consumer,{recursive:true,force:true});process.exit(0);}));
