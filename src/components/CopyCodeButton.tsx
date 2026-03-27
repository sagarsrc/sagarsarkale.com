'use client';

import { useEffect } from 'react';

export function CopyCodeButton() {
  useEffect(() => {
    const figures = document.querySelectorAll('[data-rehype-pretty-code-figure]');
    figures.forEach((figure) => {
      if (figure.querySelector('.copy-btn')) return;
      const pre = figure.querySelector('pre');
      if (!pre) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'copy';
      btn.setAttribute('aria-label', 'Copy code');
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        if (!code) return;
        await navigator.clipboard.writeText(code.textContent || '');
        btn.textContent = 'copied';
        setTimeout(() => { btn.textContent = 'copy'; }, 2000);
      });
      figure.classList.add('relative');
      figure.appendChild(btn);
    });
  }, []);

  return null;
}
