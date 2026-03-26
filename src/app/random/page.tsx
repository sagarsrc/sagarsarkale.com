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
    <div className="list-container">
      <Breadcrumbs />
      <h1>/random</h1>
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
    </div>
  );
}
