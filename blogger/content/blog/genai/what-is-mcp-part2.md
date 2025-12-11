---
title: "What the MCP? (Part 2): I Built Quick Call"
date: "2025-12-05"
summary: "I set out to write Part 2 about MCP. Instead, I fell into a rabbit hole..."
description: "I set out to write Part 2 about MCP. Instead, I fell into a rabbit hole and built Quick Call."
toc: true
readTime: true
autonumber: true
math: false
tags: ["GenAI", "MCP", "AI Integration", "Quick Call", "Developer Tools"]
showTags: true
hideBackToTop: false
mermaid: true
---

{{<figure src="/mcp2/000-cover.png">}}

# Introduction

Remember when I said Part 2 would dive deeper into MCP architecture? Yeah, about that.

I was knee-deep in MCP docs, trying to put together a simple tutorial. Something that would show how MCP actually works in practice. I kept thinking about use cases - what tools would make a good demo? GitHub seemed obvious. Slack too. Then I started wondering: how would someone actually use this day-to-day?

That's when things got out of hand.

Within a few days, I had something hacky but functional. The kind of prototype that works but you'd never show anyone. It needed polish, proper error handling, an actual UI...

So I put in another week. Then another.

And somehow I ended up building **Quick Call** - an AI assistant that actually understands your GitHub repos and Slack workspaces. What started as "let me make a quick demo" turned into the most productive procrastination of my life.

This post is Part 2, but it's not the Part 2 I planned. It's the Part 2 I accidentally built.

# What is Quick Call?

Quick Call is your AI assistant that doesn't just chat. It actually knows what's going on in your workspace.

Think of it like this: Instead of jumping between GitHub to check commits, Slack to send updates, and your terminal to remember what you did in last 2 days, you just ask Quick Call.

**"Give me my daily update"** -> It fetches your commits, analyzes the diffs, and tells you exactly what you shipped today.

**"Send a summary to #engineering on Slack"** -> Your standup update is already there.

It's not magic. It's **MCP doing the heavy lifting** while Quick Call  orchestrates the tools and figures out what you actually want.

{{<figure src="/mcp2/001-demo-current.gif" caption="Quick Call in action">}}

# The Two Superpowers (For Now)

## GitHub Integration

Quick Call plugs into your GitHub via OAuth and gives you conversational access to:

- **List your repos**: "Show me my active projects"
- **Check commits**: "What did I commit yesterday?"

**MCP elicitation to get user input for the list_commits tool**

Notice how user did not specify which repo to list commits from. This is where MCP comes in to get the user input for the `list_commits` tool.
{{<figure src="/mcp2/002-github-list-commits-01.jpg">}}

**MCP function call in action**

Once MCP tool has all the inputs needed, it completes the function call and returns the result to the user.
{{<figure src="/mcp2/002-github-list-commits-02.jpg">}}
## Slack Integration

Same deal as GitHub. OAuth flow, store your tokens, and now you can:

- **List channels**: "What channels am I in?"
- **Send messages**: "Post 'Deploy successful' to #devops"

**Sending messages via Quick Call**
{{<figure src="/mcp2/003-send-slack-01.jpg">}}

**Function call to send the message**
{{<figure src="/mcp2/003-send-slack-02.jpg">}}

**Sent message via Quick Call**
{{<figure src="/mcp2/003-send-slack-03.jpg">}}

## Tool Chaining: Where It Gets Interesting

Individual tools are useful. But the real power is when they work together.

**"Summarize my work this week"** - sounds simple, but here's what actually happens:

- `list_commits` fetches your commits from the past week
- `get_commit_diffs` grabs the file-level changes for each commit
- The AI aggregates stats (lines added/deleted, files changed)
- Then it summarizes everything into a readable report
- And sends the summary to Slack

You asked one question. Quick Call made multiple tool calls, chained them together, and gave you the result. The AI decides which tools to call and in what order.

**Workflow in action for a Developer**
{{<figure src="/mcp2/004-workflow-dev.jpg">}}

**Workflow in action for a Product Manager**
{{<figure src="/mcp2/004-workflow-pm.jpg">}}



# Why This Matters

It's 9:45 AM. Standup in 15 minutes. *"What did you work on yesterday?"*

You could scramble through GitHub commits, grep your terminal history, piece it together manually...

Or you ask Quick Call and it sends it directly to Slack. Standup = crushed.

# The MCP Magic

Here's where Part 1 theory meets Part 2 practice.

Quick Call is built on **three separate services**:

- **Frontend** : The chat UI you interact with
- **Backend** : Handles auth, database, and talks to OpenAI
- **MCP Server** : The bridge to GitHub and Slack

When you ask a question, here's what happens:

{{<mermaid>}}
sequenceDiagram
    box rgb(240, 253, 244) Quick Call
        participant User
        participant Frontend
        participant Backend
    end
    box rgb(254, 243, 199) AI Layer
        participant OpenAI
    end
    box rgb(239, 246, 255) MCP Layer
        participant MCP as MCP Server
    end
    box rgb(243, 232, 255) External APIs
        participant GitHub
    end

    User->>Frontend: "Give me my daily update"
    activate Frontend
    Frontend->>Backend: Forward request
    activate Backend
    Backend->>OpenAI: Process with available tools
    activate OpenAI

    rect rgb(254, 249, 195)
        Note over OpenAI,GitHub: Tool Call 1: Fetch commits
        OpenAI->>MCP: list_commits(since="today")
        activate MCP
        MCP->>GitHub: GET /repos/.../commits
        GitHub-->>MCP: [commits]
        MCP-->>OpenAI: {commits data}
        deactivate MCP
    end

    rect rgb(254, 249, 195)
        Note over OpenAI,GitHub: Tool Call 2: Get diffs
        OpenAI->>MCP: get_commit_diffs(shas=[...])
        activate MCP
        MCP->>GitHub: GET /repos/.../commits/{sha}
        GitHub-->>MCP: {diffs, stats}
        MCP-->>OpenAI: {diffs data}
        deactivate MCP
    end

    OpenAI-->>Backend: "Here's your daily update..."
    deactivate OpenAI
    Backend-->>Frontend: Stream response
    deactivate Backend
    Frontend-->>User: Display summary
    deactivate Frontend
{{</mermaid>}}

OpenAI doesn't know how to call GitHub's API. But with MCP:
- The **MCP server exposes 40+ GitHub tools** (list repos, get commits, update issues, etc.)
- OpenAI **discovers these tools automatically** via the MCP protocol
- When OpenAI decides it needs data, it calls the right tool
- The MCP server authenticates with **your** GitHub token, fetches the data, and returns it
- OpenAI gets structured JSON back and narrates it to you

**This is the killer feature of MCP**: You're not hardcoding API calls or writing custom integrations. You define tools once, and the AI figures out how to use them.

# Coming Soon

- **GitHub Projects integration**: "Move issue #20 to In Progress" - manage issues without leaving the chat
- **Export to Notion**: Turn your daily updates into formatted docs

# Why I Built This

I was tired of jumping between GitHub tabs to check what I shipped and writing standup updates manually every morning. Quick Call scratches my own itch. If it helps you too, awesome we should chat!

# Wrapping Up

So yeah, I never wrote MCP Part 2 as a traditional blog post.

Instead, I built Quick Call. A working example of what MCP enables.

If you care about dev tools, AI orchestration, or just want to stop wasting time on manual status updates, give it a spin.

And if you're curious about the architecture, tool chaining, or how MCP handles multi-step flows, hit me up. I've got battle scars and lessons learned.

Next up? Actually implementing all those future features. And maybe, *maybe*, writing Part 3.

# Try It Yourself

Quick Call is live at **[quickcall.dev](https://quickcall.dev)**. Try it out and let me know what you think. Always open to feedback and improvements.



# Resources

- [MCP Part 1: What the MCP?](/blog/genai/what-is-mcp-part1)
- [Model Context Protocol Official Docs](https://modelcontextprotocol.io)
- [FastMCP Framework](https://gofastmcp.com)

---

{{<author>}}
