'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

export function MermaidInit() {
  const { theme } = useTheme();
  const renderCount = useRef(0);

  useEffect(() => {
    const renderMermaid = async () => {
      const mermaid = (await import('mermaid')).default;

      const mermaidTheme = theme === 'dark' ? 'dark' : 'neutral';

      mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme,
        flowchart: { useMaxWidth: false },
        themeVariables: theme === 'dark'
          ? { primaryColor: '#1a1a1e', primaryTextColor: '#ededf0', lineColor: '#85858f', secondaryColor: '#32323a' }
          : {},
      });

      const elements = document.querySelectorAll('pre.mermaid');
      if (elements.length === 0) return;

      // Clear previous renders and restore original source
      elements.forEach((el, i) => {
        // Store original source on first render
        if (!el.getAttribute('data-mermaid-source')) {
          el.setAttribute('data-mermaid-source', el.textContent || '');
        }
        // Restore source for re-render
        const source = el.getAttribute('data-mermaid-source');
        if (source && el.getAttribute('data-processed')) {
          el.removeAttribute('data-processed');
          el.innerHTML = source;
        }
        renderCount.current += 1;
        el.setAttribute('id', `mermaid-${renderCount.current}-${i}`);
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
  }, [theme]);

  return null;
}
