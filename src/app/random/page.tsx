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
        <h1 className="text-xl font-bold">/random</h1>
        <Breadcrumbs />
      </div>
      {posts.map((post: Post) => (
        <div key={post.path} className="flex justify-between items-baseline py-[0.35rem] gap-4">
          <span className="text-sm [&_a]:text-[var(--fg)] [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
            <Link href={post.path}>{post.frontmatter.title}</Link>
          </span>
          <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">
            {post.frontmatter.date ? formatDate(post.frontmatter.date) : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
