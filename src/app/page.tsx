import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { ParticleHero } from '@/components/ParticleBackground';

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
          <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '1rem' }} className="cursor">
            sagar sarkale
          </p>

          <p className="dim-label">[role]</p>
          <p style={{ marginBottom: '1rem' }}>ai/nlp engineer. founder.</p>

          <p className="dim-label">[bio]</p>
          <p style={{ marginBottom: '1rem', color: 'var(--fg-secondary)', lineHeight: 1.6 }}>
            i build language models, retrieval systems, and ai products.
            currently building quickcall.dev — an ai assistant for developer
            productivity. previously built misal, india&apos;s first competitive
            marathi llm at smallstep.ai.
          </p>

          <p className="dim-label">[links]</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer">linkedin</a>
            <span className="sep">&middot;</span>
            <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer">twitter</a>
            <span className="sep">&middot;</span>
            <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer">github</a>
            <span className="sep">&middot;</span>
            <a href="mailto:sagar@smallstep.ai">email</a>
          </div>
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
            ai assistant that connects your org tools without switching context.
            built for developers who live in terminals, docs, and code.
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
            india&apos;s first competitive marathi llm. 7b/1b models trained on
            2b marathi tokens. beat chatgpt 3.5 on reading comprehension.
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

        <div className="exp-row">
          <span className="exp-company">quickcall.dev</span>
          <span className="exp-role">founder</span>
          <span className="exp-date">2024–present</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">smallstep ai</span>
          <span className="exp-role">founder</span>
          <span className="exp-date">2023–present</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">yral</span>
          <span className="exp-role">ai consultant</span>
          <span className="exp-date">2025</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">people+ai</span>
          <span className="exp-role">ai consultant</span>
          <span className="exp-date">2024</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">medpiper</span>
          <span className="exp-role">ai consultant</span>
          <span className="exp-date">2024</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">tekion</span>
          <span className="exp-role">data scientist</span>
          <span className="exp-date">2022–2023</span>
        </div>
        <div className="exp-row">
          <span className="exp-company">pratilipi</span>
          <span className="exp-role">data scientist</span>
          <span className="exp-date">2020–2022</span>
        </div>

        <Link href="/work" className="arrow-link">full details</Link>
      </section>

      <div className="divider">────────────────────────────────────────────────</div>

      {/* Connect */}
      <section>
        <div className="section-label">connect</div>
        <p style={{ color: 'var(--fg-secondary)', marginBottom: '0.5rem' }}>
          interested in llms, multilingual ai, or dev tooling?
        </p>
        <a href="mailto:sagar@smallstep.ai" className="arrow-link">sagar@smallstep.ai</a>
      </section>
    </div>
  );
}
