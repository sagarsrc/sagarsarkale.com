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
      <Breadcrumbs />
      <h1 className="page-title">Tags</h1>
      <ul className="tag-list">
        {tags.map(([tag, count]) => (
          <li key={tag}>
            <Link href={`/tags/${tag}`} className="tag">
              {tag}
            </Link>
            <span className="tag-count"> ({count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
