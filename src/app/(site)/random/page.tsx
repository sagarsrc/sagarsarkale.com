import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/content";

export const metadata = {
  title: "Random — Sagar Sarkale",
};

export default function RandomPage() {
  const posts = getAllPosts().filter((p: Post) => p.section === "random");

  return (
    <div className="pb-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold">random</h1>
        <Breadcrumbs />
      </div>
      <div className="flex flex-col gap-3 mt-6">
        {posts.map((post: Post) => (
          <Link key={post.path} href={post.path} className="flex items-center justify-between gap-4 p-2 border border-[var(--code-border)] rounded-lg no-underline text-inherit transition-[border-color,background] duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--code-border)_15%,transparent)]">
            <span className="text-sm font-semibold text-[var(--fg)]">{post.frontmatter.title}</span>
            <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0 tabular-nums">
              {post.frontmatter.date ? formatDate(post.frontmatter.date) : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
