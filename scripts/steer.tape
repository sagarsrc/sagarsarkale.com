Output steer.gif
Set Theme "Catppuccin Mocha"
Set FontSize 14
Set Width 1200
Set Height 420
Set Padding 10
Set Margin 4
Set Framerate 8
Set PlaybackSpeed 0.8

Hide
Type "bash scripts/orchestrator.sh &"
Enter
Sleep 500ms
Type "tmux -L pi-demo attach -t steer"
Enter
Sleep 500ms
Show
Sleep 14s
