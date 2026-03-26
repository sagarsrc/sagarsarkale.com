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
      <div className="blog-grid">
        {posts.map((post: Post) => (
          <Link key={post.path} href={post.path} className="blog-card">
            {post.coverImage && (
              <div className="blog-card-thumb">
                <img src={post.coverImage} alt="" loading="lazy" />
              </div>
            )}
            <div className="blog-card-body">
              <h2 className="blog-card-title">{post.frontmatter.title}</h2>
              {post.frontmatter.summary && (
                <p className="blog-card-summary">{post.frontmatter.summary}</p>
              )}
              <div className="blog-card-meta">
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
