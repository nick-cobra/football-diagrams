import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
export function executedTests(directory){
 const counts={executed:0,skipped:0,failed:0};
 for(const name of readdirSync(directory).filter(name=>name.endsWith('.xml'))){
  const xml=readFileSync(join(directory,name),'utf8');
  counts.executed+=(xml.match(/<testcase\b/g)||[]).length;
  counts.skipped+=(xml.match(/<skipped\b/g)||[]).length;
  counts.failed+=(xml.match(/<(?:failure|error)\b/g)||[]).length;
 }
 if(counts.executed===0||counts.skipped!==0||counts.failed!==0)throw new Error(`${directory}: expected real successful test execution, got ${JSON.stringify(counts)}`);
 return counts;
}
