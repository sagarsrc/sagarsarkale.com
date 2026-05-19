import { AgentsSidebar } from "@/components/AgentsSidebar";
import { getAllPosts } from "@/lib/content";
import type { Post } from "@/types/content";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = getAllPosts()
    .filter((p: Post) => p.section === "agents")
    .map(({ slug, path, frontmatter }) => ({ slug, path, frontmatter: { title: frontmatter.title, date: frontmatter.date, summary: frontmatter.summary } }));

  return (
    <div>
      {/* AgentsSidebar disabled - layout too crowded on mobile */}
      {/* <AgentsSidebar posts={posts} /> */}
      {children}
    </div>
  );
}
