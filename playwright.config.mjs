import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'test/browser',
  testMatch:'*.spec.mjs',
  fullyParallel:false,
  workers:1,
  retries:0,
  use:{baseURL:'http://127.0.0.1:4391',browserName:'chromium',viewport:{width:960,height:900},deviceScaleFactor:1},
  webServer:{command:'node test/browser/server.mjs',url:'http://127.0.0.1:4391',reuseExistingServer:!process.env.CI,timeout:120000},
  reporter:[['list'],['html',{open:'never'}]],
});
