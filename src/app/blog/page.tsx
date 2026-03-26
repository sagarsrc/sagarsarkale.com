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
    <div className="list-container">
      <Breadcrumbs />
      <h1>/blog</h1>
      {posts.map((post: Post) => (
        <div key={post.path} className="post-line">
          <p className="line-date">{post.frontmatter.date ? formatDate(post.frontmatter.date) : ""}</p>
          <div>
            <p className="line-title">
              <Link href={post.path}>{post.frontmatter.title}</Link>
            </p>
            {post.frontmatter.summary && (
              <p className="line-summary">{post.frontmatter.summary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
