'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'night' : 'day';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="theme-toggle inline-grid h-11 w-11 sm:h-8 sm:w-8 place-items-center cursor-pointer text-[var(--fg-secondary)] transition-colors duration-150 hover:text-[var(--accent)]"
    >
      <Moon className="theme-toggle-icon theme-toggle-icon--moon" size={17} strokeWidth={1.5} aria-hidden="true" />
      <Sun className="theme-toggle-icon theme-toggle-icon--sun" size={17} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
