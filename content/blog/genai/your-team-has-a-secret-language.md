---
title: "Your Team Has a Secret Language"
date: "2026-05-14"
summary: "Why AI coding agents start as strangers and what team traces reveal about the knowledge that lives between developers"
description: "Peter Naur's theory of programming meets modern AI agents. What team traces reveal about the invisible knowledge that makes or breaks agent-assisted development."
toc: true
readTime: true
autonumber: true
math: false
tags: ["GenAI", "AgenticEngineering", "QuickCall"]
showTags: true
hideBackToTop: false
mermaid: false
cover: "https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/your-team-has-a-secret-language/000-cover.png"
---

# The Naur Problem

Peter Naur figured this out in 1985.

I found his paper through a Hacker News thread. Someone dropped a link to Programming as Theory Building in the middle of a discussion about why senior developers can't explain what they know. The thread was good. Naur was better. His argument was simple. Every program has a theory living in the programmer's head. Not the code. Not the docs. The theory. A living model of why the system works this way, what the alternatives were, and why they lost. When the programmer leaves, the theory dies. The repository grows. The understanding walks out the door.

For forty years this was a slow problem. Companies lost knowledge when seniors retired. New hires took six months to stop breaking things. Documentation helped, but never enough. Everyone accepted it. You can't put forty years of scar tissue in a wiki.

Then AI agents arrived. And the problem stopped being slow.

# The Stranger Problem

Here's what changed. Every time you open a coding agent, you don't just hire a new junior. You hire a stranger. They know every open source pattern on GitHub. They don't know that your team stopped using a certain retry strategy eight months ago because it blew up production at 3 AM on a Saturday. They don't know that three different developers all append a request ID to every log line in the exact same format, none of them aware the others are doing it, none of them able to explain why they started. They don't know that your team's taste shifted last quarter from verbose types to inferred ones because the build times were killing flow state.

The agent has zero theory of your code. Every session starts from zero. And here's the part that should worry you: it's not just the senior's theory that's missing. It's the team's meta-intelligence. The accumulated judgment that lives in no single head but emerges from how the group actually works.

I didn't understand this until I started watching traces from teams where we'd deployed QuickCall. By traces I mean the actual human-AI coding sessions. The back-and-forth between a developer and their coding agent. The prompts, the corrections, the rejections, the patterns that emerge when you watch enough of them.

# What the Traces Revealed

I spent the last year looking at how engineering teams actually use AI. Not what they say in retros. Not what's in their wiki. The actual sessions. What gets built. What gets corrected. What patterns repeat until they become invisible.

Here's what I found.

## The Convergence Paradox

One team had three developers who all wrapped API errors in the same custom shape. None of them knew the others were doing it. It wasn't in the style guide. It wasn't in onboarding. Each of them had hit the same production failure six months apart and arrived at the same solution independently. The pattern lived in their fingers, not their words.

An AI agent reading their documentation would have suggested the standard library default. Every time. And every time, one of them would have corrected it. The team had developed a shared immune response to a specific failure mode. But the immune system had no central nervous system. No one could name what they were doing.

## The Temporal Drift

Another team had a convention that evolved in real time. In January they were all about explicit types. Verbose, clear, bulletproof. By March they'd shifted to heavy inference because build times had become unbearable. The change was never documented. It spread through code review, through pair sessions, through osmosis.

An AI agent trained on their January codebase would suggest the verbose style in April. And someone would fix it. Again. The agent wasn't wrong in January. It was just living in the past. The team's taste had moved on. The documents hadn't.

## The Scar Tissue Pattern

A third team had what I call a scar pattern. Every developer avoided a specific caching strategy. No one mentioned it in docs. No one flagged it in linters. But if you watched their sessions, the pattern was unmistakable. The AI suggested it occasionally. It got rejected immediately. No explanation. Just a correction and a move on.

The team's collective memory of a 2 AM outage lived in those rejections. It was their meta-intelligence at work. Distributed. Unspoken. Completely invisible to anyone who wasn't watching.

# The Documentation Trap

We tried to solve this the way engineers always do. We wrote it down.

Static documents full of conventions and best practices. I fell into this trap myself. I spent a weekend crafting a guide for a project I cared about. Sixty hours of careful thought. Monday morning the team started using it. By Wednesday it was already stale. Someone had found a better pattern. Someone else had hit an edge case the guide didn't cover. In three days my careful document became a fossil. A snapshot of what we thought on Sunday, contradicted by what we knew by Wednesday. And every AI agent that read it was following a recipe for yesterday's food.

Staleness isn't a bug in documentation. It's the nature of the medium. Documents capture a snapshot. Teams live in motion.

The HN thread had a phrase I keep coming back to. Some juniors get it. Others don't. The ones who get it are going at the physics. The others are following recipes. Every static document is a recipe. Every AI agent reading one is following it without tasting.

# What Actually Works

Apprenticeship works. Not because the master explains well. Because the apprentice sees the work.

One comment in that thread stopped me cold. It said that seeing the work reveals what matters. Even if the master were a good teacher, apprenticeship in the context of ongoing work is the most effective way to learn. People aren't aware of everything they do. Each step reminds them of the next. Nobody can talk better about what they do and why they do it than when they're in the middle of doing it.

That's the whole argument. Nobody can talk better about what they do than while they're doing it. So why are we still trying to write it down?

# The Meta-Intelligence Argument

Here's what I think now. Meta-intelligence is a team asset that compounds. Every corrected mistake, every accepted pattern, every rejected bad idea adds to it. But it only compounds if it's captured. Not in documents. Documents decay. It has to be captured from the work itself. From the traces. From the actual behavior of the team in the actual moments when they're making actual decisions.

An AI agent that starts with your team's accumulated meta-intelligence doesn't replace your seniors. It doesn't replace your juniors. It just stops being a stranger. It starts with the patterns your team has already validated. The scars you've already earned. The taste you've already developed. It starts from the present instead of the past.

We knew there had to be a dynamic system. Something that watched the work as it happened instead of reading documents written last month. Something that could feel the team's taste shifting in real time. Something that treated knowledge as a living thing, not a fossil.

Naur wrote his paper forty years ago. He was worried about what happens when a programmer leaves. He didn't have to worry about what happens when fifty developers open AI agents every morning and every single one starts from zero. The transfer problem isn't theoretical anymore. It's happening right now, in every session, every correction, every unexplained rejection that carries a fragment of your team's collective understanding.

The knowledge isn't in the docs. It's not in the code. It's in the correction you didn't explain. The rejection you forgot by lunch. The pattern you never named but everyone follows.

What if we stopped pretending otherwise?

# References
- [Peter Naur, "Programming as Theory Building" (1985)](https://pages.cs.wisc.edu/~remzi/Naur.pdf) - The foundational paper arguing that every program has a living theory in the programmer's head that cannot be transferred through documentation or code alone.
- [Hacker News thread: "Why senior developers fail to communicate their expertise"](https://news.ycombinator.com/item?id=48109460) - The discussion that surfaced Naur's paper and explored world models, tacit knowledge, and why documentation fails to capture expertise.

---

{{<author>}}
