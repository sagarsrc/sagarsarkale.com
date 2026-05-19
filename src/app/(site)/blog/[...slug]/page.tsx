import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BackToTop } from '@/components/BackToTop';
import { MDXRenderer } from '@/components/MDXRenderer';
import { TocSidebar } from '@/components/TocSidebar';

import { getAllPosts, getPostByPath, getRelatedPosts, extractToc } from '@/lib/content';
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

  const title = post.frontmatter.title;
  const description = post.frontmatter.description || post.frontmatter.summary || '';

  // Posts with explicit cover image override the generated OG image
  const coverImages = post.coverImage
    ? [{ url: post.coverImage, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    metadataBase: new URL('https://sagarsarkale.com'),
    alternates: {
      canonical: urlPath,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: urlPath,
      siteName: 'Sagar Sarkale',
      title,
      description,
      images: coverImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverImages?.map((img) => img.url),
    },
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
        <h1 className="text-2xl font-semibold leading-snug">{frontmatter.title}</h1>
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

      {post.coverImage && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={post.coverImage}
            alt={frontmatter.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {frontmatter.toc && <TocSidebar entries={extractToc(content)} />}

      <MDXRenderer content={content} />

      {relatedPosts.length > 0 && (
        <nav className="mt-12 pt-8 border-t border-[var(--code-border)]">
          <div className="section-label">read next</div>
          {relatedPosts.map((rp) => (
            <div key={rp.path} className="flex justify-between items-baseline py-2 gap-4 max-sm:flex-col max-sm:gap-1">
              <span className="text-sm">
                <Link href={rp.path}>{rp.frontmatter.title}</Link>
              </span>
              <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">
                {rp.frontmatter.date ? formatDate(rp.frontmatter.date) : ''}
              </span>
            </div>
          ))}
          <Link href="/blog" className="inline-block mt-5 text-[0.8125rem] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">all posts</Link>
        </nav>
      )}

      {!frontmatter.hideBackToTop && <BackToTop />}
    </article>
  );
}
