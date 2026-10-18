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
