# Pi Harness: Three Consumption Modes
# ASCII cinema — separate tmux socket (-L pi-demo)

Output pi-modes-demo.gif

Set FontSize 14
Set Width 1500
Set Height 480
Set Framerate 10
Set PlaybackSpeed 0.8

Hide

# Clean slate on separate socket
Type "tmux -L pi-demo kill-server 2>/dev/null; true"
Enter
Sleep 300ms

# Fresh tmux on separate socket
Type "tmux -L pi-demo new-session -s pi -x 200 -y 26 -d"
Enter
Sleep 300ms
Type "tmux -L pi-demo split-window -h -t pi:0.0"
Enter
Sleep 200ms
Type "tmux -L pi-demo split-window -h -t pi:0.1"
Enter
Sleep 200ms
Type "tmux -L pi-demo select-layout even-horizontal"
Enter
Sleep 300ms

# Fire all 3 simultaneously
Type "tmux -L pi-demo send-keys -t 0 'bash scripts/pi-demo-text.sh' Enter"
Enter
Sleep 50ms
Type "tmux -L pi-demo send-keys -t 1 'bash scripts/pi-demo-json.sh' Enter"
Enter
Sleep 50ms
Type "tmux -L pi-demo send-keys -t 2 'bash scripts/pi-json-extract.sh python one-liner hello world' Enter"
Enter
Sleep 50ms

# Attach and show
Type "tmux -L pi-demo attach -t pi"
Enter
Sleep 500ms
Show

# Wait for output
Sleep 15s

# Hold
Sleep 3s
