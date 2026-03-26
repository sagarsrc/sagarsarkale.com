'use client';

export function BackToTop() {
  return (
    <div style={{ textAlign: 'center', margin: '2rem 0', fontFamily: 'var(--font-mono)' }}>
      <a
        href="#main-content"
        style={{ fontSize: '0.85em', color: 'var(--content-secondary)' }}
      >
        back to top
      </a>
    </div>
  );
}
