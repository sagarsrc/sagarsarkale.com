---
title: "Paseo Is the Control Plane Around Your Coding Agents"
date: "2026-11-23"
summary: "Claude Code, Codex, Pi, and OpenCode keep their own harnesses. Paseo gives them one workspace across desktop, web, and phone."
description: "How Paseo works, what it feels like to use, how it connects to Claude Code, Codex, Pi, and other agent harnesses, and a safe way to try it."
toc: true
readTime: true
autonumber: true
math: false
tags: ["Agents", "Pi", "Claude Code"]
showTags: true
hideBackToTop: false
mermaid: true
cover: "https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/000-cover.png"
---

I started looking at Paseo because I wanted a better way to use coding agents running on a remote machine. I already had Pi on an Ubuntu VM. The missing part was not another model. It was a workspace I could open from a laptop or phone without reducing everything to a terminal.

My first question was embarrassingly simple:

> Is Paseo just a container around Codex or Claude Code?

No. That mental model is wrong in a useful way.

Paseo is a **control plane and development workspace around coding-agent harnesses**. Claude Code stays Claude Code. Codex stays Codex. Pi stays Pi. Paseo gives them one interface for projects, worktrees, terminals, files, diffs, browser panes, and remote access.

That distinction explains almost everything else.

# Model, Harness, and Control Plane

These three things are easy to collapse into one word: "agent." They are not the same.

- **Model:** the LLM doing inference, such as a Claude or GPT model.
- **Harness:** the agent loop around the model. It owns prompts, tools, permissions, compaction, sessions, and provider-specific behavior.
- **Control plane:** the layer that starts, routes, observes, and organizes harnesses.

Paseo is mainly the third layer.

{{<mermaid>}}
graph LR
    User[Desktop, Web, or Phone] --> Paseo[Paseo client]
    Paseo --> Daemon[Paseo daemon]
    Daemon --> Adapter{Provider adapter}
    Adapter --> Claude[Claude Code]
    Adapter --> Codex[Codex CLI]
    Adapter --> Pi[Pi]
    Adapter --> OpenCode[OpenCode]
    Claude --> Models1[Claude models]
    Codex --> Models2[OpenAI models]
    Pi --> Models3[Multi-provider models]
    OpenCode --> Models4[Multi-provider models]
{{</mermaid>}}

When I select Claude in Paseo, the path is roughly:

```text
Paseo → Claude provider → Claude Agent SDK → Claude Code → Claude model
```

When I select Codex:

```text
Paseo → Codex provider → codex app-server → OpenAI model
```

When I select Pi:

```text
Paseo → Pi provider → pi --mode rpc → selected model
```

The same Claude model can sometimes be called through Pi or OpenCode. That does **not** turn those harnesses into Claude Code. The model may be the same. Tool behavior, permissions, prompts, session format, and compaction still come from the selected harness.

# What Paseo Actually Adds

Paseo runs a daemon on the machine where the code and agent CLIs live. Desktop, mobile, web, and CLI clients connect to that daemon.

The daemon gives different harnesses a shared operational surface:

- projects connected to repositories;
- isolated Git worktrees for parallel tasks;
- multiple agent sessions in one workspace;
- files, terminals, diffs, pull requests, and browser panes;
- provider-specific model, mode, and thinking controls;
- session import and resume where the provider supports it;
- agent-to-agent handoffs and orchestration;
- remote access from iOS, Android, desktop, web, or CLI.

It is closer to **an IDE plus process supervisor plus remote control plane** than a container.

Paseo can itself run in Docker, but Docker is optional. A normal host installation starts agent CLIs as subprocesses with the permissions of the daemon user. That means Paseo is not a sandbox by default.

# What It Looks Like to Use

The mobile app is not only a chat window. It exposes projects, agents, files, terminal sessions, and review surfaces connected to the same daemon.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/001-projects.png" width="520" caption="Project and agent navigation in the Android app. Official Paseo store screenshot.">}}

A session still feels like the selected harness. Paseo renders the conversation and streams tool activity, while the underlying provider performs the turn.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/002-chat.png" width="520" caption="An active coding-agent conversation on Android. Official Paseo store screenshot.">}}

The useful part is what happens after the agent writes code. I can inspect the diff from the same workspace instead of switching to a separate terminal or Git client.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/003-review.png" width="520" caption="Mobile diff review inside Paseo. Official Paseo store screenshot.">}}

# Which Harnesses Does It Use?

Paseo does not force every provider through Codex. Current source has separate adapters for the major harnesses.

| Paseo provider | Harness that actually runs | Integration |
|---|---|---|
| Claude | Claude Code | Anthropic Claude Agent SDK plus installed Claude Code executable |
| Codex | OpenAI Codex CLI | Official `codex app-server` interface |
| OpenCode | OpenCode | OpenCode server and API |
| Pi | Pi | Installed `pi` process in RPC mode |
| Oh My Pi | OMP | Installed `omp` process in RPC UI mode |
| GitHub Copilot | Copilot CLI | Agent Client Protocol |
| Gemini CLI, Cursor, Kimi, Qwen, and others | Their own CLIs | Generic or specialized Agent Client Protocol adapters |
| Antigravity | `agy` CLI | Bundled provider plugin using ACP |
| Muse Code | Muse runtime | Bundled provider plugin using MSP |

This design matters because subscriptions, authentication, skills, MCP servers, configuration, and native session behavior stay attached to the underlying harness.

# A Turn, Step by Step

Suppose I open the Android client and ask a Pi session to fix a test.

1. The client sends my instruction to the Paseo daemon.
2. The daemon identifies the project, worktree, session, and Pi provider.
3. The Pi adapter starts or resumes the installed `pi` process in RPC mode.
4. Pi calls its configured model and executes its own tools.
5. Pi writes the native conversation to its own session storage.
6. Paseo maps Pi events into its shared timeline.
7. The client renders messages, tool activity, changed files, and diffs.
8. I can review the result, send a follow-up, open a terminal, or hand work to another agent.

Paseo coordinates the experience. It does not become Pi internally.

# How I Would Set It Up

There are two practical installation shapes.

## Option 1: Desktop machine

Use this when the repositories and agent CLIs already live on a laptop or workstation.

1. Install and authenticate at least one supported agent CLI.
2. Download the Paseo desktop app.
3. Open a repository as a project.
4. Choose a provider and model.
5. Start one disposable task in a separate worktree.
6. Pair the phone from the host settings if remote access is needed.

The desktop app starts the local daemon automatically.

## Option 2: Headless server or VM

Use this when agents run on a remote Linux machine.

First install and authenticate the harnesses on that machine. Example:

```bash
# Paseo server CLI
npm install -g @getpaseo/cli

# Start the daemon
paseo
```

Then choose a connection path:

- Paseo's end-to-end encrypted relay for device pairing;
- direct TCP through Tailscale or another VPN;
- a carefully configured private network route.

For direct network binding, add Paseo password authentication. Authentication controls who can connect. It does not encrypt plain HTTP by itself, and it does not reduce the authority of the agent process after connection.

# A Safe First Trial

I would not begin by importing the most important active project and launching five agents.

I would use this sequence:

1. **Install one provider only.** Keep plugins and optional services out of the first test.
2. **Create a scratch Git repository.** Nothing important should depend on the first session.
3. **Start one disposable native session.** Record the selected model, mode, and working directory.
4. **Resume it through Paseo.** Compare transcript, tools, files, model controls, and cancellation.
5. **Resume it again in the native harness.** Confirm that Paseo did not trap the conversation.
6. **Test one worktree.** Make a small change, inspect its diff, commit it, then remove the worktree.
7. **Add private phone access.** Only after local session fidelity works.
8. **Test failure paths.** Close the client, release an idle runtime, restart the daemon, reboot the host, and resume again.
9. **Test teardown.** Remove Paseo and confirm that Git files, harness configuration, credentials, and native sessions remain usable.

The source of truth should remain the repository and the native provider session wherever possible. Paseo metadata should be replaceable.

# How This Helps Us

The biggest gain is not "more AI." It is lower operational friction around AI work.

## One workspace without one mandatory harness

A team can use Claude Code for one task, Codex for another, and Pi or OpenCode for a third. Paseo gives all of them the same project, worktree, terminal, diff, and review surface.

## Remote supervision becomes practical

Long agent turns do not require sitting in front of the host machine. I can start work at a desk, inspect progress from a phone, answer a permission request, review a diff, and send a correction.

## Parallel work gets safer

Each task can run in its own Git worktree instead of several agents editing the same checkout. The isolation is Git-level rather than magical, but it removes a common source of accidental collisions.

## Handoffs become explicit

Paseo can launch and coordinate agents across providers. Planning can happen in one harness and implementation in another without pretending the two harnesses are identical.

## Review stays close to execution

Chat, files, terminal output, and diffs stay in one workspace. Less context is lost between "the agent says it finished" and "I verified what changed."

# What It Does Not Solve

Paseo does not remove the risks of autonomous coding agents.

- It is not a sandbox unless I add container or OS isolation.
- An agent generally has the authority of the daemon's OS user.
- Provider permission behavior still differs.
- Plugins run trusted code on the daemon and clients.
- A private network route limits entry; it does not make unsafe tool execution safe.
- Session import does not prove perfect round-trip fidelity. That needs testing per provider and version.
- More parallel agents can create more review load, not less.

The control plane makes powerful processes easier to operate. That increases the need for scoped credentials, isolated worktrees, backups, review, and a clean rollback path.

# My Current Take

Paseo finally clicked for me when I stopped asking which model it contained.

It contains no universal replacement for Claude Code, Codex, Pi, or OpenCode. It lets those harnesses remain themselves while giving me one place to operate them.

That is useful for my setup: code and agents on a remote VM, a laptop when I am at a desk, and Android when I only need to supervise, answer, or review. The smallest useful test is not a migration. It is one scratch repository, one provider, one session, and one round trip back to the native harness.

If that works, Paseo can grow from a remote viewer into the workspace around the agents. If it does not, the repository and native sessions should still be there.

# Evidence Note

This post is based on current Paseo documentation and source inspection. I verified the provider architecture in source. I have not yet completed the end-to-end VM, Android, restart, and teardown trial described above. Product screenshots come from the official Apache-2.0 Paseo repository.

# References

- [Paseo repository](https://github.com/getpaseo/paseo)
- [Paseo provider overview](https://paseo.sh/docs/providers)
- [Supported providers](https://paseo.sh/docs/supported-providers)
- [Paseo connectivity guide](https://paseo.sh/docs/connectivity)
- [Paseo security architecture](https://paseo.sh/docs/security)
- [Provider registry source](https://github.com/getpaseo/paseo/blob/main/packages/server/src/server/agent/provider-registry.ts)
- [Claude provider source](https://github.com/getpaseo/paseo/blob/main/packages/server/src/server/agent/providers/claude/agent.ts)
- [Provider implementation notes](https://github.com/getpaseo/paseo/blob/main/docs/providers.md)

---

{{<author>}}
