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
      <Breadcrumbs />
      <h1 className="single-title">{frontmatter.title}</h1>

      <div className="post-meta">
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
        <nav className="related-posts">
          <div className="section-label">read next</div>
          {relatedPosts.map((rp) => (
            <div key={rp.path} className="post-item">
              <span className="post-item-title">
                <Link href={rp.path}>{rp.frontmatter.title}</Link>
              </span>
              <span className="post-item-date">
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
