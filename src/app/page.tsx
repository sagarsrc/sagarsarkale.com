import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { RotatingTitle } from '@/components/RotatingTitle';

const stats = [
  { value: '7B', label: 'param LLM' },
  { value: '2B+', label: 'tokens trained' },
  { value: '>GPT-3.5', label: 'on comprehension' },
];

const experience = [
  { company: 'quickcall.dev', impact: 'compounding intelligence for agentic engineering teams', year: '2024', logo: '/logos/quickcall_48.png' },
  { company: 'smallstep.ai', impact: 'india\'s first competitive marathi llm — 7B & 1B models', year: '2023', logo: '/logos/smallstep_48.png' },
  { company: 'Yral', impact: 'rag moderation +26% accuracy, 150 tok/sec inference', year: '2025', logo: '/logos/yral_48.png' },
  { company: 'People+AI', impact: 'designed india\'s first standardized llm leaderboard', year: '2024', logo: '/logos/peopleai_48.png' },
  { company: 'Medpiper', impact: '10x medical document processing (10 min → 1 min)', year: '2024', logo: '/logos/medpiper_48.png' },
  { company: 'Tekion', impact: 'document ai — mask-rcnn table extraction at scale', year: '2022', logo: '/logos/tekion_48.png' },
  { company: 'Pratilipi', impact: '2x reads growth, 20% follow increase from recs', year: '2020', logo: '/logos/pratilipi_48.png' },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="mb-24 max-md:mb-16">
        <h1 className="text-4xl font-semibold tracking-tight mb-3 max-md:text-3xl">
          sagar sarkale
        </h1>
        <p className="text-base text-[var(--fg-secondary)] mb-4">
          <RotatingTitle />
        </p>
        <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.7] mb-12 max-w-[52ch] max-md:text-base">
          i build ai products from zero to production — language models,
          retrieval systems, and the infra that makes them work.
          available for contracts and consulting.
          currently shipping <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--fg)] no-underline border-b border-[var(--border)] hover:border-[var(--fg)] transition-colors">quickcall.dev</a>.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-5 py-4">
              <div className="text-2xl font-semibold text-[var(--fg)] tracking-tight max-md:text-xl">{s.value}</div>
              <div className="text-xs text-[var(--fg-muted)] mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center flex-wrap gap-5">
          <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[13px] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-5 py-2.5 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors no-underline">
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
      </section>

      {/* ── Selected Work ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="section-label">Selected Work</p>

        <div className="space-y-10">
          <div>
            <h3 className="text-lg font-semibold mb-1.5 max-md:text-base">quickcall.dev</h3>
            <p className="text-sm text-[var(--fg-secondary)] leading-[1.7] mb-3 max-w-[56ch]">
              contextual memory for agentic engineering teams. captures what ships
              and loads what matters — across every agent, tool, and session.
            </p>
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">quickcall.dev</a>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1.5 max-md:text-base">misal — marathi llm</h3>
            <p className="text-sm text-[var(--fg-secondary)] leading-[1.7] mb-3 max-w-[56ch]">
              india&apos;s first competitive marathi llm. 7B &amp; 1B parameter models
              on 2B+ tokens. outperformed gpt-3.5 on reading comprehension.
              covered by YourStory and Moneycontrol.
            </p>
            <div className="flex gap-5 text-[13px]">
              <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">huggingface</a>
              <Link href="/blog" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">blog</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-1.5 max-md:text-base">mcp deep dive</h3>
            <p className="text-sm text-[var(--fg-secondary)] leading-[1.7] mb-3 max-w-[56ch]">
              3-part technical series on model context protocol — from
              primitives to elicitation. one of the most read mcp breakdowns.
            </p>
            <Link href="/blog/genai/what-is-mcp-part1" className="text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">start reading</Link>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="section-label">Experience</p>

        <div className="space-y-0">
          {experience.map((exp) => (
            <Link key={exp.company} href="/work" className="flex items-center gap-4 py-3.5 border-b border-[var(--border)]/40 hover:bg-[var(--surface)] transition-colors no-underline group">
              <img src={exp.logo} alt="" className="w-8 h-8 rounded-lg object-contain opacity-80 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm text-[var(--fg)]">{exp.company}</span>
                  <span className="text-xs text-[var(--fg-muted)] tabular-nums">{exp.year}</span>
                </div>
                <p className="text-xs text-[var(--fg-secondary)] truncate mt-0.5">{exp.impact}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/work" className="inline-block mt-6 text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          full details
        </Link>
      </section>

      {/* ── Writing ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="section-label">Writing</p>

        <div className="space-y-3.5">
          {blogPosts.map((post: Post) => (
            <div key={post.path} className="flex justify-between items-baseline gap-6">
              <Link href={post.path} className="text-sm hover:text-[var(--accent)] transition-colors no-underline">
                {post.frontmatter.title}
              </Link>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0 tabular-nums">
                {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
              </span>
            </div>
          ))}
        </div>

        <Link href="/blog" className="inline-block mt-6 text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          all posts
        </Link>
      </section>
    </div>
  );
}
