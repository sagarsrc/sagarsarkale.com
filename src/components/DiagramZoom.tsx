'use client';

import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function DiagramZoom() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid-diagram'));

    const openDiagram = (diagram: HTMLElement) => {
      const dialog = dialogRef.current;
      const stage = stageRef.current;
      const svg = diagram.querySelector('svg');
      if (!dialog || !stage || !svg) return;

      const preview = svg.cloneNode(true) as SVGElement;
      preview.classList.add('diagram-zoom-media');
      preview.removeAttribute('width');
      preview.removeAttribute('height');
      stage.replaceChildren(preview);
      stage.scrollTo({ top: 0, left: 0 });
      setZoom(MIN_ZOOM);
      dialog.showModal();
    };

    const cleanups = diagrams.map((diagram) => {
      diagram.setAttribute('role', 'button');
      diagram.setAttribute('tabindex', '0');
      diagram.setAttribute('aria-label', 'Open diagram at larger size');
      diagram.setAttribute('title', 'Open diagram at larger size');

      const onClick = () => openDiagram(diagram);
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDiagram(diagram);
        }
      };

      diagram.addEventListener('click', onClick);
      diagram.addEventListener('keydown', onKeyDown);
      return () => {
        diagram.removeEventListener('click', onClick);
        diagram.removeEventListener('keydown', onKeyDown);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    stageRef.current?.style.setProperty('--diagram-zoom', String(zoom));
  }, [zoom]);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="diagram-zoom-dialog"
      aria-labelledby="diagram-zoom-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onClose={() => {
        stageRef.current?.replaceChildren();
        setZoom(MIN_ZOOM);
      }}
    >
      <div className="diagram-zoom-toolbar">
        <p id="diagram-zoom-title" className="diagram-zoom-title">Diagram preview</p>
        <div className="diagram-zoom-actions">
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            −
          </button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            +
          </button>
          <button type="button" onClick={close} aria-label="Close diagram preview">×</button>
        </div>
      </div>
      <div ref={stageRef} className="diagram-zoom-stage" />
    </dialog>
  );
}
