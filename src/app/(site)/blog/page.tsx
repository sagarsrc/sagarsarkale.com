import { getAllPosts } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogList } from "@/components/BlogList";
import type { Post } from "@/types/content";

export const metadata = {
  title: "Blog — Sagar Sarkale",
};

export default function BlogPage() {
  const posts = getAllPosts().filter((p: Post) => p.section === "blog");
  const postsForClient = posts.map(({ content, ...rest }) => rest);

  return (
    <div className="pb-8">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold">blog</h1>
        <Breadcrumbs />
      </div>
      <BlogList posts={postsForClient} />
    </div>
  );
}
