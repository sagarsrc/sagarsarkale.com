'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Post {
  slug: string;
  path: string;
  frontmatter: {
    title: string;
    date?: string;
    summary?: string;
  };
}

interface Props {
  posts: Post[];
}

export function AgentsSidebar({ posts }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (path: string) => pathname === path || pathname === path + '/';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] z-40 overflow-y-auto">
        <div className="px-4 h-14 border-b border-[var(--border)] flex items-center shrink-0">
          <Link
            href="/agents"
            className="text-[0.8125rem] font-semibold text-[var(--fg)] no-underline hover:text-[var(--accent)] transition-colors"
            onClick={() => setOpen(false)}
          >
            AGENTS.md
          </Link>
        </div>
        <nav className="py-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {posts.map((post, i) => {
              const active = isActive(post.path);
              const num = String(i + 1).padStart(2, '0');
              return (
                <li key={post.slug}>
                  <Link
                    href={post.path}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-start gap-2 px-3 py-1.5 text-sm transition-colors duration-100 no-underline',
                      active
                        ? 'text-[var(--fg)] font-medium'
                        : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]',
                    ].join(' ')}
                  >
                    <span className="font-mono text-[11px] text-[var(--fg-muted)] mt-0.5 shrink-0 w-5">
                      {num}
                    </span>
                    <span className="leading-snug">{post.frontmatter.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={[
          'lg:hidden fixed top-0 left-0 z-40 h-screen w-64 bg-[var(--surface)] border-r border-[var(--border)] overflow-y-auto transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="px-4 h-14 border-b border-[var(--border)] flex items-center shrink-0">
          <Link
            href="/agents"
            className="text-[0.8125rem] font-semibold text-[var(--fg)] no-underline hover:text-[var(--accent)] transition-colors"
            onClick={() => setOpen(false)}
          >
            AGENTS.md
          </Link>
        </div>
        <nav className="py-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {posts.map((post, i) => {
              const active = isActive(post.path);
              const num = String(i + 1).padStart(2, '0');
              return (
                <li key={post.slug}>
                  <Link
                    href={post.path}
                    onClick={() => setOpen(false)}
                    className={[
                      'flex items-start gap-2 px-3 py-1.5 text-sm transition-colors duration-100 no-underline',
                      active
                        ? 'text-[var(--fg)] font-medium'
                        : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]',
                    ].join(' ')}
                  >
                    <span className="font-mono text-[11px] text-[var(--fg-muted)] mt-0.5 shrink-0 w-5">
                      {num}
                    </span>
                    <span className="leading-snug">{post.frontmatter.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
