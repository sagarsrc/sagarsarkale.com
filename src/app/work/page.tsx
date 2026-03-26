import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Work — Sagar Sarkale",
};

function RoleLabel({ role, type }: { role: string; type: string }) {
  return (
    <span className="work-role-label">
      {role}
    </span>
  );
}

interface WorkEntry {
  company: string;
  role: string;
  type: 'founder' | 'consultant' | 'employee';
  period: string;
  logo?: string;
  url?: string;
  highlights: string[];
  context?: string;
  links?: { label: string; href: string }[];
}

const workEntries: WorkEntry[] = [
  {
    company: 'quickcall.dev',
    role: 'Founder',
    type: 'founder',
    period: 'Dec 2025 – Present',
    logo: 'https://quickcall.dev/favicon-96x96.png',
    url: 'https://quickcall.dev',
    highlights: [
      'Compounding intelligence for agentic engineering teams',
      'Contextual memory across every agent, tool, and session',
      'Universal capture — Claude Code, Cursor, Codex, Gemini CLI',
      'Antipattern detection, per-dev reports, auto rules generation',
    ],
    links: [
      { label: 'quickcall.dev', href: 'https://quickcall.dev' },
      { label: 'changelog', href: 'https://quickcall.dev/changelog' },
    ],
  },
  {
    company: 'Yral',
    role: 'AI Consultant',
    type: 'consultant',
    period: 'Jan 2025 – Nov 2025',
    logo: 'https://media.licdn.com/dms/image/v2/D4D0BAQGaPIad-eFGDQ/company-logo_200_200/company-logo_200_200/0/1709024239252/yral_app_logo?e=2147483647&v=beta&t=g2EBsipTII2NUhSRAN81G32GvyLOs5_D010l49R3atc',
    highlights: [
      'RAG content moderation — Phi-3.5 4B, 86.8% accuracy (+26%)',
      'LLM inference optimization — 70% KV cache hit rate, 150 tok/sec',
      'Real-time recommendation system — online learning, million-scale',
      'Candidate generation pipeline — Airflow, BigQuery, Redis',
      'MuseTalk video generation — image-to-video, video-to-video',
    ],
  },
  {
    company: 'People+AI',
    role: 'AI Consultant',
    type: 'consultant',
    period: 'Nov 2024 – Dec 2024',
    logo: 'https://pbs.twimg.com/profile_images/1705160569756479489/2b-7UAQ8_400x400.jpg',
    highlights: [
      'Evaluated 15+ Indic LLM benchmarks across 22 languages',
      'Designed India\'s first standardized LLM leaderboard framework',
      'Authored 10 trillion token collection roadmap for Indian languages',
    ],
    links: [
      { label: 'blog post', href: 'https://peopleplus.ai/blog/ten-trillion-tokens-making-ai-work-for-every-indian-language' },
    ],
  },
  {
    company: 'smallstep.ai',
    role: 'Founder',
    type: 'founder',
    period: 'Dec 2023 – Present',
    logo: 'https://framerusercontent.com/images/cm62IqDlxSYtaLaLmTfJGnJz0C4.png',
    highlights: [
      'Misal — India\'s first competitive Marathi LLM, 7B/1B params',
      'Custom tokenizer — 15K tokens, fixed 3-5x Llama inefficiency',
      'Beat GPT-3.5 on reading comprehension',
      'Open-sourced models, tokenizer, configs, eval framework',
    ],
    context: 'Covered by **YourStory**, **Moneycontrol**, and **ARB Podcast**. Models on **Hugging Face** with open weights.',
    links: [
      { label: 'huggingface', href: 'https://huggingface.co/smallstepai' },
      { label: 'blog', href: '/blog' },
    ],
  },
  {
    company: 'Medpiper',
    role: 'AI Consultant',
    type: 'consultant',
    period: 'Jan 2024 – Jun 2024',
    logo: 'https://media.licdn.com/dms/image/v2/C560BAQHmTHY953vBpg/company-logo_200_200/company-logo_200_200/0/1630655040749/medpiper_logo?e=2147483647&v=beta&t=9L60d9u1Uu154a9qALEEbBEZ6PAunUqHNBguq_7O1eQ',
    highlights: [
      'Medical document digitization platform',
      'Auto-annotation system for labelling + training',
      '10x processing speedup (10 min → 1 min)',
    ],
  },
  {
    company: 'Tekion',
    role: 'Data Scientist',
    type: 'employee',
    period: 'Aug 2022 – Jul 2023',
    logo: 'https://logowik.com/content/uploads/images/tekion662.logowik.com.webp',
    highlights: [
      'Document AI — Mask-RCNN table extraction',
      'Service recommendation engine — per-vehicle, seasonal patterns',
    ],
  },
  {
    company: 'Pratilipi',
    role: 'Data Scientist',
    type: 'employee',
    period: 'Dec 2020 – Aug 2022',
    logo: 'https://cdn6.aptoide.com/imgs/c/3/9/c398854c8d038e8871111a74ff0ccda5_icon.png',
    highlights: [
      'Autoencoder collaborative filtering — user-item embeddings',
      'Content hooks — 2x reads growth post-completion',
      'Author follow recs — 20% increase from profile page',
      'Category personalization — top line + monetization impact',
    ],
  },
];

export default function WorkPage() {
  return (
    <div>
      <Breadcrumbs />
      <h1 className="single-title">work</h1>
      <p style={{ color: 'var(--fg-secondary)', fontSize: '14px', marginBottom: '2rem' }}>
        what i&apos;ve built, where, and why.
      </p>

      <div className="changelog">
        {workEntries.map((entry) => (
          <div key={entry.company} className="changelog-entry">
            <div className="changelog-date-col">
              <time className="changelog-date">{entry.period}</time>
              {entry.logo && (
                <img
                  src={entry.logo}
                  alt=""
                  style={{ width: 28, height: 28, borderRadius: 6, marginTop: '0.5rem', objectFit: 'contain' }}
                  loading="lazy"
                />
              )}
            </div>

            <div className="changelog-content-col">
              <div className="changelog-title-row">
                <h2 className="changelog-title">{entry.company}</h2>
                <span className="work-role-sep">/</span>
                <RoleLabel role={entry.role} type={entry.type} />
              </div>

              <ul className="work-highlights">
                {entry.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>

              {entry.context && (
                <p
                  className="changelog-context"
                  dangerouslySetInnerHTML={{
                    __html: entry.context.replace(
                      /\*\*(.+?)\*\*/g,
                      '<strong>$1</strong>'
                    ),
                  }}
                />
              )}

              {entry.links && (
                <div className="work-links">
                  {entry.links.map((link, i) => (
                    <span key={i}>
                      {i > 0 && <span style={{ color: 'var(--fg-muted)', margin: '0 0.4rem' }}>&middot;</span>}
                      {link.href.startsWith('/') ? (
                        <Link href={link.href}>{link.label}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
