# Heartbeat Check List

IMPORTANT: First read your skill file to understand available tools:
Use the exec tool to run: cat ~/.picoclaw/workspace/skills/oluto/SKILL.md

## Task: Daily Financial Briefing

Use the exec tool to run this EXACT command (it handles auth automatically):
bash ~/.picoclaw/workspace/skills/oluto/scripts/oluto-briefing.sh

DO NOT attempt to curl APIs directly. DO NOT guess credentials or URLs.
The script handles all authentication and API calls internally.

After running the script, summarize the JSON output covering:
- Cash position (safe_to_spend from dashboard)
- Recent transactions (count and top 3 largest)
- Overdue invoices (total amount and count)
- Overdue bills (total amount and count)
- Up to 3 prioritized action items

If all data looks healthy and nothing needs attention, respond ONLY with: HEARTBEAT_OK
If any data is actionable (overdue items, unusual transactions), report it.
