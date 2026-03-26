import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BackToTop } from '@/components/BackToTop';
import { MDXRenderer } from '@/components/MDXRenderer';
import { getAllPosts, getPostByPath, getRelatedPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts().filter((p) => p.section === 'blog');
  return posts.map((post) => ({
    slug: post.path.replace(/^\/blog\//, '').split('/'),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const urlPath = '/blog/' + slug.join('/');
  const post = getPostByPath(urlPath);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description || post.frontmatter.summary,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const urlPath = '/blog/' + slug.join('/');
  const post = getPostByPath(urlPath);

  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;
  const relatedPosts = getRelatedPosts(urlPath, 3);

  return (
    <article>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold font-mono leading-[1.3]">{frontmatter.title}</h1>
        <Breadcrumbs />
      </div>

      <div className="text-xs text-[var(--fg-secondary)] mb-8 flex items-center gap-3 flex-wrap">
        {frontmatter.readTime !== false && (
          <span>{readingTime}</span>
        )}
        {frontmatter.date && (
          <span>&middot; {formatDate(frontmatter.date)}</span>
        )}
        {frontmatter.showTags !== false && frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="post-tags">
            {frontmatter.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="prose">
        <MDXRenderer content={content} />
      </div>

      {relatedPosts.length > 0 && (
        <nav className="mt-12 pt-8 border-t border-[var(--code-border)]">
          <div className="section-label">read next</div>
          {relatedPosts.map((rp) => (
            <div key={rp.path} className="flex justify-between items-baseline py-[0.35rem] gap-4 max-sm:flex-col max-sm:gap-[0.15rem]">
              <span className="text-sm">
                <Link href={rp.path}>{rp.frontmatter.title}</Link>
              </span>
              <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">
                {rp.frontmatter.date ? formatDate(rp.frontmatter.date) : ''}
              </span>
            </div>
          ))}
          <Link href="/blog" className="arrow-link">all posts</Link>
        </nav>
      )}

      {!frontmatter.hideBackToTop && <BackToTop />}
    </article>
  );
}
