import React, { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Harness } from './app.jsx';
for (const name of ['a', 'b']) {
  hydrateRoot(document.getElementById(`root-${name}`), <StrictMode><Harness name={name} /></StrictMode>, {
    identifierPrefix:`root-${name}-`,
    onRecoverableError(error) { console.error('Hydration recovery:', error.message); },
  });
}

import { runCacheProbe } from './cache-probe.jsx';
window.runDiagramCacheProbe = runCacheProbe;
const probeButton=document.createElement('button');
probeButton.textContent='Check geometry cache';
const probeOutput=document.createElement('pre');
probeOutput.dataset.testid='cache-probe-report';
probeButton.addEventListener('click',()=>{probeOutput.textContent=JSON.stringify(runCacheProbe(),null,2);});
document.body.append(probeButton,probeOutput);
import { runViewportProbe } from './cache-probe.jsx';
window.runDiagramViewportProbe=runViewportProbe;
const viewportButton=document.createElement('button');viewportButton.textContent='Check viewport pixels';
const viewportOutput=document.createElement('pre');viewportOutput.dataset.testid='viewport-probe-report';
viewportButton.addEventListener('click',async()=>{viewportOutput.textContent=JSON.stringify(await runViewportProbe(),null,2);});
document.body.append(viewportButton,viewportOutput);
