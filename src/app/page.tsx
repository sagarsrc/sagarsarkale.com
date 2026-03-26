import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { ParticleHero } from '@/components/ParticleBackground';
import { RotatingTitle } from '@/components/RotatingTitle';

const logos = [
  { name: 'quickcall.dev', src: '/logos/quickcall_48.png' },
  { name: 'smallstep.ai', src: '/logos/smallstep_48.png' },
  { name: 'Yral', src: '/logos/yral_48.png' },
  { name: 'People+AI', src: '/logos/peopleai_48.png' },
  { name: 'Medpiper', src: '/logos/medpiper_48.png' },
  { name: 'Tekion', src: '/logos/tekion_48.png' },
  { name: 'Pratilipi', src: '/logos/pratilipi_48.png' },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>
      {/* Hero / Intro */}
      <section className="flex items-center gap-4 mb-12 min-h-[240px] max-md:flex-col-reverse max-md:gap-1 max-md:min-h-0 max-md:mb-8">
        <div className="flex-[1.4] min-w-0 z-[1]">
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">
            sagar sarkale
          </h1>

          <p className="text-sm font-medium text-[var(--fg-secondary)] mb-3"><RotatingTitle /></p>

          <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="book-call-link mb-4 inline-block">
            book a call &rarr;
          </a>

          <p className="mb-4 font-serif text-sm text-[var(--fg-secondary)] leading-relaxed">
            i ship ai products from zero to production &mdash; language models,
            retrieval pipelines, and the infra around them. trained india&apos;s
            first competitive marathi llm (beat gpt-3.5 on reading comprehension).
            now building developer tools at quickcall.dev. i consult for
            startups and orgs on applied nlp, llm fine-tuning, and ai strategy.
          </p>

          <div className="social-grid">
            <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer">linkedin</a>
            <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer">twitter</a>
            <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer">github</a>
            <a href="mailto:sagar@quickcall.dev">email</a>
          </div>
        </div>
        <div className="flex-none w-[240px] h-[240px] relative overflow-visible max-md:hidden">
          <ParticleHero />
        </div>
      </section>

      <hr className="border-t border-[var(--border)] my-8 max-md:my-5" />

      {/* Work */}
      <section>
        <div className="section-label">work</div>

        <div className="mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="font-semibold text-sm">quickcall.dev</span>
            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">founder &middot; 2024–present</span>
          </div>
          <p className="text-[13px] text-[var(--fg-secondary)] leading-normal mt-1 pl-4">
            compounding intelligence for agentic engineering teams. captures
            what ships and loads what matters &mdash; across every agent, tool, and session.
          </p>
          <div className="text-[13px] mt-[0.35rem] pl-4">
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] no-underline hover:underline">quickcall.dev</a>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="font-semibold text-sm">misal — marathi llm</span>
            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">founder &middot; 2023–present</span>
          </div>
          <p className="text-[13px] text-[var(--fg-secondary)] leading-normal mt-1 pl-4">
            india&apos;s first competitive marathi llm. 7b &amp; 1b parameter models
            trained on 2b+ marathi tokens. outperformed gpt-3.5 on reading
            comprehension benchmarks.
          </p>
          <div className="text-[13px] mt-[0.35rem] pl-4">
            <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] no-underline hover:underline">huggingface</a>
            <span className="text-[var(--fg-muted)] mx-[0.4rem]">&middot;</span>
            <Link href="/blog" className="text-[var(--accent)] no-underline hover:underline">blog</Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-baseline gap-4">
            <span className="font-semibold text-sm">mcp deep dive</span>
            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">blog series &middot; 2025</span>
          </div>
          <p className="text-[13px] text-[var(--fg-secondary)] leading-normal mt-1 pl-4">
            3-part technical deep dive into model context protocol — from
            primitives to elicitation.
          </p>
          <div className="text-[13px] mt-[0.35rem] pl-4">
            <Link href="/blog/genai/what-is-mcp-part1" className="text-[var(--accent)] no-underline hover:underline">start reading</Link>
          </div>
        </div>
      </section>

      <hr className="border-t border-[var(--border)] my-8 max-md:my-5" />

      {/* Writing */}
      <section>
        <div className="section-label">writing</div>

        {blogPosts.map((post: Post) => (
          <div key={post.path} className="flex justify-between items-baseline py-[0.35rem] gap-4">
            <span className="text-sm">
              <Link href={post.path}>{post.frontmatter.title}</Link>
            </span>
            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0">
              {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
            </span>
          </div>
        ))}

        <Link href="/blog" className="arrow-link">all posts</Link>
      </section>

      <hr className="border-t border-[var(--border)] my-8 max-md:my-5" />

      {/* Experience */}
      <section>
        <div className="section-label">experience</div>

        <div className="flex flex-wrap items-start gap-4 py-3">
          {logos.map((logo, i) => (
            <div key={i} className="flex flex-col items-center gap-1 w-14 max-sm:w-12">
              <div className="flex items-center justify-center w-14 h-14 max-sm:w-12 max-sm:h-12 rounded-xl border border-[var(--code-border)] bg-[var(--surface)] p-2">
                <img src={logo.src} alt={logo.name} title={logo.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] text-[var(--fg-muted)] leading-tight text-center truncate w-full">{logo.name}</span>
            </div>
          ))}
        </div>

        <Link href="/work" className="arrow-link">full details</Link>
      </section>

      <hr className="border-t border-[var(--border)] my-8 max-md:my-5" />

      {/* Connect */}
      <section>
        <div className="section-label">connect</div>
        <p className="text-[var(--fg-secondary)] mb-3 leading-relaxed">
          i consult for startups and orgs on ai applications and ai strategy.
        </p>
        <div className="flex gap-6 flex-wrap items-center">
          <a href="mailto:sagar@quickcall.dev" className="arrow-link">sagar@quickcall.dev</a>
        </div>
      </section>
    </div>
  );
}
