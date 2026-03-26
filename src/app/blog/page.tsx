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
        <div key={post.path} className="post-item">
          <span className="post-item-title">
            <Link href={post.path}>{post.frontmatter.title}</Link>
          </span>
          <span className="post-item-date">
            {post.frontmatter.date ? formatDate(post.frontmatter.date) : ""}
          </span>
        </div>
      ))}
      {posts.map((post: Post) => (
        post.frontmatter.summary ? (
          <span key={`${post.path}-summary`} />
        ) : null
      ))}
    </div>
  );
}
