'use client';

export function BackToTop() {
  return (
    <div className="text-center text-xs my-8">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors">back to top</button>
    </div>
  );
}
