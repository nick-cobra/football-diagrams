import React, { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Harness } from './app.jsx';
for (const name of ['a', 'b']) {
  hydrateRoot(document.getElementById(`root-${name}`), <StrictMode><Harness name={name} /></StrictMode>, {
    identifierPrefix:`root-${name}-`,
    onRecoverableError(error) { console.error('Hydration recovery:', error.message); },
  });
}
