import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { ParticleHero } from '@/components/ParticleBackground';
import { RotatingTitle } from '@/components/RotatingTitle';

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>
      {/* Hero / Intro */}
      <section className="hero-split">
        <div className="hero-split-text">
          <p className="dim-label">[name]</p>
          <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '1rem' }}>
            sagar sarkale
          </p>

          <p className="dim-label">[role]</p>
          <p style={{ marginBottom: '1rem' }}><RotatingTitle /></p>

          <p className="dim-label">[bio]</p>
          <p style={{ marginBottom: '1.5rem', color: 'var(--fg-secondary)', lineHeight: 1.75 }}>
            i ship ai products from zero to production &mdash; language models,
            retrieval pipelines, and the infra around them. trained india&apos;s
            first competitive marathi llm (beat gpt-3.5 on reading comprehension).
            now building developer tools at quickcall.dev. i consult for
            startups and orgs on applied nlp, llm fine-tuning, and ai strategy.
          </p>

          <p className="dim-label">[links]</p>
          <div className="social-grid">
            <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer">linkedin</a>
            <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer">twitter</a>
            <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer">github</a>
            <a href="mailto:sagar@quickcall.dev">email</a>
          </div>
          <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="book-call-link">
            book a call &rarr;
          </a>
        </div>
        <div className="hero-split-visual">
          <ParticleHero />
        </div>
      </section>

      <div className="divider">────────────────────────────────────────────────</div>

      {/* Work */}
      <section>
        <div className="section-label">work</div>

        <div className="entry">
          <div className="entry-header">
            <span className="entry-title">quickcall.dev</span>
            <span className="entry-meta">founder &middot; 2024–present</span>
          </div>
          <p className="entry-desc">
            compounding intelligence for agentic engineering teams. captures
            what ships and loads what matters &mdash; across every agent, tool, and session.
          </p>
          <div className="entry-links">
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer">quickcall.dev</a>
          </div>
        </div>

        <div className="entry">
          <div className="entry-header">
            <span className="entry-title">misal — marathi llm</span>
            <span className="entry-meta">founder &middot; 2023–present</span>
          </div>
          <p className="entry-desc">
            india&apos;s first competitive marathi llm. 7b &amp; 1b parameter models
            trained on 2b+ marathi tokens. outperformed gpt-3.5 on reading
            comprehension benchmarks.
          </p>
          <div className="entry-links">
            <a href="https://huggingface.co/smallstepai" target="_blank" rel="noopener noreferrer">huggingface</a>
            <span style={{ color: 'var(--fg-muted)', margin: '0 0.4rem' }}>&middot;</span>
            <Link href="/blog">blog</Link>
          </div>
        </div>

        <div className="entry">
          <div className="entry-header">
            <span className="entry-title">mcp deep dive</span>
            <span className="entry-meta">blog series &middot; 2025</span>
          </div>
          <p className="entry-desc">
            3-part technical deep dive into model context protocol — from
            primitives to elicitation.
          </p>
          <div className="entry-links">
            <Link href="/blog/genai/what-is-mcp-part1">start reading</Link>
          </div>
        </div>
      </section>

      <div className="divider">────────────────────────────────────────────────</div>

      {/* Writing */}
      <section>
        <div className="section-label">writing</div>

        {blogPosts.map((post: Post) => (
          <div key={post.path} className="post-item">
            <span className="post-item-title">
              <Link href={post.path}>{post.frontmatter.title}</Link>
            </span>
            <span className="post-item-date">
              {post.frontmatter.date ? formatDate(post.frontmatter.date) : ''}
            </span>
          </div>
        ))}

        <Link href="/blog" className="arrow-link">all posts</Link>
      </section>

      <div className="divider">────────────────────────────────────────────────</div>

      {/* Experience */}
      <section>
        <div className="section-label">experience</div>

        <div className="logo-row">
          <img src="/logos/quickcall_48.png" alt="quickcall.dev" title="quickcall.dev" />
          <img src="/logos/smallstep_48.png" alt="smallstep.ai" title="smallstep.ai" />
          <img src="/logos/yral_48.png" alt="Yral" title="Yral" />
          <img src="/logos/peopleai_48.png" alt="People+AI" title="People+AI" />
          <img src="/logos/medpiper_48.png" alt="Medpiper" title="Medpiper" />
          <img src="/logos/tekion_48.png" alt="Tekion" title="Tekion" />
          <img src="/logos/pratilipi_48.png" alt="Pratilipi" title="Pratilipi" />
        </div>

        <Link href="/work" className="arrow-link">full details</Link>
      </section>

      <div className="divider">────────────────────────────────────────────────</div>

      {/* Connect */}
      <section>
        <div className="section-label">connect</div>
        <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
          i consult for startups and orgs on ai applications and ai strategy.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="mailto:sagar@quickcall.dev" className="arrow-link">sagar@quickcall.dev</a>
          <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="arrow-link">book a call</a>
        </div>
      </section>
    </div>
  );
}
