import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { ParticleHero } from '@/components/ParticleBackground';
import { RotatingTitle } from '@/components/RotatingTitle';

const experience = [
  { company: 'quickcall.dev', role: 'Founder', period: '2024–now', logo: '/logos/quickcall_48.png' },
  { company: 'smallstep.ai', role: 'Founder', period: '2023–now', logo: '/logos/smallstep_48.png' },
  { company: 'Yral', role: 'AI Consultant', period: '2025', logo: '/logos/yral_48.png' },
  { company: 'People+AI', role: 'AI Consultant', period: '2024', logo: '/logos/peopleai_48.png' },
  { company: 'Medpiper', role: 'AI Consultant', period: '2024', logo: '/logos/medpiper_48.png' },
  { company: 'Tekion', role: 'Data Scientist', period: '2022–23', logo: '/logos/tekion_48.png' },
  { company: 'Pratilipi', role: 'Data Scientist', period: '2020–22', logo: '/logos/pratilipi_48.png' },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="flex items-center gap-6 mb-20 min-h-[260px] max-md:flex-col-reverse max-md:gap-2 max-md:min-h-0 max-md:mb-14">
        <div className="flex-[1.4] min-w-0 z-[1]">
          <h1 className="text-3xl font-bold tracking-tight mb-1 max-md:text-2xl">
            sagar sarkale
          </h1>
          <p className="text-lg text-[var(--fg-secondary)] mb-5 max-md:text-base">
            <RotatingTitle />
          </p>

          <p className="font-serif text-base text-[var(--fg-secondary)] leading-relaxed mb-6 max-w-[52ch]">
            i ship ai products from zero to production — language models,
            retrieval pipelines, and the infra around them. trained india&apos;s
            first competitive marathi llm (beat gpt-3.5 on reading comprehension).
            now building developer tools at quickcall.dev.
          </p>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium border border-[var(--fg)] text-[var(--fg)] px-4 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors no-underline">
              book a call &rarr;
            </a>
            <a href="mailto:sagar@quickcall.dev" className="inline-flex items-center text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors no-underline">
              sagar@quickcall.dev
            </a>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
            <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">linkedin</a>
            <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">twitter</a>
            <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">github</a>
          </div>
        </div>

        <div className="flex-none w-[260px] h-[260px] relative overflow-visible max-md:hidden">
          <ParticleHero />
        </div>
      </section>

      {/* ── Selected Work ── */}
      <section className="mb-20 max-md:mb-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-8">Selected Work</h2>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-base font-bold">quickcall.dev</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2024–present</span>
            </div>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-2">
              compounding intelligence for agentic engineering teams. captures
              what ships and loads what matters — across every agent, tool, and session.
            </p>
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] no-underline hover:underline font-medium">quickcall.dev &rarr;</a>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-base font-bold">misal — marathi llm</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2023–present</span>
            </div>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-2">
              india&apos;s first competitive marathi llm. 7b &amp; 1b parameter models
              trained on 2b+ marathi tokens. outperformed gpt-3.5 on reading comprehension.
            </p>
            <div className="flex gap-4 text-sm">
              <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] no-underline hover:underline font-medium">huggingface &rarr;</a>
              <Link href="/blog" className="text-[var(--accent)] no-underline hover:underline font-medium">blog &rarr;</Link>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h3 className="text-base font-bold">mcp deep dive</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2025</span>
            </div>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-2">
              3-part technical deep dive into model context protocol — from
              primitives to elicitation.
            </p>
            <Link href="/blog/genai/what-is-mcp-part1" className="text-sm text-[var(--accent)] no-underline hover:underline font-medium">start reading &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="mb-20 max-md:mb-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-8">Experience</h2>

        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-3 items-center max-sm:grid-cols-[auto_1fr] max-sm:gap-y-4">
          {experience.map((exp) => (
            <>
              <img key={`img-${exp.company}`} src={exp.logo} alt="" className="w-9 h-9 rounded-lg object-contain" />
              <div key={`info-${exp.company}`}>
                <span className="text-sm font-semibold block">{exp.company}</span>
                <span className="text-xs text-[var(--fg-secondary)]">{exp.role}</span>
              </div>
              <span key={`period-${exp.company}`} className="text-xs text-[var(--fg-muted)] max-sm:col-start-2 max-sm:-mt-2">{exp.period}</span>
            </>
          ))}
        </div>

        <Link href="/work" className="inline-block mt-6 text-sm text-[var(--accent)] font-medium no-underline hover:underline">
          full details &rarr;
        </Link>
      </section>

      {/* ── Writing ── */}
      <section className="mb-20 max-md:mb-14">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-8">Writing</h2>

        <div className="space-y-3">
          {blogPosts.map((post: Post) => (
            <div key={post.path} className="flex justify-between items-baseline gap-4">
              <Link href={post.path} className="text-[15px] font-medium hover:text-[var(--accent)] transition-colors no-underline">
                {post.frontmatter.title}
              </Link>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0">
                {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
              </span>
            </div>
          ))}
        </div>

        <Link href="/blog" className="inline-block mt-6 text-sm text-[var(--accent)] font-medium no-underline hover:underline">
          all posts &rarr;
        </Link>
      </section>
    </div>
  );
}
