'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="bg-none border-none cursor-pointer text-[var(--fg-secondary)] text-[13px] p-0 leading-none transition-colors duration-150 hover:text-[var(--accent)]"
    >
      &#x25D1;
    </button>
  );
}
