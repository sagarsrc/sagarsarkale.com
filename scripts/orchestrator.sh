#!/bin/bash
# Orchestrator: sets up tmux + pi rpc, sends prompt, waits, sends steer

tmux -L pi-demo kill-server 2>/dev/null
sleep 0.3
rm -f /tmp/pi-rpc-fifo && mkfifo /tmp/pi-rpc-fifo

tmux -L pi-demo new-session -s steer -x 160 -y 24 -d
tmux -L pi-demo split-window -h -t steer:0.0
tmux -L pi-demo select-layout even-horizontal
tmux -L pi-demo select-pane -t 0 -T agent
tmux -L pi-demo select-pane -t 1 -T operator

# Start pi rpc in pane 0
tmux -L pi-demo send-keys -t 0 'pi --mode rpc --provider kimi-coding --model kimi-k2.6 < /tmp/pi-rpc-fifo' Enter

sleep 1

# Send prompt in pane 1
tmux -L pi-demo send-keys -t 1 'bash scripts/pi-steer-prompt.sh' Enter

# Wait then steer with visual marker
sleep 4
tmux -L pi-demo send-keys -t 1 'clear' Enter
sleep 200ms
tmux -L pi-demo send-keys -t 1 'echo "" && echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && echo "  >>> STEER SENT <<<" && echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && echo ""' Enter
sleep 200ms
tmux -L pi-demo send-keys -t 1 'bash scripts/pi-steer-send.sh' Enter
