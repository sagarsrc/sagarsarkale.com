import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { ParticleHero } from '@/components/ParticleBackground';
import { RotatingTitle } from '@/components/RotatingTitle';

const experience = [
  { company: 'quickcall.dev', impact: 'compounding intelligence for agentic teams', year: '2024', logo: '/logos/quickcall_48.png' },
  { company: 'smallstep.ai', impact: 'india\'s first competitive marathi llm', year: '2023', logo: '/logos/smallstep_48.png' },
  { company: 'Yral', impact: 'rag moderation, llm inference, rec systems', year: '2025', logo: '/logos/yral_48.png' },
  { company: 'People+AI', impact: 'india\'s first llm leaderboard framework', year: '2024', logo: '/logos/peopleai_48.png' },
  { company: 'Medpiper', impact: '10x medical document processing speedup', year: '2024', logo: '/logos/medpiper_48.png' },
  { company: 'Tekion', impact: 'document ai & service recommendation engine', year: '2022', logo: '/logos/tekion_48.png' },
  { company: 'Pratilipi', impact: '2x reads growth via collaborative filtering', year: '2020', logo: '/logos/pratilipi_48.png' },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="flex items-center gap-8 mb-20 min-h-[260px] max-md:flex-col-reverse max-md:gap-2 max-md:min-h-0 max-md:mb-14">
        <div className="flex-[1.4] min-w-0 z-[1]">
          <h1 className="text-[1.75rem] font-semibold tracking-tight mb-1.5 max-md:text-xl">
            sagar sarkale
          </h1>
          <p className="text-[13px] text-[var(--fg-secondary)] mb-6 max-md:text-xs">
            <RotatingTitle />
          </p>

          <div className="mb-10">
            <p className="font-serif text-[15px] text-[var(--fg-secondary)] leading-relaxed max-w-[52ch]">
              i ship ai products from zero to production — language models,
              retrieval pipelines, and the infra around them. trained india&apos;s
              first competitive marathi llm (beat gpt-3.5 on reading comprehension).
              now building developer tools at quickcall.dev.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-5">
            <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[13px] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-4 py-2 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors no-underline">
              book a call &rarr;
            </a>
            <div className="flex items-center gap-4 text-[13px] text-[var(--fg-secondary)]">
              <a href="mailto:sagar@quickcall.dev" className="hover:text-[var(--fg)] transition-colors no-underline">email</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">linkedin</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">twitter</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">github</a>
            </div>
          </div>
        </div>

        <div className="flex-none flex items-center justify-center w-[280px] max-md:hidden">
          <ParticleHero />
        </div>
      </section>

      {/* ── Selected Work ── */}
      <section className="mb-20 max-md:mb-14">
        <p className="section-label">Selected Work</p>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-sm font-semibold">quickcall.dev</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap tabular-nums">2024–present</span>
            </div>
            <p className="font-serif text-[15px] text-[var(--fg-secondary)] leading-relaxed mb-2.5">
              compounding intelligence for agentic engineering teams. captures
              what ships and loads what matters — across every agent, tool, and session.
            </p>
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">quickcall.dev</a>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-sm font-semibold">misal — marathi llm</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap tabular-nums">2023–present</span>
            </div>
            <p className="font-serif text-[15px] text-[var(--fg-secondary)] leading-relaxed mb-2.5">
              india&apos;s first competitive marathi llm. 7b &amp; 1b parameter models
              trained on 2b+ marathi tokens. outperformed gpt-3.5 on reading comprehension.
            </p>
            <div className="flex gap-5 text-[13px]">
              <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">huggingface</a>
              <Link href="/blog" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">blog</Link>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-sm font-semibold">mcp deep dive</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap tabular-nums">2025</span>
            </div>
            <p className="font-serif text-[15px] text-[var(--fg-secondary)] leading-relaxed mb-2.5">
              3-part technical deep dive into model context protocol — from
              primitives to elicitation.
            </p>
            <Link href="/blog/genai/what-is-mcp-part1" className="text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">start reading</Link>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="mb-20 max-md:mb-14">
        <p className="section-label">Experience</p>

        <div className="space-y-0">
          {experience.map((exp) => (
            <Link key={exp.company} href="/work" className="flex items-center gap-3 py-3 border-b border-[var(--border)]/40 hover:bg-[var(--surface)] transition-colors no-underline group">
              <img src={exp.logo} alt="" className="w-6 h-6 rounded object-contain opacity-80 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-[13px] text-[var(--fg)] group-hover:text-[var(--fg)]">{exp.company}</span>
                  <span className="text-xs text-[var(--fg-muted)] tabular-nums">{exp.year}</span>
                </div>
                <p className="text-xs text-[var(--fg-secondary)] truncate">{exp.impact}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/work" className="inline-block mt-5 text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          full details
        </Link>
      </section>

      {/* ── Writing ── */}
      <section className="mb-20 max-md:mb-14">
        <p className="section-label">Writing</p>

        <div className="space-y-3">
          {blogPosts.map((post: Post) => (
            <div key={post.path} className="flex justify-between items-baseline gap-6">
              <Link href={post.path} className="text-[13px] hover:text-[var(--accent)] transition-colors no-underline">
                {post.frontmatter.title}
              </Link>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0 tabular-nums">
                {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
              </span>
            </div>
          ))}
        </div>

        <Link href="/blog" className="inline-block mt-5 text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          all posts
        </Link>
      </section>
    </div>
  );
}
