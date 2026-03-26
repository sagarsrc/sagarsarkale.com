'use client';

export function BackToTop() {
  return (
    <div className="text-center text-xs my-8 [&_a]:text-[var(--fg-muted)] [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
      <a href="#main-content">back to top</a>
    </div>
  );
}
