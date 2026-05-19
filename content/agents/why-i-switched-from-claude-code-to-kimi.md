---
title: "Why Kimi with Pi Harness"
date: "2026-05-18"
summary: "From Claude Code dependency to Kimi K2.6 + Pi harness. What broke, what I switched to, and why it was worth it."
description: "Personal account of leaving Claude Code after regressions, switching to Kimi K2.6 via Pi coding agent harness, and the cost + control wins."
toc: true
readTime: true
tags: ["Agents", "Kimi", "Pi", "Claude Code"]
cover: "https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/why-i-switched-from-claude-code-to-kimi/000-cover.png"
---

This probably feels like my decision to switch from Windows to Linux in my first year of college and never going back to Windows, but a grown-up version of it.

I hated Windows for everything, legit everything, i dont play games so i cared about windows even less. I could not compile my C programs without installing some bloated version of GCC. Sucks to be in such a position when you are learning the hello worlds of it all.

Moving from Claude to Kimi was that kind of decision for me, but the reasons were bottled up until one day i flipped.

---

# The Breaking Point

I experienced regressions in Claude Code firsthand. Severe ones. I was screaming through my keyboard to make it work. It did not.

Back then it was just not me. Stella Laurenzo, Senior Director of AI at AMD, filed GitHub issue #42796 [1] after analyzing **6,852 Claude Code sessions**, **234,760 tool calls**, and **17,871 thinking blocks** across her engineering team. Her findings:

| Metric | Before Mar 8 | After Mar 8 | Change |
|--------|--------------|-------------|--------|
| Reads per edit | 6.6 | 2.0 | **-70%** |
| Edits without prior read | 6.2% | 33.7% | **+443%** |
| Full-file rewrites | 4.9% | 11.1% | **+127%** |
| User interrupts / 1K tool calls | 0.9 | 11.4 | **+1,167%** |
| Monthly AWS Bedrock cost | \$345 | \$42,121 | **+122x** |

Her conclusion: *"Claude cannot be trusted to perform complex engineering tasks."* AMD switched providers. The issue hit 2,077 reactions and was covered by The Register [2].

What was once achievable using low thinking effort Claude Opus 4.6 was no longer possible. I had to default to medium effort and at times high to achieve the results that i once did. Even then regressions did not stop. At a certain point Claude went into loops and kept thinking for very long durations without producing any results at all.

I have been into code agent session tracing business for quite some time now. I was analyzing my messages back then, and something was severely off. Similar difficulty tasks, like adding a new method to existing backend apis, updating associated schemas, and testing the system. Pretty basic stuff. Took more turns than 2 months back.

I could also notice context getting filled quickly. Limits were filling faster than before. I ended up using "baited" Credits from Claude more frequently. There was no way out. I had to use them to get my work done.

The turning point came while i was about to present my fleet of agents to [Fastcode.ai](https://www.fastcode.ai/). I had heavily tested everything on Claude Code Opus 4.6 for a week or two. Had to present it the next day. Surprise surprise - Claude Code had defaulted to Opus 4.7. I had no clue if i would be able to pull off all the prompts, workflows, plans. Everything was left to chance on the day of presentation. April 17, 2026.

I was trapped. Claude had become a dependency I couldn't shake, not a tool, a crutch. That had to change. The very next day i started researching viable options for replacing Claude Code, using Claude Code itself and the fleet of research agents i had spun up.

Last 8 days of my Claude code. Cut to April 26, 2026. I pulled the plug.

Immense sense of helplessness passed my mind. How do i even operate now? How do i even trust another model? Will that model be able to pull off what regressed Claude Code pulled off?

Now after ~3 weeks later i can confidently say my decision was worth it.

To give you a hint: i have been whipping Kimi to do more, trying to squeeze as much as possible, and my API bill is a fraction of what Claude used to burn. Kimi is BYOK. You bring your own API key, pay per token, no subscriptions, no "baited credits," no weekly limits.

---

# The "Claude-Lash": I Wasn't Alone

By early 2026, a full-blown user revolt was playing out across Reddit, GitHub, Hacker News, Twitter, and LinkedIn. Developers who had evangelized Claude Code were publicly canceling subscriptions and documenting regressions with screenshots, session logs, and side-by-side diffs.

Opus 4.7 shipped April 16, 2026 [3]. Within 48 hours, a Reddit post titled *"Claude Opus 4.7 is a serious regression, not an upgrade"* hit **2,300+ upvotes** [4]. The pattern was identical to 4.6: strong launch, silent degradation within days.

Specific failures piled up in public. A simple `git status` that used to take 30 seconds now took 7 minutes. Token burn roughly doubled for the same tasks. `CLAUDE.md` rules I'd spent hours tuning? Silently ignored. The model would freeze mid-session, sitting there thinking about nothing until I typed "are you still there?" Routine dev files, Dockerfiles and shell scripts, got flagged as suspicious and killed the task. I watched it loop on a `requirements.txt` for 12 minutes before I gave up and restarted.

Boris Cherny [5], head of Claude Code at Anthropic, publicly admitted *he needed a few days to learn to work with 4.7* [6]. As one user noted: *"If the product's lead engineer needs days to adapt, the problem is in the product."*

Reddit consensus crystallized around a term: **AI Shrinkflation** [7]. Users on \$200/month Max plans were hitting 5-hour and weekly limits for the first time, while getting *worse* output. One developer's self-audit found their model scored its own output **4-5/10** while still shipping it. Another described the experience as *"managing an intern who skims the ticket, does the minimum, says 'done', and waits for you to find what's broken."*

Manu Nayyar wrote on Medium [8]: *"I planned to test Kimi K2.6 for a week, write a neutral comparison, and keep my Claude subscription. On day four I canceled Claude."* Kimi K2.6 hit **#1 on OpenRouter by usage volume** [9] within its first week, with **1.88 trillion tokens served**.

Developers weren't switching for fun. They were voting with their wallets after their production workflows broke.

{{<tweet id="2054734057368621176">}}

This is current state of Claude code: Sad.

---

# Why Pi? Because It's Linux, Not Windows

I didn't just need a new model. I needed a new harness. One that wouldn't trap me again.

Claude Code is Windows. It comes pre-installed with everything, holds your hand, and decides what you can and cannot do. Pi is Linux. You get a minimal base: four built-in tools, under 1,000 token system prompt. You extend it to your will. Period.

Pi is Mario Zechner's terminal coding agent [10]. It doesn't manage context for you. It gives you the levers: `AGENTS.md` for project instructions, `SYSTEM.md` to replace the system prompt, tree-structured sessions you can branch and navigate, and 15+ providers you can swap between mid-session with `/model`.

When i first tried it, i wrote this in my journal at 3 AM:

> "Claude Code is nothing as compared to this. There is so much flexibility and liberty to tweak things. I am just scratching the surface. I have been at it since last 4 hours straight f**king hooked to the entire thing."

Claude Code is a polished product. Pi is a platform you adapt to your workflow.

---

# What Claude Code Is Missing

| | Claude Code | Pi |
|---|---|---|
| **Source code** | Closed | Open source |
| **Extensions** | None | npm packages, custom tools |
| **Context control** | Hidden, automatic | `AGENTS.md`, `SYSTEM.md`, manual |
| **Session structure** | Linear checkpoints | Tree-structured, branchable |
| **Model choice** | Anthropic only | 15+ providers, swap mid-session |
| **Tool control** | Blocklist (deny specific) | Allowlist (grant specific) |
| **Headless mode** | Limited | Full JSON streaming |
| **Cost model** | Subscription + credits | BYOK, pay per token |

---

# Cost Reality: The Numbers Don't Lie

| | Claude Code | Pi + Kimi K2.6 |
|---|---|---|
| **Subscription** | \$20/mo Pro, \$100 Max 5x, \$200 Max 20x [11] | No subscription (BYOK) |
| **API input** | \$5/1M tokens (Opus 4.7) [12] | \$0.95/1M tokens [13] |
| **API output** | \$25/1M tokens (Opus 4.7) [12] | \$4.00/1M tokens [13] |
| **Same workload** | Often hits 5hr limit | **~5-6x cheaper** |
| **My fleet (18 workers)** | Would cost \$20-40 | **\$0.78** |

I ran a full 18-worker fleet on Kimi K2.6. Total cost: **\$0.78**. Eighteen parallel workers, all running, fetching content, executing tasks. For less than a dollar.

---

# Intelligence: The Model Matters

| | Claude Opus 4.7 | Kimi K2.6 |
|---|---|---|
| **Architecture** | Dense | 1T MoE (32B active) |
| **Context window** | 1M | 262K |
| **Coding (SWE-Bench Pro [14])** | **64.3%** | 58.6% |
| **Thinking speed** | Sluggish | Insanely fast |
| **Procedural tasks** | Good | Excellent (risk-aware) |
| **Blended cost per 1M tokens** | ~\$10.00 [15] | **~\$1.71** [15] |

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/why-i-switched-from-claude-code-to-kimi/benchlm-swe-pro-v2.png" caption="SWE-Bench Pro rankings — Claude Opus 4.7 at #2, Kimi K2.6 tied at #4" >}}

Opus 4.7 wins on raw benchmark scores, but the gap is narrow, and you pay 6x for it. Where K2.6 wins is **speed**: Claude Opus feels sluggish by comparison. The tradeoff is context burns fast, but Pi's minimal prompt overhead offsets this.

For my actual work, infrastructure ops, bash scripting, fleet orchestration, K2.6 matches or exceeds what I got from Claude at a fraction of the cost.

The numbers don't capture the feeling. I haven't waited more than 30 seconds for Kimi to respond in three weeks. With Claude, I used to check my phone while it thought.

---

*This is the first part in a series of my experiments with Pi-Kimi. Here's what's coming:*

- **Setting up Kimi:** Why I chose some tools over others, my Kimi Code CLI setup, and the extensions I actually use daily
- **Porting from Claude Code to Pi Skills:** How I moved my fleet of autonomous research agents to Pi, what broke, and what worked
- **My experiments with Kimi:** Real workflows, real failures, and the quirks nobody tells you about
- **And more:** Cost tracking, context management, and building a setup that doesn't trap you

---

# References

1. [GitHub issue #42796 — AMD analysis of Claude Code regressions](https://github.com/anthropics/claude-code/issues/42796)
2. [The Register — "Claude Code has become dumber, lazier"](https://www.theregister.com/software/2026/04/06/claude-code-has-become-dumber-lazier-amd-director/5228799)
3. [Anthropic — Claude Opus 4.7 announcement](https://www.anthropic.com/news/claude-opus-4-7)
4. [Yahoo Tech — "Claude Opus 4.7 is a serious regression"](https://tech.yahoo.com/ai/claude/articles/claude-lash-opus-4-7-202916423.html)
5. [Pragmatic Engineer — Building Claude Code with Boris Cherny](https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny)
6. [Threadreader — Boris Cherny on adapting to Claude 4.7](https://threadreaderapp.com/thread/2044847848035156457)
7. [TokenCost — "AI Shrinkflation" and Claude Code degradation](https://tokencost.app/blog/claude-code-getting-worse-april-2026)
8. [Medium — Manu Nayyar: 30 days with Kimi K2.6](https://medium.com/write-a-catalyst/i-used-kimi-k2-6-for-30-days-as-my-only-coding-assistant-here-is-what-actually-happened-91c55b4c1cd8)
9. [Phemex — Kimi K2.6 tops OpenRouter](https://phemex.com/news/article/kimi-k26-tops-openrouter-leaderboard-with-188-trillion-tokens-76904)
10. [Mario Zechner — Pi coding agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
11. [Claude pricing](https://claude.com/pricing/max)
12. [Claude API pricing](https://platform.claude.com/docs/en/about-claude/pricing)
13. [Kimi API pricing](https://platform.kimi.ai/docs/pricing/chat-k26)
14. [SWE-Bench Pro benchmark](https://benchlm.ai/benchmarks/swePro)
15. [TokenCost — Kimi K2.6 pricing benchmarks](https://tokencost.app/blog/kimi-k2-6-pricing-benchmarks)

---

{{<author>}}
