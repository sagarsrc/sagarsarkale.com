---
title: "What the MCP? (Part 3): When Code LLMs Need Help"
date: "2026-01-08"
summary: "Everyone's adding MCP servers. Few are thinking about how they'll actually be called correctly."
description: "Elicitation isn't just UX polish — it's how we help LLMs recover gracefully when tool calls go wrong."
toc: true
readTime: true
autonumber: true
math: false
mermaid: true
tags: ["GenAI", "MCP", "AI Integration", "Elicitation", "Claude Code"]
showTags: true
hideBackToTop: false
---

# Introduction

Everyone's racing toward fully autonomous agents. The vision is compelling: AI that tolerates failure, recovers gracefully, and keeps marching toward its goals. And with 2,000+ MCP servers now in the registry, the tooling ecosystem is exploding.

But here's what nobody's talking about: **what happens when the LLM doesn't have all the info it needs to call a tool?**

The MCP folks saw this coming. They built something called **Elicitation**. Most clients don't support it yet. I built Quick Call with this from day one -> only realized I was ahead of the curve when I found out Claude Code doesn't support it.

Let me show you what I mean.

---

# The Scenario: "Send hi to Slack"

Same request. Two very different execution paths.

## Quick Call (with elicitation)

{{<figure src="/mcp3/quickcall-send-hi-slack-channel.gif" caption="Quick Call: one tool call, user picks channel inline">}}

**What happens:**
1. User: "Send hi to Slack"
2. Quick Call MCP server recognizes channel is missing
3. Server **pauses**, shows dropdown: "Which channel?"
4. User picks `#general`
5. Message sent

**Result:** One tool call. One user interaction. Done.

---

## Claude Code (without elicitation)

{{<figure src="/mcp3/claude-send-hi-slack-channel.gif" caption="Claude Code: two tool calls, extra round-trip">}}

**What happens:**
1. User: "Send hi to Slack"
2. Claude thinks: "I need to know which channel"
3. Claude calls `list_channels` -> gets channel list back
4. Claude presents options: "Which channel?"
5. User types: `#general`
6. Claude calls `send_message(channel="#general", message="hi")`
7. Done

**Result:** Two tool calls. Extra tokens. Extra latency.

To be clear: Claude Code is being smart here. It figured out it needed more info and found a workaround. But it's still a workaround.

**The difference?** Elicitation lets the **tool** ask for what it needs. Without it, the **LLM** has to figure out how to get that info itself.

Think about it: who knows better what parameters a tool needs -> the tool or the LLM guessing from a description? The tool, obviously. Elicitation puts the tool in control of gathering its own inputs. That's the fundamental shift.

---

# The Cost of Being Clever

## Every Extra Tool Call = $$$

The math is simple:
- Each tool call = input tokens (tool definitions) + output tokens (response)
- Extra `list_channels` call: ~500-1000 tokens round-trip
- At scale: 1,000 messages/day × 500 tokens = **500K extra tokens/day**

**What does that cost?**

| Model | Input (per 1M) | Output (per 1M) | Daily | Monthly |
|-------|----------------|-----------------|-------|---------|
| Claude Opus 4.5 | $5 | $25 | ~$5 | ~$150 |
| GPT-4o | $2.50 | $10 | ~$2 | ~$68 |

That's $70-150/month for **one feature's inefficiency**. Multiply by every tool that needs user input.

---

## Beyond Cost: Reliability

Anthropic's own benchmarks tell the story. From their [Opus 4.5 announcement](https://www.anthropic.com/news/claude-opus-4-5):

**Scaled tool use (MCP Atlas)**:
| Model | Score | Failure Rate |
|-------|-------|--------------|
| Opus 4.5 | 62.3% | ~38% |
| Sonnet 4.5 | 43.8% | ~56% |
| Opus 4.1 | 40.9% | ~59% |

Even the best model fails **38% of the time** on complex tool use scenarios. And that's Opus 4.5 -> Anthropic's flagship. Fewer tool calls = fewer chances to fail.

---

## Latency Adds Up

Each tool call involves:
- Model inference time
- API round-trip
- Response parsing

Claude Code's workaround means 2x the wait time. The user sits there while the LLM fetches the channel list, processes it, formats the question, waits for input, then makes another call.

With elicitation? The tool pauses, asks, continues. One smooth interaction.

So how do we fix this?

---

# Where Elicitation Shines

## Use Cases

| Scenario | Without Elicitation | With Elicitation |
|----------|---------------------|------------------|
| **Ambiguity** | Fail or guess wrong | Ask: "Which subscription to cancel?" |
| **Confirmation** | Proceed blindly | Ask: "Type workspace name to confirm delete" |
| **Missing params** | Extra tool call or error | Ask: "Enter your API key" |
| **Progressive input** | Front-load everything upfront | Collect step-by-step as needed |

---

## See It In Action

I've open-sourced a demo app that showcases Quick Call's elicitation framework: [quickcall-mcp-elicitation](https://github.com/quickcall-dev/quickcall-mcp-elicitation)

The prompt is deliberately vague: "Schedule a meeting" -> no title, no participants, no time. The tool collects what it needs **progressively** through elicitation. One tool call, multiple user inputs, zero extra LLM round-trips.

{{<figure src="/mcp3/light-mcp-elicit.gif" caption="Meeting scheduler with progressive elicitation">}}

Here's how the flow works:

{{<mermaid>}}
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MCP as MCP Server

    User->>Frontend: "Schedule a meeting"
    Frontend->>Backend: Forward request
    Backend->>MCP: Execute tool

    rect rgb(255, 243, 224)
        Note over MCP: Elicitation: Get title
        MCP->>Frontend: ctx.elicit("title?")
        Frontend->>User: Show text input
        User->>Frontend: "Weekly Standup"
        Frontend->>MCP: Resume with value
    end

    rect rgb(255, 243, 224)
        Note over MCP: Elicitation: Get participants, duration, time
    end

    MCP-->>Backend: Meeting created
    Backend-->>Frontend: Response
    Frontend->>User: "Meeting scheduled!"
{{</mermaid>}}

The tool pauses at each `ctx.elicit()` call, collects input via SSE, and resumes.

> **Wait, aren't those still round-trips?**
>
> Each `ctx.elicit()` is a round-trip between backend and frontend: SSE event out, user responds, POST back, tool resumes. But critically, it's not an LLM round-trip. The LLM calls `schedule_meeting` once. That single tool execution handles all user interactions internally. The LLM doesn't re-enter the loop until the tool returns.

---

# How It Works

## Server Side: `ctx.elicit()`

In your MCP tool, call `ctx.elicit()` when you need user input:

```python
from fastmcp.server.dependencies import get_context

@mcp.tool()
async def schedule_meeting(title: Optional[str] = None, duration: Optional[str] = None):
    ctx = get_context()

    # Free text input
    if not title:
        result = await ctx.elicit(
            message="What should the meeting be called?",
            response_type=str,
        )
        if result.action == "cancel":
            return {"error": "Cancelled by user"}
        title = result.data

    # Single select from options
    if not duration:
        result = await ctx.elicit(
            message="How long should the meeting be?",
            response_type=["30 minutes", "1 hour", "2 hours"],
        )
        duration = result.data

    return {"title": title, "duration": duration}
```

`response_type` determines the UI:
- `str` -> text input
- `["option1", "option2"]` -> single select buttons
- `int`, `bool` -> appropriate input fields

## Client Side: Handle the pause

When `ctx.elicit()` is called, your client receives an SSE event:

```json
{
  "type": "elicitation_request",
  "elicitation_id": "chat_abc123",
  "message": "What should the meeting be called?",
  "options": null
}
```

Render the UI, collect input, POST back:

```bash
POST /elicitation/respond
{
  "elicitation_id": "chat_abc123",
  "response": {"action": "accept", "value": "Weekly Standup"}
}
```

The tool resumes from where it paused. That's it.

---

# Current Client Support

<table>
<thead>
<tr><th>Client</th><th>Elicitation</th><th>Notes</th></tr>
</thead>
<tbody>
<tr style="background-color: #fef2f2;"><td><strong>Claude Code</strong></td><td>No</td><td><a href="https://github.com/anthropics/claude-code/issues/2799">Issue #2799</a> - 106 upvotes, assigned but no timeline</td></tr>
<tr style="background-color: #f0fdf4;"><td><strong>Quick Call</strong></td><td>Yes</td><td>Built-in from day one</td></tr>
<tr><td>GitHub Copilot</td><td>Yes</td><td><a href="https://devblogs.microsoft.com/java/unlocking-mcp-in-jetbrains-how-copilot-uses-sampling-prompts-resources-and-elicitation/">Shipped Dec 2025</a> - VS Code, VS 2026, JetBrains</td></tr>
<tr><td>Cursor</td><td>Yes</td><td><a href="https://webrix.ai/blog/cursor-mcp-features-blog-post">Shipped</a> - supports string, number, boolean, enum schemas</td></tr>
</tbody>
</table>

When I built Quick Call, elicitation was already available in FastMCP. I used it because making users re-prompt when a parameter was missing felt wrong. I'm looking forward to seeing Claude Code support this.

---

# Final Thoughts

Elicitation isn't UX polish. It's the difference between tools that ask for what they need and LLMs that scramble to figure it out themselves.

Fewer tool calls. Fewer tokens. Fewer failures. Better UX.

Cursor and Copilot already support it. Claude Code will get there. Until then, build your tools right -> assume elicitation exists, and let your tools do the asking.

---

The MCP elicitation demo is open-sourced: [quickcall-mcp-elicitation](https://github.com/quickcall-dev/quickcall-mcp-elicitation)

**Try Quick Call**: Now with Claude Code integration -> [quickcall.dev/claude-code](https://quickcall.dev/claude-code)

**Catch up**: [Part 1: What the MCP?](/blog/genai/what-is-mcp-part1) | [Part 2: I Built Quick Call](/blog/genai/what-is-mcp-part2)

---

# Resources

- [MCP Elicitation Docs](https://modelcontextprotocol.io/docs/concepts/elicitation)
- [Claude Opus 4.5 Announcement & Benchmarks](https://www.anthropic.com/news/claude-opus-4-5)
- [Quick Call MCP Elicitation Demo](https://github.com/quickcall-dev/quickcall-mcp-elicitation)
- [Claude Code Elicitation Feature Request (Issue #2799)](https://github.com/anthropics/claude-code/issues/2799)
- [GitHub Copilot MCP Elicitation in JetBrains](https://devblogs.microsoft.com/java/unlocking-mcp-in-jetbrains-how-copilot-uses-sampling-prompts-resources-and-elicitation/)
- [Cursor MCP Elicitation Support](https://webrix.ai/blog/cursor-mcp-features-blog-post)
- [Part 1: What the MCP?](/blog/genai/what-is-mcp-part1)
- [Part 2: I Built Quick Call](/blog/genai/what-is-mcp-part2)

---

{{<author>}}
