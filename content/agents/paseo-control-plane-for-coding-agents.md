---
title: "Paseo Put My Coding Agents on My Phone"
date: "2026-11-23"
summary: "I connected Paseo across my MacBook, remote agent box, and phone with Tailscale. It was great once I stopped trusting the error messages."
description: "My Paseo and Tailscale setup, the daemon binding failures and stale desktop connection that broke it, and why Paseo is now the control plane around my coding agents."
toc: true
autonumber: true
readTime: true
tags: ["Agents", "Pi", "Claude Code"]
mermaid: true
---

I already had the agents.

Pi on my remote box. Claude Code and Codex on my MacBook. Tailscale connecting everything. SSH and tmux when I needed to jump in and control the machine directly.

What I did not have was one decent place to operate all of it.

I wanted to start an agent from my laptop, leave the desk, check it from my phone, answer a question, inspect the diff, and continue without reconstructing the session from terminal panes.

Then I found [Paseo](https://paseo.sh).

It looked almost exactly like the missing layer. Desktop app. Native phone app. Projects. Agents. Files. Terminals. Diffs. Worktrees. Multiple harnesses behind one interface.

I installed it expecting a five-minute Tailscale configuration.

An hour later the daemon was crash-looping, the desktop thought its own project was not editable, the phone worked while the Mac app did not, and the fix that made everything connect also exposed the daemon on every network interface.

Great tool. Very educational setup.

# What Paseo Actually Is

My first question was whether Paseo was some kind of container around Codex.

It is not.

Paseo is a control plane around coding-agent harnesses. The actual harness still runs underneath.

```text
Paseo → Pi provider → pi --mode rpc → model selected in Pi
```

```text
Paseo → Claude provider → Claude Code → Claude model
```

```text
Paseo → Codex provider → codex app-server → OpenAI model
```

Pi stays Pi. Claude Code stays Claude Code. Codex stays Codex.

The harness still owns the prompts, tools, permissions, compaction, sessions, and model behavior. Paseo owns the workspace around them: projects, clients, terminals, files, diffs, worktrees, and remote access.

That separation is why I like it.

I already invested heavily in Pi. I did not want another application pretending to support Pi while quietly replacing everything useful about it. Paseo talks to the installed Pi process through RPC. Pi still does the work. Paseo gives me a much better place to see and manage that work.

# My Setup

I have two machines doing different jobs:

- **MacBook Pro** — daily driver and local projects
- **Remote VPS** — always-on box for long-running agents

My phone, laptop, and VPS are all inside the same Tailscale network. I am not publishing the real hostnames, IPs, credentials, or access configuration. They do not help anyone understand the setup.

The useful shape looks like this:

{{<mermaid>}}
graph LR
    Phone[Phone] --> Tailnet[Tailscale private network]
    Mac[MacBook Pro] --> Tailnet
    Tailnet --> MacDaemon[Paseo on Mac]
    Tailnet --> VPSDaemon[Paseo on remote VPS]
    MacDaemon --> LocalAgents[Pi / Claude Code / Codex]
    VPSDaemon --> RemoteAgents[Pi and remote agents]
    LocalAgents --> LocalRepos[Local projects and worktrees]
    RemoteAgents --> RemoteRepos[Remote projects and worktrees]
{{</mermaid>}}

No public Paseo port. No port forwarding. Devices reach each daemon through its Tailscale address.

That was the plan anyway.

# Problem 1: The Daemon Would Not Start

I changed Paseo's `listen` value to the machine's Tailscale IP and restarted the daemon.

It immediately died.

```text
Error: Daemon failed to start (exit 1).
Error: Invalid listen string: 100.x.y.z
```

The IP was valid. Tailscale was healthy. The address existed on the machine.

I restarted again. Same crash. The remote box had the same failure.

The useful clue was not in the docs or the UI. It was in Paseo's bundled server code.

Electron applications package their JavaScript inside `app.asar`, but the source is still searchable. I used `grep -a`, found `parseListenString`, and read what it accepted.

The parser supports:

1. local sockets and named pipes;
2. a numeric port, which binds on loopback;
3. `host:port` for TCP.

A bare IP is not valid.

My configuration was effectively:

```json
{
  "listen": "100.x.y.z"
}
```

It needed a port:

```json
{
  "listen": "100.x.y.z:6767"
}
```

One colon. Daemon healthy.

The error message showed the rejected value but not the accepted format. I spent time questioning the IP when the real problem was syntax.

**Lesson:** if a parser rejects a value that looks valid, read the parser. The code often explains the contract better than the error.

# Problem 2: Phone Worked, Desktop Failed

After fixing the bind string, the daemon was healthy.

The CLI listed my agents. The phone opened a chat and loaded its full history. The desktop app showed:

> Could not load history

Then:

> This project isn't editable on this host.

The project was a directory on that exact MacBook.

That message sent me toward filesystem permissions. Wrong direction.

The project was editable. The desktop could not reach the daemon, so it could not verify the project. Everything after the failed connection was a secondary symptom presented as a different problem.

I compared the clients in the daemon's WebSocket logs:

| Client | Address | Result |
|---|---|---|
| Phone | Tailscale address | Connected, history loaded |
| CLI | Current daemon config | Connected |
| Desktop | `localhost:6767` | Never reconnected |

The desktop had cached the old loopback address.

Before the config change, Paseo listened on localhost. After the change, it listened only on the Tailscale IP. Nothing was listening on `127.0.0.1:6767` anymore.

The desktop was not failing to load history. It was failing to connect at all.

The daemon logs could not show that failure because the TCP connection never reached the daemon. A refused connection leaves no server-side client record.

The useful test was much simpler:

```bash
nc -z 127.0.0.1 6767
```

Refused.

**Lesson:** failed connections can be invisible to server logs. Test from the exact address the client uses.

# The Fix That Worked and Was Still Wrong

I changed the daemon to:

```json
{
  "listen": "0.0.0.0:6767"
}
```

Desktop reconnected instantly. Phone worked. CLI worked. History returned.

Ship it?

No.

`0.0.0.0` means every interface. On a laptop behind NAT that is sloppy. On a VPS with a public interface it can mean placing the daemon directly on the internet.

I was using Tailscale specifically to avoid that.

This is one of the easiest infrastructure mistakes to make: confuse **the symptom disappeared** with **the system is correct**.

My acceptance criterion was not "all clients connect." It was:

> All intended clients connect through the private network, and no unintended interface accepts the daemon port.

`0.0.0.0` failed that test.

# The Correct Network Fix

A machine can connect to its own Tailscale IP.

The desktop did not need localhost. It could use the same private address as the phone.

I restored the daemon to its Tailscale-only listener:

```json
{
  "listen": "100.x.y.z:6767"
}
```

Then I removed the desktop's stale host bookmark and added it again as a direct connection using the Tailscale address.

Final network state:

```text
127.0.0.1:6767       → refused
LAN/public interface → refused
Tailscale IP:6767     → healthy
```

Phone, CLI, and direct desktop connection could now reach the intended daemon without widening the listener.

I repeated the same posture on the remote box: bind to its own Tailscale address, not `0.0.0.0`.

# Problem 3: Desktop Sync Was Still Flaky

Networking was correct. The desktop app still occasionally sat on *Reconnecting*. History and workspace state drifted from what the CLI and phone showed.

This was not another Tailscale problem.

Paseo Desktop has two ways to use a daemon:

- manage its bundled internal daemon;
- connect to an external daemon as a remote host.

I had made the desktop connect to a same-machine standalone daemon as if it were remote. That added several failure points: a cached address, manual daemon restarts, and possible version drift between desktop and daemon.

The final fix was to let Paseo Desktop use its bundled daemon for same-machine work.

That path keeps the application and daemon lifecycle together. The standalone daemons remain useful for CLI, phone, and genuinely remote machines over Tailscale. The desktop does not need manual plumbing to talk to a daemon living beside it.

Settings changed. Reconnecting stopped. History and workspace state stayed in sync.

**Lesson:** same-machine client plus same-machine daemon should use the managed path. Direct connections are for remote hosts.

# The Setup I Ended Up Keeping

After all of that, the setup is straightforward:

{{<mermaid>}}
graph TB
    subgraph MacBook
        Desktop[Paseo Desktop]
        Internal[Bundled managed daemon]
        LocalHarnesses[Local agent harnesses]
        Desktop --> Internal --> LocalHarnesses
    end

    subgraph RemoteHost[Remote VPS]
        RemoteDaemon[Standalone Paseo daemon]
        RemoteHarnesses[Remote agent harnesses]
        RemoteDaemon --> RemoteHarnesses
    end

    Phone[Phone app] --> Tailnet[Tailscale]
    Tailnet --> RemoteDaemon
    MacCLI[CLI / direct remote access] --> Tailnet
{{</mermaid>}}

The exact config values are private. The design is not:

- bundled daemon for the same-machine desktop workflow;
- standalone daemon for remote hosts;
- Tailscale-only listeners for remote access;
- no `0.0.0.0` shortcut;
- SSH kept as the break-glass path.

Once that was in place, Paseo stopped being a networking project and became the tool I wanted to use.

# What It Is Like to Use

Before Paseo, remote agents meant SSH, tmux, and remembering where everything lived.

That workflow still works. I still use it when I need complete control of the machine.

Paseo changes the default view from **processes on a server** to **work happening inside a project**.

I get:

- active agents across harnesses;
- conversations and tool activity;
- project files;
- terminals;
- Git worktrees;
- diffs after agent changes;
- the same remote host from laptop and phone.

The model did not become smarter. The harness did not become more capable.

Operating it became easier.

That is the value.

# Why This Fits Pi So Well

Pi already gives me the flexibility I want: models, extensions, RPC, session trees, custom tools, and control over the harness.

What Pi intentionally does not try to be is a full cross-device development workspace.

Paseo fills that gap without replacing Pi.

```text
Pi owns how the agent works.
Paseo owns where I operate the work.
Tailscale owns how I reach the machine privately.
Git owns the code.
```

Clean boundaries.

If you want the Pi side in detail, I wrote about it in [Inside the Pi Harness](/agents/pi-harness-basics).

# The Multi-Harness Part

Paseo is not only a Pi dashboard.

Its source contains separate integrations for Claude Code, Codex, OpenCode, Pi, Oh My Pi, Copilot, and other agents. ACP-compatible CLIs can use the generic provider path.

That means I can choose a harness per task without changing the workspace around it.

Maybe I want Pi for flexibility. Claude Code for a task that works well there. Codex for implementation. A remote harness on the VPS for work that should continue after I close the laptop.

Paseo keeps the operational surface consistent while each harness remains itself.

That is much more useful than pretending all agents are interchangeable.

# What I Would Do Differently

## 1. Read the parser first

`Invalid listen string` made me inspect the IP. The failure was the missing port. The accepted format was visible in the bundled code.

## 2. Identify clients before trusting UI errors

"Could not load history" and "project isn't editable" were connection failures wearing different clothes.

Client ID, user agent, origin, and remote address told the real story.

## 3. Test refused connections from the client side

A connection that never reaches the daemon cannot appear in daemon logs.

Use `nc`, `curl`, or an equivalent probe against the exact address the client is attempting.

## 4. Define exposure before fixing connectivity

`0.0.0.0` made everything work and violated the security design.

Choose Tailscale-only first. Make clients fit that decision.

## 5. Expect every client to cache something

The daemon read the new config. The CLI read it. The desktop kept its old bookmark.

One address change can require updates in several layers.

## 6. Prefer managed local components

If the desktop app ships and manages its own daemon, let it. Manual same-machine connections add failure modes without adding value.

# Security Notes

Tailscale controls how I reach Paseo. It does not sandbox the agents.

The harness still runs with the permissions of its process on the machine. Plugins are trusted code. A private listener reduces exposure but does not make unsafe tools safe.

My baseline remains:

- non-root users;
- scoped credentials;
- Tailscale-only remote listeners;
- Git worktrees for parallel tasks;
- diff review before merge;
- no untrusted plugins;
- SSH available for diagnosis and rollback.

# My Take

Paseo is a great tool.

The setup was not five minutes. Some of that was my config. Some of it was stale client state. Some of it was error messages describing the last visible symptom instead of the first broken connection.

Once fixed, it became exactly what I wanted: a proper workspace around agents already running on my machines.

Pi still does the work. Claude Code and Codex remain their own harnesses. Tailscale keeps remote access private. Git keeps the code authoritative. Paseo ties the experience together across desktop and phone.

I do not need screenshots from a product repository to sell that. The fact that I can leave my desk, open my phone, inspect the same agent work, and continue is the whole point.

Symptoms lie. Connection tables do not.

# References

- [Paseo repository](https://github.com/getpaseo/paseo)
- [Paseo provider overview](https://paseo.sh/docs/providers)
- [Paseo connectivity guide](https://paseo.sh/docs/connectivity)
- [Paseo security documentation](https://paseo.sh/docs/security)
- [Inside the Pi Harness](/agents/pi-harness-basics)

---

{{<author>}}
