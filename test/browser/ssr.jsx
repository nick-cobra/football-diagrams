import React, { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Harness } from './app.jsx';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram } from 'football-diagrams';
import documents from './documents.json';
const longPill = renderToString(<DiagramSvg diagram={parseDiagram(documents.find(doc=>doc.title==='Viewport'))} style={{width:334,fontFamily:'Arial,sans-serif'}}/>);
const root = name => `<div id="root-${name}">${renderToString(<StrictMode><Harness name={name} /></StrictMode>, {identifierPrefix:`root-${name}-`})}</div>`;
console.log(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Independent Football Diagrams consumer</title><style>
*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:16px}section{margin-bottom:24px}button,select,label{margin:4px}svg{display:block}.detail{width:100%;max-width:600px}.thumbnail{width:355px;max-width:100%;height:168px}.thumbnail svg{width:100%;height:100%}
</style><body><h1>Independent React consumer</h1>${root('a')}${root('b')}<template id="pill-ssr-template">${longPill}</template><script type="module" src="/client.js"></script></body></html>`);
