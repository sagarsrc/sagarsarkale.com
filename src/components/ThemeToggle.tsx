'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="theme-toggle"
    >
      &#x25D1;
    </button>
  );
}
