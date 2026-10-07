#!/usr/bin/env bash
# PostToolUse(ExitPlanMode): lưu kế hoạch đã trình bày vào docs/plans/
source "$(dirname "$0")/_json.sh"
INPUT=$(cat)
PLAN=$(printf '%s' "$INPUT" | json_get tool_input.plan)
[ -n "$PLAN" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
mkdir -p docs/plans
F="docs/plans/$(date +%Y-%m-%d-%H%M).md"
printf '%s\n' "$PLAN" > "$F"
echo "Đã lưu kế hoạch vào $F"
exit 0
