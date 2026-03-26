'use client';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="absolute -top-full left-0 bg-[var(--accent)] text-[var(--bg)] px-4 py-2 z-100 text-[13px] focus:top-0"
    >
      Skip to content
    </a>
  );
}
