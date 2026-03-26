import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/content";

export const metadata = {
  title: "Blog — Sagar Sarkale",
};

export default function BlogPage() {
  const posts = getAllPosts().filter((p: Post) => p.section === "blog");

  return (
    <div className="pb-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-xl font-bold">/blog</h1>
        <Breadcrumbs />
      </div>
      <div className="flex flex-col gap-3 mt-6">
        {posts.map((post: Post) => (
          <Link key={post.path} href={post.path} className="flex items-center gap-3 p-2 border border-[var(--code-border)] rounded-lg no-underline text-inherit transition-[border-color,background] duration-200 max-h-20 overflow-hidden hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--code-border)_15%,transparent)]">
            {post.coverImage && (
              <div className="flex-[0_0_64px] w-16 h-12 rounded overflow-hidden bg-[var(--code-background)]">
                <img src={post.coverImage} alt="" loading="lazy" className="block w-16 h-12 object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold leading-[1.3] mb-[0.15rem] text-[var(--fg)] whitespace-nowrap overflow-hidden text-ellipsis">{post.frontmatter.title}</h2>
              {post.frontmatter.summary && (
                <p className="text-xs text-[var(--fg-secondary)] leading-[1.3] mb-[0.2rem] line-clamp-1">{post.frontmatter.summary}</p>
              )}
              <div className="flex gap-3 text-xs text-[var(--fg-muted)]">
                <span>{post.readingTime}</span>
                {post.frontmatter.date && (
                  <span>{formatDate(post.frontmatter.date)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
