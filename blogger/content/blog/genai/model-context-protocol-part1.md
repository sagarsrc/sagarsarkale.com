---
title: "MCP: Why All The Hype? (Part 1)"
date: "2025-11-12"
summary: "Understanding Model Context Protocol and why it's different from function calling"
description: "A deep dive into what makes MCP special and when you should actually use it"
toc: true
readTime: true
autonumber: true
math: false
tags: ["GenAI", "MCP", "AI Integration"]
showTags: true
hideBackToTop: false
mermaid: true
---
{{<figure src="/mcp1/000-cover.jpg">}}

# Introduction

A few days back it was MCP, MCP everywhere, and I was like - **what the MCP**? Why is it hyped so much?

I mean, we already have function calling in OpenAI, Anthropic, and pretty much every LLM provider. So why do we need another layer? Why should anyone choose MCP over simple function calls?

I finally got some time to read and explore more about it. The more I dug in, the more I realized there's substance behind the hype.

Will be writing about it in parts - this part covers fundamentals: what distinguishes MCP from function calling and the basics of architecture associated with it.

Let's start with the problem that MCP actually solves.

# The Problem: Integration Hell

Before we talk about MCP, let's understand what life looks like without it.

**Imagine this scenario**: You want Claude, ChatGPT, and Cursor to all access GitHub, Notion, and your database. How many custom integrations do you need?

{{<figure src="/mcp1/001-mcp-problem.jpg">}}


This is the **MxN integration problem**:
- M (AI applications) x N (data sources) = MxN (custom integrations).
- i.e. 3 (AI applications) x 3 (data sources) = 9 (custom integrations).


**Now here's where it gets worse**: Imagine you want to build something powerful - like an AI agent that monitors your GitHub repos, updates Notion project trackers, and logs metrics to your database.

Without MCP, you'd need to:
1. Pick ONE AI platform (say, Claude)
2. Build custom integrations for GitHub + Notion + Database specifically for Claude
3. Write glue code to chain them together
4. If you later want to use ChatGPT or Cursor? Start over. Rebuild everything.

And the AI can only use these tools in isolation - it can't dynamically discover what's available, maintain state across requests, or chain operations seamlessly. This doesn't scale.

**With MCP, here's what changes**: For that same AI agent monitoring GitHub, updating Notion, and logging to your database:

1. Build **3 MCP servers once**: GitHub, Notion, Database
2. Any MCP-compatible AI (Claude, ChatGPT, Cursor) can now use all three
3. The AI can **chain operations**: Pull from GitHub -> Update Notion -> Log to Database
4. **Runtime discovery**: The AI automatically discovers available tools
5. **Stateful sessions**: Context persists across multiple requests
6. Switch AI platforms? **Zero code changes needed**

You've turned 9 custom integrations into 6 reusable components (3 AI clients + 3 servers), and they work together seamlessly.

# What is MCP?

**Model Context Protocol (MCP)** is an open-source standard for connecting AI applications to external systems. Think of it as **USB-C for AI** - a universal connector that allows any AI model to plug into any data source or tool through a standardized interface.

Announced by Anthropic in **November 2024**, MCP transforms the MxN problem into an **M+N solution**:
- Build an MCP server **once** for your tool
- **Any** MCP-compatible client can immediately use it
- One GitHub MCP server works with Claude, ChatGPT, Cursor, VS Code, and all future MCP clients


## The Architecture

MCP follows a **distributed client-server architecture**. The architecture consists of three core participants:

{{<mermaid>}}
graph TB
    subgraph "MCP Host (AI Application)"
        Host[MCP Host<br/>e.g., Claude Desktop]
        Client1[MCP Client 1]
        Client2[MCP Client 2]
        Client3[MCP Client 3]
    end

    subgraph "MCP Servers"
        Server1[MCP Server 1<br/>GitHub]
        Server2[MCP Server 2<br/>Database]
        Server3[MCP Server 3<br/>File System]
    end

    subgraph "Server Components"
        Tools[Tools<br/>Executable Functions]
        Resources[Resources<br/>Data Sources]
        Prompts[Prompts<br/>Templates]
    end

    Host -->|manages| Client1
    Host -->|manages| Client2
    Host -->|manages| Client3

    Client1 <-->|JSON-RPC 2.0<br/>stdio/SSE| Server1
    Client2 <-->|JSON-RPC 2.0<br/>stdio/SSE| Server2
    Client3 <-->|JSON-RPC 2.0<br/>stdio/SSE| Server3

    Server1 -.->|exposes| Tools
    Server2 -.->|exposes| Resources
    Server3 -.->|exposes| Prompts

    style Host fill:#e1f5ff
    style Client1 fill:#fff4e1
    style Client2 fill:#fff4e1
    style Client3 fill:#fff4e1
    style Server1 fill:#e8f5e9
    style Server2 fill:#e8f5e9
    style Server3 fill:#e8f5e9
    style Tools fill:#fff3e0
    style Resources fill:#fff3e0
    style Prompts fill:#fff3e0
{{</mermaid>}}

### MCP Host
The orchestrator (like Claude Desktop) that manages multiple client instances and coordinates context from various sources simultaneously.

**Example**: When you open Claude Desktop and configure 3 MCP servers (GitHub, Postgres, Filesystem), Claude Desktop is the **Host**.

### MCP Client
Maintains individual one-to-one connections with servers. Each client instance is dedicated to a single server connection.

**What "client instance" means**: The Host creates a separate client object/process for each server. If you have 3 servers configured, the Host spawns 3 client instances:
- **Client Instance 1** ↔ GitHub Server (handles only GitHub communication)
- **Client Instance 2** ↔ Postgres Server (handles only Postgres communication)
- **Client Instance 3** ↔ Filesystem Server (handles only Filesystem communication)

Think of it like having 3 phone calls happening simultaneously - each client instance is one dedicated phone line to one specific server. The Host coordinates all these conversations.

### MCP Server
Lightweight programs that provide contextual data and functionality through a standardized protocol. Servers expose:
- **Tools**: Executable functions (database queries, API calls, computations)
- **Resources**: Static or dynamic data sources (files, records, API responses)
- **Prompts**: Reusable interaction templates (workflows, commands)

**Example**: A GitHub MCP server exposes tools like `search_code`, `create_issue`, resources like `repo://user/project/README.md`, and prompts like "Review this PR".

# MCP vs Function Calling: The Honest Comparison

Here's the question that got me started: **If OpenAI, Anthropic, and other LLM providers already support function calling natively, why add another layer with MCP servers?**

## What Function Calling Does Well

Function calling is simpler for many use cases:
- **Direct integration**: Define functions inline with your application code
- **No extra processes**: No need to run separate server processes
- **Model-native**: Built directly into OpenAI, Anthropic, and other APIs
- **Stateless & simple**: Pass function definitions with each API call

**Example** (OpenAI function calling):
```python
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What's the weather?"}],
    functions=[{
        "name": "get_weather",
        "description": "Get weather for a city",
        "parameters": {...}
    }]
)
```

## Where Function Calling Falls Short

| **Limitation** | **The Problem** | **How MCP Solves It** |
|----------------|-----------------|----------------------|
| **Vendor Lock-in** | Your function definitions only work with one LLM provider | MCP servers work with any MCP-compatible client (Claude, ChatGPT, Cursor, VS Code) |
| **No Stateful Sessions** | Each API call is isolated - no persistent context or connections | MCP maintains long-lived connections with session state |
| **No Bidirectional Communication** | Functions can't request LLM completions (no sampling) | MCP servers can ask the client for AI completions (agentic workflows) |
| **No Runtime Discovery** | Functions must be hardcoded in your application | MCP clients dynamically discover available tools via `tools/list` |
| **Tight Coupling** | Function implementations are embedded in your app code | MCP servers are independent processes - update without redeploying your app |
| **No Standardized Resources** | No protocol for exposing read-only data sources | MCP has first-class support for resources (files, DB records, API responses) |

## When to Use Function Calling vs MCP

{{<mermaid>}}
graph TD
    Start[MCP or Function Calling?] --> Q1{Multi-provider<br/>support?}
    Q1 -->|YES| MCP[MCP]
    Q1 -->|NO| Q2{Tool reusability<br/>across apps?}
    Q2 -->|YES| MCP
    Q2 -->|NO| Q3{Stateful<br/>sessions?}
    Q3 -->|YES| MCP
    Q3 -->|NO| Q4{Bidirectional<br/>communication?}
    Q4 -->|YES| MCP
    Q4 -->|NO| Q5{Runtime tool<br/>discovery?}
    Q5 -->|YES| MCP
    Q5 -->|NO| FC[Function Calling]

    FC --> Note[Simpler, tightly coupled,<br/>vendor lock-in OK]
    MCP --> Note2[Infrastructure overhead,<br/>standardization benefits]

    style Start fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style MCP fill:#e8f5e9,stroke:#2e7d32,stroke-width:4px
    style FC fill:#fff3e0,stroke:#e65100,stroke-width:4px
    style Note fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Note2 fill:#fff9c4,stroke:#f57f17,stroke-width:2px
{{</mermaid>}}

**Bottom Line**: If you're building a quick prototype or single-purpose app, function calling is often enough. If you're building infrastructure, tools for teams, or want to leverage the MCP ecosystem, the extra complexity pays off.

# The MCP Ecosystem Today

The adoption story is fascinating. MCP's initial reception in November 2024 was lukewarm. But in **early 2025, it exploded**, with over **1,000 community-built servers** by February.

## Why It Went Viral

### AI-Native Design
Unlike generic standards adapted for AI use, MCP was **specifically architected for LLM workflows** from the ground up. The protocol distinguishes between:
- **Model-controlled tools** (actions AI decides to take)
- **Application-controlled resources** (data the app provides)
- **User-controlled prompts** (templates users invoke)

### Complete Ecosystem Launch
MCP didn't launch as just a specification. Anthropic shipped:
- **Official clients**: Claude Desktop, Claude Code
- **19 reference servers**: Filesystem, Git, Memory, PostgreSQL, Slack, etc.
- **SDKs**: Python and TypeScript with full documentation
- **Developer tools**: MCP Inspector for debugging

### OpenAI's Endorsement
The tipping point came in **March 2025** when OpenAI CEO Sam Altman announced that OpenAI would adopt Anthropic's MCP standard rather than building its own competing protocol. This created industry consensus around a single standard.

{{<tweet id="1904957253456941061">}}

## Market Impact (2025 Data)

- **90%** of organizations believe MCP is essential for AI applications
- **90-95%** plan to increase MCP investment in the next two years
- **2,000+** MCP capabilities in the official registry (Smithery.ai)
- **20,000+** GitHub stars for FastMCP framework alone

### Viral Moment: Blender MCP

One of the most compelling demonstrations of MCP's potential came from Siddharth Ahuja, who built an MCP server that lets Claude control Blender directly. With just a few text prompts, you could create complete 3D scenes:

{{<tweet id="1899460492999184534">}}

This demo received **1.6M views** and showed the world what's possible when AI can actually *do things* beyond just generating text.

# Building Your First MCP Server

Let's get practical. Here's what you'll build - a simple weather MCP server that Claude can use to answer queries:

{{<figure src="https://raw.githubusercontent.com/sagarsrc/exploring-mcp/master/media/video-demo-weather-claude-integration.gif" caption="Weather MCP server in action with Claude Desktop">}}

This takes just 5 minutes to build. Here's the complete code:

{{<github owner="sagarsrc" repo="exploring-mcp" path="src/000_dumb_mcp.py" branch="master" lang="python">}}

## Connecting to Claude Desktop

1. Locate your Claude config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

2. Add your server:
```json
{
  "globalShortcut": "",
  "mcpServers": {
    "weather-server": {
      "command": "/Users/sagar/.local/bin/uv",
      "args": [
        "run",
        "--with",
        "fastmcp",
        "python",
        "/path/to/your/server.py"
      ]
    }
  }
}
```

3. Restart Claude Desktop - your server is now accessible!

{{<figure src="/mcp1/003-claude-dev-settings.jpg" caption="Claude Desktop developer settings showing configured MCP server">}}

Once configured, you'll see your MCP server's logs in Claude Desktop log files:

{{<figure src="/mcp1/004-claude-logs.jpg" caption="MCP server successfully connected in Claude Desktop">}}

# End Note

MCP isn't just another protocol - it's a standardization moment for AI integration. Just as USB-C unified hardware connections and HTTP standardized web communication, MCP is unifying how AI applications connect to the world.

**Key takeaways**:
1. MCP solves the MxN integration problem -> M+N solution
2. It's not about replacing function calling - it's about standardizing the ecosystem layer above it
3. Use function calling for simple apps, MCP for infrastructure and reusable integrations
4. The ecosystem is growing rapidly with industry backing from OpenAI, Anthropic, and Microsoft

In the upcoming parts, I'll try moving towards building an understanding of building production-grade MCP servers with close to real-world examples: database integrations, API aggregators, and more. We'll explore authentication, error handling, and deployment strategies. Let's see how it goes!

Until then, try building your first MCP server and see how it integrates with your AI workflow!

---

# References
- [Building Agents with MCP - Anthropic Official Workshop](https://www.youtube.com/watch?v=kQmXtrmQ5Zg)
- [Model Context Protocol Official Docs](https://modelcontextprotocol.io)
- [FastMCP Framework](https://gofastmcp.com)
- [Awesome MCP Servers Collection](https://github.com/punkpeye/awesome-mcp-servers)
- [What is MCP and why you should pay attention?](https://waleedk.medium.com/what-is-mcp-and-why-you-should-pay-attention-31524da7733f)

---

Written By

> [Sagar Sarkale](https://linkedin.com/in/sagar-sarkale)
