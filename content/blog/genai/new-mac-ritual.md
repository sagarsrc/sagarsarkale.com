---
title: "The New Mac Ritual: A Dev Setup Playbook"
date: "2026-04-24"
summary: "Personal log for setting up a fresh MacBook — so I don't have to think about it next time"
description: "Personal reference: every tool, config, and command I need on a fresh Mac"
toc: true
readTime: true
autonumber: false
math: false
tags: ["DeepDive"]
showTags: true
hideBackToTop: false
mermaid: false
cover: "https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/macbook/mac-setup-cover.jpeg"
---

Personal reference. Every time i get a new Mac i waste half a day remembering what to install and in what order. This is the log.

# 0. The Fast Path

Most of the dev environment — Claude Code, ghostty config, tmux, neovim, statusline, karabiner, skills — is automated via the [claude-config](https://github.com/quickcall-dev/claude-config) installer:

```bash
git clone git@github.com:quickcall-dev/claude-config.git
cd claude-config
./install.sh
```

Pick modules interactively or pass them directly:

```bash
./install.sh tmux ghostty claude statusline
```

Available modules: `claude`, `ghostty`, `tmux`, `nvim`, `karabiner`, `node`, `skills`, `statusline`, `caveman`.

The rest of this log covers what the installer doesn't touch — browsers, productivity apps, system settings.

# 1. Package Manager

**Homebrew** — everything else depends on this, do it first.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

# 2. Browser

Ditch the default browser, this is probably the very first step most of us do.

- **Brave** — install manually from brave.com

## Browser Extensions

- **[Quick Tab](https://chromewebstore.google.com/detail/ldlghkoiihaelfnggonhjnfiabmaficg)** — command palette for tabs. Cmd+Shift+K, type a few chars, jump. Replaces frantic Cmd+Tab hunting when you have 40 tabs open.

# 3. Developer Tools

```bash
brew install --cask zed
brew install --cask ghostty
curl -fsSL https://claude.ai/install.sh | bash   # Claude Code
brew install zoxide
```

**Speedtest CLI:**
```bash
brew tap teamookla/speedtest
brew update
brew install speedtest --force
```

Add zoxide to `~/.zshrc`:
```bash
eval "$(zoxide init zsh)"
```

# 4. Terminal: Ghostty + tmux

tmux is the actual terminal manager. Ghostty is just the window. Configure Ghostty to auto-attach to tmux on every open:

`~/Library/Application Support/com.mitchellh.ghostty/config.ghostty`:
```
command = /opt/homebrew/bin/tmux new-session -A -s main
confirm-close-surface = false
macos-titlebar-style = hidden
macos-titlebar-proxy-icon = hidden
term = xterm-256color
mouse-hide-while-typing = true
```

tmux config lives in the [claude-config repo](https://github.com/quickcall-dev/claude-config). Clone it and symlink:
```bash
git clone git@github.com:quickcall-dev/claude-config.git
ln -sf ~/path/to/claude-config/tmux/.tmux.conf ~/.tmux.conf
```

Install TPM plugins: `Ctrl+b I` inside tmux.

# 5. Shell

**powerlevel10k:**
```bash
brew install powerlevel10k
echo "source $(brew --prefix)/share/powerlevel10k/powerlevel10k.zsh-theme" >>~/.zshrc
```
Restart terminal → follow wizard.

# 6. Notes & Knowledge

```bash
brew install --cask notion
brew install --cask obsidian
```

- **Goodnotes** — [App Store](https://apps.apple.com/in/app/goodnotes-ai-notes-docs-pdf/id1444383602)
- **Presentify** (screen annotation) — [App Store](https://apps.apple.com/in/app/presentify-screen-annotation/id1507246666?mt=12)

# 7. Productivity & Window Management

```bash
brew install --cask raycast
brew install --cask rectangle
```

- **Shortcat** — click any UI element without the mouse. Trigger with a hotkey, type the label, hit Enter. Replaces reaching for the trackpad 90% of the time. `brew install --cask shortcat`
- **AltTab** — windows/linux style app switcher, switches by each open window (not just app). Way better than Cmd+Tab for heavy multitaskers. `brew install --cask alt-tab`
- **Contexts** — https://contexts.co/ (save license file → double-click in Finder to activate)
- **KeepingYouAwake** — https://keepingyouawake.app/

# 8. Display & System

```bash
brew install --cask betterdisplay
brew install --cask aldente        # cap battery at 80%
brew install stats                 # RAM, CPU, GPU, network monitor in menu bar
```

- Trackpad: max speed in System Settings
- Brightness: turn off auto
- Accessibility → Reduce Motion: on
- Stop Dock icon bouncing on notifications:

```bash
defaults write com.apple.dock no-bouncing -bool true && killall Dock
```

# 9. Communication & Media

```bash
brew install --cask spotify
brew install --cask vlc
```

- **Slack** — install manually

---

{{<author>}}
