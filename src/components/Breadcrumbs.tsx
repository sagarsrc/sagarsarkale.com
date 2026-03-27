'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useEffect } from 'react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();
  const hasHistory = useRef(false);

  useEffect(() => {
    hasHistory.current = window.history.length > 1;
  }, []);

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const parentPath = segments.length > 1
    ? '/' + segments.slice(0, -1).join('/')
    : '/';

  return (
    <Link
      href={parentPath}
      onClick={(e) => {
        if (hasHistory.current) {
          e.preventDefault();
          router.back();
        }
      }}
      className="text-xs text-[var(--fg-secondary)] no-underline hover:text-[var(--accent)] transition-colors"
    >
      &larr; back
    </Link>
  );
}
