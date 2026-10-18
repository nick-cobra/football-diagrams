import React, { useState } from 'react';
import { DiagramSvg } from 'football-diagrams/react';
import { parseDiagram } from 'football-diagrams';
import documents from './documents.json';

export function Harness({ name }) {
  const [documentIndex, setDocumentIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [thumbnail, setThumbnail] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [inline, setInline] = useState(false);
  const diagram = parseDiagram(documents[documentIndex]);
  return <section aria-label={`Root ${name}`}>
    <label>Document <select value={documentIndex} onChange={event => { setDocumentIndex(Number(event.target.value)); setFrameIndex(0); }}>
      {documents.map((doc, i) => <option key={i} value={i}>{doc.title}</option>)}
    </select></label>
    <button onClick={() => setFrameIndex(0)}>First frame</button>
    <button onClick={() => setFrameIndex(diagram.frames.length - 1)}>Last frame</button>
    <button onClick={() => setFrameIndex(-1)}>Invalid frame</button>
    <label><input type="checkbox" checked={thumbnail} onChange={event => setThumbnail(event.target.checked)} />Thumbnail</label>
    <label><input type="checkbox" checked={inline} onChange={event => setInline(event.target.checked)} />Inline size</label>
    <button onClick={() => setMounted(value => !value)}>{mounted ? 'Unmount' : 'Mount'}</button>
    <div className={thumbnail ? 'thumbnail' : 'detail'} data-testid="diagram-host">
      {mounted && <DiagramSvg diagram={diagram} frameIndex={frameIndex} thumbnail={thumbnail}
        className="host-diagram" style={inline ? { width:200, height:100 } : undefined} />}
    </div>
    <p data-testid="following">Following content</p>
  </section>;
}
