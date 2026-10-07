#!/usr/bin/env bash
# SubagentStop: ghi 1 dòng nhật ký mỗi khi một agent con làm xong.
source "$(dirname "$0")/_json.sh"
INPUT=$(cat)
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
mkdir -p data
AGENT=$(printf '%s' "$INPUT" | json_get agent_type)
echo "$(date -Iseconds) subagent-stop ${AGENT:-?} session=$(printf '%s' "$INPUT" | json_get session_id | cut -c1-8)" >> data/activity.log
exit 0
