import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tags' };

export default function TagsPage() {
  const posts = getAllPosts();
  const tagCounts: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.frontmatter.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-xl font-semibold">tags</h1>
        <Breadcrumbs />
      </div>
      <div className="flex flex-wrap gap-y-2 gap-x-4 mt-4">
        {tags.map(([tag, count]) => (
          <span key={tag}>
            <Link href={`/tags/${tag}`} className="text-[var(--fg-secondary)] no-underline text-sm before:content-['#'] before:text-[var(--fg-muted)] hover:text-[var(--accent)]">
              {tag} <span className="text-[var(--fg-muted)] text-xs">({count})</span>
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
