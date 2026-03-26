'use client';

import { useEffect } from 'react';

export function MermaidInit() {
  useEffect(() => {
    const renderMermaid = async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
      });

      const elements = document.querySelectorAll('pre.mermaid');
      if (elements.length === 0) return;

      // Mermaid needs unique IDs
      elements.forEach((el, i) => {
        el.setAttribute('id', `mermaid-${i}`);
      });

      try {
        await mermaid.run({ nodes: elements as unknown as HTMLElement[] });
      } catch (e) {
        console.warn('Mermaid render error:', e);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderMermaid, 100);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
