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
      <section className="flex items-center gap-6 mb-24 min-h-[260px] max-md:flex-col-reverse max-md:gap-2 max-md:min-h-0 max-md:mb-16">
        <div className="flex-[1.4] min-w-0 z-[1]">
          <h1 className="text-3xl font-bold tracking-tight mb-1 max-md:text-2xl">
            sagar sarkale
          </h1>
          <p className="text-lg text-[var(--fg-secondary)] mb-5 max-md:text-base">
            <RotatingTitle />
          </p>

          <p className="font-serif text-base text-[var(--fg-secondary)] leading-relaxed mb-8 max-w-[52ch]">
            i ship ai products from zero to production — language models,
            retrieval pipelines, and the infra around them. trained india&apos;s
            first competitive marathi llm (beat gpt-3.5 on reading comprehension).
            now building developer tools at quickcall.dev.
          </p>

          <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium border border-[var(--fg)] text-[var(--fg)] px-4 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors no-underline mb-4">
            book a call &rarr;
          </a>

          <div className="flex items-center gap-4 text-sm text-[var(--fg-secondary)]">
            <a href="mailto:sagar@quickcall.dev" className="hover:text-[var(--fg)] transition-colors no-underline">email</a>
            <span className="text-[var(--fg-muted)]">/</span>
            <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">linkedin</a>
            <span className="text-[var(--fg-muted)]">/</span>
            <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">twitter</a>
            <span className="text-[var(--fg-muted)]">/</span>
            <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">github</a>
          </div>
        </div>

        <div className="flex-none w-[260px] h-[260px] relative overflow-visible max-md:hidden">
          <ParticleHero />
        </div>
      </section>

      {/* ── Selected Work ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--fg-muted)] mb-8">Selected Work</p>

        <div className="space-y-10">
          <div>
            <div className="flex justify-between items-baseline gap-4 mb-2">
              <h3 className="text-lg font-bold">quickcall.dev</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2024–present</span>
            </div>
            <p className="font-serif text-sm text-[var(--fg-secondary)] leading-relaxed mb-3">
              compounding intelligence for agentic engineering teams. captures
              what ships and loads what matters — across every agent, tool, and session.
            </p>
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">quickcall.dev</a>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-2">
              <h3 className="text-lg font-bold">misal — marathi llm</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2023–present</span>
            </div>
            <p className="font-serif text-sm text-[var(--fg-secondary)] leading-relaxed mb-3">
              india&apos;s first competitive marathi llm. 7b &amp; 1b parameter models
              trained on 2b+ marathi tokens. outperformed gpt-3.5 on reading comprehension.
            </p>
            <div className="flex gap-5 text-sm">
              <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">huggingface</a>
              <Link href="/blog" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">blog</Link>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-4 mb-2">
              <h3 className="text-lg font-bold">mcp deep dive</h3>
              <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap">2025</span>
            </div>
            <p className="font-serif text-sm text-[var(--fg-secondary)] leading-relaxed mb-3">
              3-part technical deep dive into model context protocol — from
              primitives to elicitation.
            </p>
            <Link href="/blog/genai/what-is-mcp-part1" className="text-sm text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">start reading</Link>
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--fg-muted)] mb-8">Experience</p>

        <table className="w-full text-sm border-collapse">
          <tbody>
            {experience.map((exp) => (
              <tr key={exp.company} className="border-b border-[var(--border)]/30">
                <td className="py-2.5 pr-3 w-8"><img src={exp.logo} alt="" className="w-7 h-7 rounded-md object-contain" /></td>
                <td className="py-2.5 font-semibold">{exp.company}</td>
                <td className="py-2.5 text-[var(--fg-secondary)] text-right max-sm:hidden">{exp.role}</td>
                <td className="py-2.5 text-[var(--fg-muted)] text-right tabular-nums pl-6 whitespace-nowrap">{exp.period}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Link href="/work" className="inline-block mt-8 text-sm text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          full details
        </Link>
      </section>

      {/* ── Writing ── */}
      <section className="mb-24 max-md:mb-16">
        <p className="text-xs uppercase tracking-[0.15em] text-[var(--fg-muted)] mb-8">Writing</p>

        <div className="space-y-4">
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

        <Link href="/blog" className="inline-block mt-8 text-sm text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
          all posts
        </Link>
      </section>
    </div>
  );
}
