import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import type { Post } from "@/types/content";

export const metadata = {
  title: "AGENTS.md — Sagar Sarkale",
};

export default function AgentsPage() {
  const posts = getAllPosts().filter((p: Post) => p.section === "agents").reverse();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20">
      {/* Hero */}
      <section className="border-b border-[var(--border)] pb-12 mb-12">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--fg-muted)] mb-3 block">
          /Series
        </span>
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] mb-4">
          AGENTS.md
        </h1>
        <p className="text-lg text-[var(--fg-secondary)] leading-relaxed max-w-xl mb-8">
          A running log on agentic tools, workflows, and whatever comes next.
        </p>
        {posts.length > 0 && (
          <Link
            href={posts[0].path}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-[var(--border)] text-[var(--fg-secondary)] rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] active:scale-[0.98] transition-all no-underline"
          >
            Start Reading &rarr;
          </Link>
        )}
      </section>

      {/* About */}
      <section className="border-b border-[var(--border)] pb-12 mb-12">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--fg-muted)] mb-4 block">
          /About
        </span>
        <p className="text-[var(--fg-secondary)] leading-relaxed max-w-xl mb-4">
          I am going all-in on agentic coding. This is where I document what works, what breaks, and where the real productivity gains are.
        </p>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-xl">
          Covering Pi, Kimi, and whatever agent shows up next. Workflow integrations, prompt patterns, failure modes, skills, and honest opinions. Sharing learnings as I go.
        </p>
      </section>

      {/* Table of Contents */}
      <section>
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--fg-muted)] mb-6 block">
          /Table of Contents
        </span>
        <ul className="space-y-1">
          {posts.map((post, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <li key={post.slug}>
                <Link
                  href={post.path}
                  className="flex items-start gap-3 py-1.5 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors no-underline"
                >
                  <span className="font-mono text-xs text-[var(--fg-muted)] mt-0.5 w-5 shrink-0">
                    {num}
                  </span>
                  <span>{post.frontmatter.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
