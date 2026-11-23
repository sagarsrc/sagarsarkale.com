'use client';

import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export function DiagramZoom() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [title, setTitle] = useState('Diagram preview');

  useEffect(() => {
    const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid-diagram, .diagram-zoom-source, .phone-gallery-item'));

    const openDiagram = (diagram: HTMLElement) => {
      const dialog = dialogRef.current;
      const stage = stageRef.current;
      const media = diagram.querySelector('svg, img');
      if (!dialog || !stage || !media) return;

      const preview = media.cloneNode(true) as SVGElement | HTMLImageElement;
      preview.classList.add('diagram-zoom-media');
      preview.removeAttribute('width');
      preview.removeAttribute('height');
      if (preview instanceof HTMLImageElement) preview.draggable = false;
      const caption = diagram.querySelector('figcaption, .phone-gallery-item-caption')?.textContent?.trim();
      const alt = media instanceof HTMLImageElement ? media.alt : '';
      const shortCaption = caption?.split('.')[0];
      setTitle(shortCaption || alt || 'Diagram preview');
      stage.replaceChildren(preview);
      stage.scrollTo({ top: 0, left: 0 });
      setZoom(MIN_ZOOM);
      dialog.showModal();
    };

    const cleanups = diagrams.map((diagram) => {
      diagram.setAttribute('role', 'button');
      diagram.setAttribute('tabindex', '0');
      diagram.setAttribute('aria-label', 'Open visual at larger size');
      diagram.setAttribute('title', 'Open visual at larger size');

      const onClick = (event: MouseEvent) => {
        event.preventDefault();
        openDiagram(diagram);
      };
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
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--diagram-zoom', String(zoom));
    stage.dataset.zoomed = zoom > MIN_ZOOM ? 'true' : 'false';
    requestAnimationFrame(() => {
      if (zoom === MIN_ZOOM) {
        stage.scrollTo({ top: 0, left: 0 });
        return;
      }
      stage.scrollTo({
        left: Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2),
        top: Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2),
      });
    });
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
        panRef.current = null;
        setZoom(MIN_ZOOM);
      }}
    >
      <div className="diagram-zoom-toolbar">
        <p id="diagram-zoom-title" className="diagram-zoom-title">{title}</p>
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
      <div
        ref={stageRef}
        className="diagram-zoom-stage"
        onPointerDown={(event) => {
          if (zoom <= MIN_ZOOM) return;
          const stage = event.currentTarget;
          panRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            left: stage.scrollLeft,
            top: stage.scrollTop,
          };
          stage.dataset.dragging = 'true';
          stage.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const pan = panRef.current;
          if (!pan || pan.pointerId !== event.pointerId) return;
          const stage = event.currentTarget;
          stage.scrollLeft = pan.left - (event.clientX - pan.x);
          stage.scrollTop = pan.top - (event.clientY - pan.y);
        }}
        onPointerUp={(event) => {
          if (panRef.current?.pointerId !== event.pointerId) return;
          panRef.current = null;
          delete event.currentTarget.dataset.dragging;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          panRef.current = null;
          delete event.currentTarget.dataset.dragging;
        }}
      />
    </dialog>
  );
}
