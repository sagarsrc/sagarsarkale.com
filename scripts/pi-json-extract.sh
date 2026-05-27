#!/bin/bash
# Extract text from Pi JSON mode — clean output
pi --mode json -p --provider kimi-coding --model kimi-k2.6 "$1" 2>/dev/null | jq -r 'select(.type=="message_update") | select(.assistantMessageEvent.type=="text_delta") | .assistantMessageEvent.delta' 2>/dev/null
