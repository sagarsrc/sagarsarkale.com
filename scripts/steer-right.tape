Output steer-right.gif
Set Theme "Catppuccin Frappe"
Set FontSize 14
Set Width 350
Set Height 340
Set Padding 15
Set Margin 5
Set Framerate 10
Set PlaybackSpeed 0.9

Hide
Type "# operator mid-execution"
Enter
Sleep 200ms
Show
Type "pi steer --session abc123 --message 'add error handling, logging, and a dry-run flag'"
Enter
Sleep 1s
Type "# agent picks up steer"
Enter
Sleep 1s
Type "# output now includes:"
Enter
Sleep 500ms
Type "# set -e, trap ERR, logger, --dry-run"
Enter
Sleep 12s
