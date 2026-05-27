Output steer-left.gif
Set Theme "Catppuccin Mocha"
Set FontSize 13
Set Width 550
Set Height 340
Set Padding 15
Set Margin 5
Set Framerate 10
Set PlaybackSpeed 0.9

Hide
Type "# agent running long task"
Enter
Sleep 200ms
Show
Type "pi --mode text -p --provider kimi-coding --model kimi-k2.6 'write a bash script that checks disk usage, monitors /var/log, and alerts via slack webhook if any partition exceeds 85%'"
Enter
Sleep 14s
Sleep 2s
