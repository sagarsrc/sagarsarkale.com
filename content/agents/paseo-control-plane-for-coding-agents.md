---
title: "Paseo + Tailscale: Setup Guide and Everything That Broke"
date: "2026-11-23"
summary: "How I connected Paseo across my MacBook, remote agent box, and phone with Tailscale — then fixed daemon binding, stale clients, missing providers, an old Pi binary, and transport failures."
description: "A practical guide to running Paseo privately over Tailscale, followed by a post-mortem of the connectivity, PATH, provider, and daemon failures I hit."
toc: true
autonumber: true
readTime: true
tags: ["Agents", "Pi", "Claude Code"]
mermaid: true
---

Before Paseo, my coding agents were easy to reach and annoying to find.

On my phone, I would open Termius, log in to the remote machine, run `tmux ls`, remember which session contained the task, attach to it, and choose the right window. Then I would repeat the same ritual on my Mac for local work.

Every session was available. Nothing was in one view.

The setup itself was solid: Pi on a remote machine, Tailscale connecting my devices, Termius as the phone terminal, and tmux keeping work alive when I disconnected. I could start a task at my desk, leave, reconnect from my phone, and continue from the same process.

What I had was remote access. What I wanted was a workspace.

Then I tried Codex through the ChatGPT app.

That was a different experience. Codex could work against a cloud VM, my Mac, or a sandbox, while the phone app gave me a much friendlier way to check progress and keep work moving. No tiny terminal panes. No remembering which tmux session contained which task. Using a coding agent from my phone finally felt natural.

It was awesome, but it also made the limitation obvious: that experience was built around GPT models.

I wanted the same freedom with Pi, Claude Code, Codex, and whatever harness or model I wanted to try next. I did not want to choose between broad model access in a terminal and a polished phone experience locked to one ecosystem.

That changed the question from **“How do I SSH into my agents?”** to **“What can sit above all of them?”**

[Paseo](https://paseo.sh) looked like the missing layer: a desktop and phone control plane for projects, agents, files, terminals, diffs, worktrees, and multiple harnesses—without replacing the harnesses themselves.

And on the phone, it looked like this:

{{<gallery caption="Paseo on my phone: multiple hosts, multiple harnesses, real sessions, and usage status in one place. Tap any screenshot to open it full size.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/03-switch-hosts.webp" alt="Paseo host selector on a phone" caption="Switch between my Mac and remote agent host.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/05-providers.webp" alt="Paseo provider list on a phone" caption="Pi, Claude Code, Codex, and other providers in one control plane.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/01-launch-session.webp" alt="Starting a Pi session with Kimi from a phone" caption="Launch Pi with a non-GPT model directly from the phone.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/02-agent-session.webp" alt="Coding agent session running on a phone" caption="Read output and continue a real coding session away from the desk.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/04-usage.webp" alt="Claude and Codex usage status in Paseo" caption="See provider usage without opening several dashboards.">}}
{{<gallery-item src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/06-workspaces.webp" alt="Paseo workspaces across local and remote hosts" caption="Projects and active sessions across both machines.">}}
{{</gallery>}}

Paseo is a great tool.

Getting it onto my Tailscale network was not the five-minute setup I expected.

This post starts with the setup I would recommend now. Then I will walk through everything that broke: an invalid listen address, a desktop client stuck on localhost, a dangerous `0.0.0.0` fix, missing Claude and Codex binaries, Paseo launching the wrong Pi version, Kimi returning 404s, and a daemon that quietly stopped after receiving `SIGTERM`.

# What We Are Setting Up

My setup has two machines:

- **MacBook Pro** — daily driver and local projects
- **Remote VPS** — always-on box for long-running agents

My phone, MacBook, and VPS are inside the same Tailscale network.

I am not publishing real hostnames, Tailscale IPs, credentials, or private configuration values. Replace the examples with values from your own tailnet.

{{<diagram src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/diagrams/private-multi-host.svg" alt="Paseo architecture across a MacBook and VPS connected through Tailscale" caption="Paseo across private hosts. Tailscale provides reachability; each host keeps its own daemon, harnesses, repositories, and sessions. Tap to expand.">}}

The important design decision is simple:

> Paseo should be reachable through Tailscale, not through a public listener.

No public port. No port forwarding. No `0.0.0.0` shortcut.

# What Paseo Actually Is

Before the guide, one distinction matters.

Paseo is not a new coding-agent harness. It is the control plane around harnesses already installed on the machine.

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

The harness owns prompts, tools, permissions, compaction, sessions, and model behavior. Paseo owns the workspace around them: projects, clients, terminals, files, diffs, worktrees, and remote access.

That separation is why this setup works for me. I already invested heavily in Pi. Paseo gives Pi a better cross-device workspace without replacing the parts I care about.

{{<diagram src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/diagrams/one-agent-turn-compact.svg" alt="One coding agent turn through Paseo, a provider adapter, a native harness, and a selected model" caption="One agent turn, with authority kept in the right layer. Paseo coordinates the workspace; the native harness owns agent behavior and sessions; Git owns code history. Tap to expand.">}}

# Step 1: Install Tailscale Everywhere

Install Tailscale on every device that needs access:

- machine running the Paseo daemon;
- laptop or desktop client;
- phone;
- any additional remote agent host.

Sign them into the same tailnet and confirm they can reach each other.

On the daemon host, get its Tailscale IPv4 address:

```bash
tailscale ip -4
```

I will use this placeholder throughout the guide:

```text
100.x.y.z
```

Before involving Paseo, test basic connectivity from another tailnet device:

```bash
ping 100.x.y.z
```

If Tailscale connectivity itself does not work, stop here. Adding Paseo creates more symptoms, not a fix.

# Step 2: Install and Verify the Agent Harnesses

Install the coding-agent CLIs you want Paseo to run. In my case:

- Pi;
- Claude Code;
- Codex.

Verify every command in the shell:

```bash
pi --version
claude --version
codex --version
```

Then record the actual executable paths:

```bash
command -v pi
command -v claude
command -v codex
```

Do not skip this.

Your interactive shell and the Paseo daemon may use different `PATH` values. A command working in your terminal does not prove Paseo can find it.

I eventually configured explicit paths similar to:

```json
{
  "agents": {
    "providers": {
      "pi": {
        "command": ["~/.pi/agent/bin/pi"],
        "enabled": true
      },
      "claude": {
        "command": ["~/.local/bin/claude"],
        "enabled": true
      },
      "codex": {
        "command": ["~/.local/bin/codex"]
      }
    }
  }
}
```

Use your own paths. The point is not to copy mine. The point is to remove ambiguity about which binary Paseo launches.

# Step 3: Install Paseo on the Host

For a headless machine or VPS:

```bash
npm install -g @getpaseo/cli
paseo
```

Check daemon state:

```bash
paseo daemon status
```

If your package manager installs `paseo` outside the daemon's normal `PATH`, use the absolute CLI path while debugging. This removes another variable.

The desktop app can manage its own bundled daemon on the same machine. I recommend using that managed path for local Mac projects instead of treating the same-machine daemon as an external remote host.

One Mac setting turned out to be essential: the desktop app must attach to the daemon and Paseo home that contain your local sessions.

Open the Mac host in Paseo, go to **Overview**, and verify:

- daemon status is **running**;
- **Manage built-in daemon** is enabled;
- the bottom of the page says **Attached to an existing daemon**;
- the attached Paseo home is the one you expect. In my case, it was `/Users/sagar/.paseo`.

{{<diagram src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/macbook-attached-daemon.png" alt="Paseo Desktop Overview showing the Mac app attached to its existing local daemon" caption="The Mac desktop attached to its local Paseo daemon and existing Paseo home. Tap to expand.">}}

This was easy to miss because remote access still worked. I could see sessions and messages from my phone while the local Mac app looked empty. The phone was connected to the working daemon; the desktop app was not attached to the same local state.

For same-machine work, attach the desktop app to its own managed daemon. Use standalone daemons for genuinely remote machines.

# Step 4: Bind the Remote Daemon to Its Tailscale Address

For a remote daemon, configure `listen` with both host and port:

```json
{
  "listen": "100.x.y.z:6767"
}
```

A bare IP is not valid:

```json
{
  "listen": "100.x.y.z"
}
```

Paseo's parser expects `host:port` for TCP.

Restart or reload Paseo after the change:

```bash
paseo reload
```

If a full restart is required:

```bash
paseo daemon restart
```

Then confirm it is listening on the Tailscale address:

```bash
ss -lntp | grep 6767
```

The good state is:

```text
100.x.y.z:6767 → listening
0.0.0.0:6767   → not listening
```

# Step 5: Connect the Clients

For a remote host, add a direct Paseo connection using:

```text
100.x.y.z:6767
```

Use the Tailscale IP from that host. Do not use its public IP.

My final client split is:

- **Paseo Desktop on the Mac:** bundled managed daemon for local work;
- **phone:** direct Tailscale connection to remote daemons;
- **CLI:** local or direct remote connection as needed;
- **remote VPS:** standalone daemon bound to its Tailscale IP.

If you change a daemon address, remove stale host bookmarks and add them again. Clients can cache the old address even after the daemon has moved.

# Step 6: Validate Providers From Paseo's Environment

Run Paseo's provider diagnostics:

```bash
paseo provider diagnostic pi
paseo provider diagnostic claude
paseo provider diagnostic codex
```

Check:

- configured command;
- resolved executable path;
- version;
- authentication status;
- available models;
- final readiness status.

For Pi, I now expect the diagnostic to resolve the managed Pi installation, not an old global binary.

Example of the important fields:

```text
Command source: override
Resolved path: ~/.pi/agent/bin/pi
Version: current installed version
Models: discovered
Status: Ready
```

# Step 7: Run a Disposable End-to-End Test

Do not start with your most important repository.

1. Create a scratch Git repository.
2. Open it in Paseo.
3. Start one agent.
4. Ask it to create or edit a small file.
5. Inspect the tool activity.
6. Review the diff in Paseo.
7. Open the same repository through the native harness.
8. Confirm the files and native session still behave as expected.
9. Connect from the phone.
10. Restart the daemon and reconnect.

The repository and native harness data should remain authoritative. Paseo should be a replaceable control surface around them.

# Step 8: Verify the Exposure Model

From the daemon host:

```bash
ss -lntp
```

From a device inside the tailnet:

```bash
nc -z 100.x.y.z 6767
```

From interfaces that should not expose Paseo, the port should be unavailable.

Do not stop at "the app connects." Verify where the daemon is listening.

That is the setup I wish I had started with.

Now the fun part.

# Problem 1: The Daemon Would Not Start

I set `listen` to the machine's Tailscale IP and restarted Paseo.

It crash-looped.

```text
Error: Daemon failed to start (exit 1).
Error: Invalid listen string: 100.x.y.z
```

The IP was valid. Tailscale was healthy. The address existed on the machine.

I searched Paseo's bundled server code. Electron packages JavaScript inside `app.asar`, but plaintext strings and code remain searchable with `grep -a`.

`parseListenString` accepted:

1. local sockets and named pipes;
2. a numeric port on loopback;
3. `host:port` for TCP.

My config had a bare IP. The missing port stopped bootstrap before anything could listen.

Wrong:

```json
"listen": "100.x.y.z"
```

Correct:

```json
"listen": "100.x.y.z:6767"
```

One colon. Daemon healthy.

**Lesson:** when a config parser rejects something that looks valid, read the parser. The error named the value, not the rule.

# Problem 2: Phone Worked, Desktop Failed

After fixing the listener:

- CLI worked;
- phone loaded the complete chat history;
- desktop showed `Could not load history`;
- desktop claimed the project was not editable on its own host.

The project permissions were fine.

The desktop had cached `localhost:6767`. The daemon now listened only on the Tailscale IP. Nothing accepted loopback connections anymore.

The daemon logs could not show this failure because the desktop never completed a TCP connection. There was no server-side client record to inspect.

The useful test was:

```bash
nc -z 127.0.0.1 6767
```

Refused.

The UI errors were downstream symptoms of a dead connection.

**Lesson:** failed connections are invisible to server logs. Test from the exact address the client uses.

# The Wrong Fix: `0.0.0.0`

To confirm the listener mismatch, I temporarily changed the daemon to:

```json
"listen": "0.0.0.0:6767"
```

Everything reconnected instantly.

It was also the wrong fix.

`0.0.0.0` listens on every interface. On a VPS, that can place the daemon on the public internet. Tailscale was supposed to prevent exactly that.

My acceptance criterion was not "all clients connect." It was:

> All intended clients connect through Tailscale, and no unintended interface accepts the daemon port.

`0.0.0.0` fixed the symptom and violated the design.

# The Correct Network Fix

A machine can connect to its own Tailscale IP.

I restored the Tailscale-only listener:

```json
"listen": "100.x.y.z:6767"
```

Then I removed the stale desktop host bookmark and added a direct connection using the Tailscale address.

Verified state:

```text
Tailscale IP:6767     → healthy
LAN/public interface → refused
```

I used the same posture on the remote host.

# Problem 3: Desktop Sync Stayed Flaky

The network was now correct. The desktop still got stuck on *Reconnecting*. Workspace state and history drifted from what the CLI and phone showed.

The funniest symptom was that I could see the messages on my phone but not in Paseo on the Mac that was running them.

The desktop supports two daemon paths:

- bundled daemon managed by the desktop app;
- external daemon connected as a remote host.

I was using the external path for a daemon on the same machine. That added cached addresses, manual restarts, and possible version drift for no benefit. More importantly, the desktop was not attached to the same local Paseo home.

I switched the Mac desktop back to its bundled managed daemon and confirmed **Attached to an existing daemon** pointed at `/Users/sagar/.paseo`.

The missing local messages appeared and sync issues disappeared.

The standalone daemon remains the right model for remote machines and direct Tailscale clients. The local desktop should manage—and attach to—its own local daemon.

**Lesson:** use the managed path for same-machine components, and verify the attached Paseo home. Use direct connections for actual remote hosts.

# Problem 4: Claude and Codex Were Installed but Unavailable

Paseo diagnostics said:

```text
Configured command: codex
PATH matches: none
Resolved path: not found
Status: Unavailable
```

Claude Code showed the same failure.

My interactive shell resolved both commands correctly.

The difference was `PATH`.

My shell startup files added `~/.local/bin`. The Paseo daemon used a restricted environment that did not include that directory.

The fix was to configure absolute provider commands in `~/.paseo/config.json`, then reload Paseo.

```json
{
  "agents": {
    "providers": {
      "claude": {
        "command": ["~/.local/bin/claude"],
        "enabled": true
      },
      "codex": {
        "command": ["~/.local/bin/codex"]
      }
    }
  }
}
```

**Lesson:** "works in my shell" says nothing about a background daemon until you compare their environments.

# Problem 5: Pi Worked Natively but Kimi Returned 404 in Paseo

Pi agents launched through Paseo started returning errors like:

```text
404 resource_not_found_error
model=kimi-coding/k3
```

Several Kimi model IDs failed.

The same Kimi model worked in native Pi on the same machine. That proved the model ID, endpoint, and account were not generally broken.

Paseo's diagnostic exposed the difference:

```text
Paseo Pi path: /usr/local/bin/pi
Paseo Pi version: 1.1.0
```

My interactive shell used:

```text
Native Pi path: ~/.pi/agent/bin/pi
Native Pi version: 1.6.0
```

Two Pi installations. Paseo selected the stale global one.

Updating managed Pi had not replaced `/usr/local/bin/pi`, so Paseo kept launching the old runtime.

I added an explicit Pi provider command:

```json
{
  "agents": {
    "providers": {
      "pi": {
        "command": ["~/.pi/agent/bin/pi"],
        "enabled": true
      }
    }
  }
}
```

After reload, Paseo reported the intended Pi version, discovered the models, found Pi auth state, and returned `Ready`.

The Kimi failures stopped.

**Lesson:** when native and managed execution disagree, compare the exact executable before debugging the model provider.

# Problem 6: `transport failed`

Later the desktop reported:

```text
transport failed
```

At this point I knew not to blame Tailscale first.

Daemon status showed no PID and no active listener. `ss -lntp` confirmed nothing was listening on port `6767`.

The daemon log showed a clean shutdown:

- worker received `SIGTERM`;
- active Pi RPC process exited;
- in-flight turn was marked failed;
- WebSocket server closed;
- supervisor exited with code `0`.

This was not a daemon crash and not a Tailscale failure. Something external stopped the daemon cleanly. The log did not identify which process sent the signal.

I restarted Paseo, confirmed the listener, watched the desktop complete a WebSocket handshake, and reran provider diagnostics.

The turn active during shutdown had to be retried.

**Lesson:** `transport failed` describes the client symptom. Check whether a transport server still exists before debugging the network.

# My Recovery Runbook

When a client reports a transport failure:

1. Check daemon state:

   ```bash
   paseo daemon status
   ```

2. Check the listener:

   ```bash
   ss -lntp | grep 6767
   ```

3. Inspect recent daemon events before restarting:

   ```bash
   tail -n 300 ~/.paseo/daemon.log
   ```

4. Start the daemon if stopped:

   ```bash
   paseo daemon start
   ```

5. Confirm the client completes a WebSocket handshake in the log.
6. Rerun provider diagnostics.
7. Confirm Pi resolves to the intended executable and version.
8. Retry any turn interrupted by shutdown.

If a provider is installed but unavailable:

1. Run its Paseo diagnostic.
2. Compare daemon `PATH` with `command -v` in the shell.
3. Check for duplicate installations.
4. Add an explicit command override.
5. Reload Paseo.
6. Rerun the diagnostic until it reports the expected path and version.

{{<diagram src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/agents/paseo-control-plane-for-coding-agents/diagrams/failure-isolation.svg" alt="Paseo failure isolation path from client connectivity through daemon, provider, harness, and process lifetime" caption="Diagnose the failed layer instead of changing everything at once. SSH remains the recovery path; neither Paseo nor Tailscale is an agent sandbox. Tap to expand.">}}

# What Paseo Changed for Me

The terminal ritual from the introduction has not disappeared. It became the fallback instead of the default.

Now I open Paseo and see my local and remote projects, active sessions, agents, conversations, and usage in one place. I choose the work, not the machine and terminal window that happen to contain it.

SSH and tmux remain my break-glass path. Paseo changes the default view from **processes scattered across machines** to **work organized by project**.

I get:

- active agents across harnesses;
- conversations and tool activity;
- files and terminals;
- Git worktrees;
- diffs after agent changes;
- remote hosts from laptop and phone.

The model did not become smarter. The harness did not become more capable.

Operating it became easier.

That is the value.

# More Freedom Over How I Work

What drew me to Pi was the freedom to choose my models, extend the tools, and shape the harness around how I work.

Paseo gives me that same freedom at the workspace level. I can use Pi, Claude Code, or Codex, run sessions on my Mac or a remote machine, and pick up the work from my laptop or phone.

I can try a different harness without giving up the workspace, or change devices without rebuilding my workflow. The model, harness, machine, and client become choices I can make separately.

```text
Pi owns how the agent works.
Paseo owns where I operate the work.
Tailscale owns how I reach the machine privately.
Git owns the code.
```

If you want the Pi side in detail, read [Inside the Pi Harness](/agents/pi-harness-basics).

# Security Notes

Tailscale controls how I reach Paseo. It does not sandbox the agents.

The harness still runs with the permissions of its process. Plugins are trusted code. A private listener reduces network exposure but does not make unsafe tools safe.

My baseline:

- non-root users;
- scoped credentials;
- Tailscale-only remote listeners;
- explicit provider binaries;
- Git worktrees for parallel tasks;
- diff review before merge;
- no untrusted plugins;
- SSH available for diagnosis and rollback.

# My Take

Paseo is a great tool.

The final setup is not complicated. Reaching it required understanding which process owned each failure.

The daemon parser rejected a bare IP. The desktop cached localhost. `0.0.0.0` fixed connectivity by breaking the exposure model. The daemon could not see shell-installed binaries. Paseo selected an old Pi executable. A later transport error was simply a stopped daemon.

Every symptom pointed one layer away from the cause.

Once fixed, Paseo became exactly what I wanted: a proper workspace around agents already running on my machines.

Pi still does the work. Claude Code and Codex remain their own harnesses. Tailscale keeps remote access private. Git keeps the code authoritative. Paseo ties the experience together across desktop and phone.

Symptoms lie. Connection tables do not.

# References

- [Paseo repository](https://github.com/getpaseo/paseo)
- [Paseo provider overview](https://paseo.sh/docs/providers)
- [Paseo connectivity guide](https://paseo.sh/docs/connectivity)
- [Paseo security documentation](https://paseo.sh/docs/security)
- [Inside the Pi Harness](/agents/pi-harness-basics)

---

{{<author>}}
