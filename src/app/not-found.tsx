import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';

export default function NotFound() {
  const recentPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-[48ch]">

        {/* header */}
        <p className="text-[0.8125rem] font-mono text-[var(--fg-muted)] tracking-wide uppercase mb-3">
          HTTP 404
        </p>
        <h1 className="text-3xl font-bold tracking-tighter mb-3">
          nothing here
        </h1>
        <p className="text-[0.9375rem] text-[var(--fg-secondary)] leading-[1.65] mb-10">
          this route returned void. could be a typo, a dead link, or
          a page that got garbage-collected.
        </p>

        {/* recent posts */}
        {recentPosts.length > 0 && (
          <div className="mb-10">
            <p className="text-[0.8125rem] font-mono text-[var(--fg-muted)] tracking-wide uppercase mb-4">
              recent writing
            </p>
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div key={post.slug} className="flex items-baseline justify-between gap-4">
                  <Link
                    href={post.path}
                    className="text-[0.8125rem] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium truncate"
                  >
                    {post.frontmatter.title}
                  </Link>
                  <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums shrink-0">
                    {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* nav */}
        <div className="flex items-center gap-4 text-[0.8125rem]">
          <Link
            href="/"
            className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium"
          >
            back to home
          </Link>
          <span className="text-[var(--fg-muted)]">/</span>
          <Link
            href="/blog"
            className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium"
          >
            all posts
          </Link>
        </div>

      </div>
    </div>
  );
}
