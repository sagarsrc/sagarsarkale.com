'use client';

export function BackToTop() {
  return (
    <div className="text-center text-xs my-8 [&_a]:text-[var(--fg-muted)] [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer">back to top</button>
    </div>
  );
}
