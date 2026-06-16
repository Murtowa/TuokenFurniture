#!/usr/bin/env bash
# Claude Code status line - compact: model, shortened dir, total tokens, context %, usage
input=$(cat)

# Short model name (strip "Claude " prefix)
model=$(echo "$input" | jq -r '.model.display_name' | sed 's/^Claude //')

# Shortened directory - last 2 path components
dir=$(echo "$input" | jq -r '.workspace.current_dir')
shortdir=$(echo "$dir" | sed 's|[/\\]$||' | awk -F'[/\\\\]' '{if(NF>1) print $(NF-1)"/"$NF; else print $NF}')

# Total cumulative session tokens (input + output)
total_input=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
total_output=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
total=$(( total_input + total_output ))

# Context percentage remaining
remaining=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')

# Subscription usage (5h and 7d)
five=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty')
week=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty')

# Build output - start with model and directory
parts="$model $shortdir"

# Add total tokens if any have been used
if [ "$total" -gt 0 ]; then
  parts="$parts | T:$total"
fi

# Add context percentage if available
if [ -n "$remaining" ]; then
  parts="$parts | C:$(printf '%.0f' "$remaining")%"
fi

# Add subscription usage if available
if [ -n "$five" ]; then
  parts="$parts | 5h:$(printf '%.0f' "$five")%"
fi

if [ -n "$week" ]; then
  parts="$parts 7d:$(printf '%.0f' "$week")%"
fi

echo "$parts"
