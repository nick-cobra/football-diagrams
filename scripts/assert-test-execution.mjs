import { executedTests } from './consumers/test-results.mjs';
if(process.argv.length<3)throw new Error('Supply one or more actual Gradle XML result directories');
for(const directory of process.argv.slice(2))console.log(`${directory}: ${JSON.stringify(executedTests(directory))}`);
