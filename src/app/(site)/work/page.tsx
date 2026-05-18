import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Work — Sagar Sarkale",
};

function RoleLabel({ role, type }: { role: string; type: string }) {
  return (
    <span className="text-xs text-[var(--fg-muted)] font-normal uppercase tracking-wide">
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
    context: 'Covered by <a href="https://yourstory.com/2024/05/for-the-love-of-misal-smallstepai-is-building-an-llm-for-marathi" target="_blank" rel="noopener noreferrer">**YourStory**</a>, <a href="https://www.moneycontrol.com/news/technology/bootstrapped-ai-startup-smallstep-serves-up-misal-a-marathi-llm-12693311.html" target="_blank" rel="noopener noreferrer">**Moneycontrol**</a>, and <a href="https://www.youtube.com/watch?v=YHVFgb0RTVg" target="_blank" rel="noopener noreferrer">**ARB Podcast**</a>. Models on **Hugging Face** with open weights.',
    links: [
      { label: 'huggingface', href: 'https://huggingface.co/smallstepai' },
      { label: 'making misal — blog', href: '/blog/genai/making-misal' },
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
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-semibold leading-snug">work</h1>
        <Breadcrumbs />
      </div>
      <p className="text-[var(--fg-secondary)] text-sm mb-8">
        what i&apos;ve built, where, and why.
      </p>

      <div className="flex flex-col">
        {workEntries.map((entry, idx) => (
          <div key={entry.company} className={`grid grid-cols-[130px_1fr] max-sm:grid-cols-1 gap-8 max-sm:gap-2 py-6 border-t border-[var(--code-border)] ${idx === 0 ? 'border-t-0 pt-0' : ''}`}>
            <div className="sticky top-16 self-start max-sm:static">
              <time className="text-xs text-[var(--fg-muted)] tabular-nums">{entry.period}</time>
              {entry.logo && (
                <img
                  src={entry.logo}
                  alt=""
                  className="w-14 h-14 rounded-xl mt-2 object-contain bg-[var(--surface)]"
                  loading="lazy"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-[0.6rem] mb-2 flex-wrap">
                <h2 className="text-sm font-semibold m-0 leading-[1.3]">{entry.company}</h2>
                <span className="text-[var(--fg-muted)] mx-[0.15rem] text-sm">/</span>
                <RoleLabel role={entry.role} type={entry.type} />
              </div>

              <ul className="m-0 pl-0 list-none text-[0.8125rem] text-[var(--fg-secondary)] leading-[1.7] space-y-1">
                {entry.highlights.map((h, i) => (
                  <li key={i} className="ml-0 flex gap-2">
                    <span className="text-[var(--fg-muted)] shrink-0">—</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {entry.context && (
                <p
                  className="mt-2 text-xs text-[var(--fg-muted)] leading-[1.5] [&_strong]:text-[var(--fg-secondary)] [&_strong]:font-medium [&_a]:text-[var(--fg-muted)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[var(--border)] hover:[&_a]:decoration-[var(--fg-muted)] [&_a]:transition-colors"
                  dangerouslySetInnerHTML={{
                    __html: entry.context.replace(
                      /\*\*(.+?)\*\*/g,
                      '<strong>$1</strong>'
                    ),
                  }}
                />
              )}

              {entry.links && (
                <div className="mt-2 text-xs [&_a]:text-[var(--accent)] [&_a]:no-underline hover:[&_a]:underline">
                  {entry.links.map((link, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-[var(--fg-muted)] mx-[0.4rem]">&middot;</span>}
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
