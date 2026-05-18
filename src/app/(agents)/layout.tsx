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
    <div className="pb-20 lg:pb-0">
      <AgentsSidebar posts={posts} />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
