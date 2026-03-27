'use client';

import { usePathname, useRouter } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      className="text-xs text-[var(--fg-secondary)] no-underline hover:text-[var(--accent)] transition-colors cursor-pointer"
    >
      &larr; back
    </button>
  );
}
