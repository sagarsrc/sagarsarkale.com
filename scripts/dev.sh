#!/bin/bash
set -euo pipefail

SESSION="sagarsarkale-dev"

tmux has-session -t "$SESSION" 2>/dev/null && {
  echo "tmux session '$SESSION' already running. attaching..."
  exec tmux attach-session -t "$SESSION"
}

# kill any stale next dev processes for this project
echo "killing stale next dev processes..."
pkill -f "next dev" || true
sleep 1

echo "starting dev server in tmux session '$SESSION'..."
tmux new-session -d -s "$SESSION" -n dev

# run dev inside tmux, capture cwd
tmux send-keys -t "$SESSION:dev" "cd '$(pwd)' && npm run dev" C-m

# attach
tmux attach-session -t "$SESSION"
