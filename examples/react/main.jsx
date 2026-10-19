import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DiagramSvg } from '../../dist/react.js';
import { parseDiagram } from '../../dist/index.js';
import movement from '../../fixtures/valid/multi-frame.json';
import equipment from '../../fixtures/valid/all-kinds.json';
import authoredEquipment from '../../fixtures/valid/authored-equipment-v2.json';
import longPill from '../../fixtures/valid/long-pill-viewport.json';
import './style.css';

const documents = [parseDiagram(movement), parseDiagram(equipment), parseDiagram(authoredEquipment), parseDiagram(longPill)];

function Example() {
  const [documentIndex, setDocumentIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const diagram = documents[documentIndex];
  return <main>
    <header><p className="eyebrow">OPEN FORMAT · REACT + COMPOSE</p><h1>Football Diagrams</h1><p>A football exercise, described as data and drawn on screen.</p></header>
    <section aria-label="Diagram example">
      <div className="controls">
        <label>Example <select value={documentIndex} onChange={event => { setDocumentIndex(Number(event.target.value)); setFrameIndex(0); }}>
          {documents.map((document, index) => <option key={document.title} value={index}>{document.title}</option>)}
        </select></label>
        <div className="steps" aria-label="Frame selection">{diagram.frames.map((frame, index) => <button key={frame.id} aria-pressed={frameIndex === index} onClick={() => setFrameIndex(index)}>{frame.title}</button>)}</div>
      </div>
      <DiagramSvg diagram={diagram} frameIndex={frameIndex} />
      <p className="caption">{diagram.frames[frameIndex].caption}</p>
    </section>
    <section className="small"><h2>The same frame as a thumbnail</h2><DiagramSvg diagram={diagram} frameIndex={frameIndex} thumbnail /></section>
    <footer>Independent synthetic examples. The host owns its data and controls; the renderer draws the selected frame.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<Example />);
