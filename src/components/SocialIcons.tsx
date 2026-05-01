"use client";

import { useState, useCallback, useRef } from "react";

interface LinkItem {
  href: string;
  label: string;
  svg: React.ReactNode;
}

const links: LinkItem[] = [
  {
    href: "mailto:sagar@quickcall.dev",
    label: "Email",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "https://www.linkedin.com/in/sagar-sarkale/",
    label: "LinkedIn",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: "https://x.com/sagar_sarkale",
    label: "X",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://github.com/sagarsrc",
    label: "GitHub",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
];

const DOUBLE_CLICK_MS = 350;

export function SocialIcons() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const lastClickRef = useRef<{ label: string; time: number } | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(
    async (href: string, label: string, e: React.MouseEvent) => {
      e.preventDefault();

      const now = Date.now();
      const last = lastClickRef.current;

      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }

      if (last && last.label === label && now - last.time < DOUBLE_CLICK_MS) {
        lastClickRef.current = null;
        try {
          await navigator.clipboard.writeText(href);
          setCopiedLabel(label);
          setTimeout(() => setCopiedLabel(null), 1200);
        } catch {
          // silently fail
        }
      } else {
        lastClickRef.current = { label, time: now };
        navTimeoutRef.current = setTimeout(() => {
          window.open(href, "_blank", "noopener,noreferrer");
          lastClickRef.current = null;
        }, DOUBLE_CLICK_MS);
      }
    },
    []
  );

  return (
    <>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          onClick={(e) => handleClick(link.href, link.label, e)}
          aria-label={link.label}
          className={`social-icon-link ${copiedLabel === link.label ? "is-copied" : ""}`}
          title={link.label}
        >
          {link.svg}
          <span className="social-icon-copied">copied</span>
        </a>
      ))}
    </>
  );
}
