#!/usr/bin/env bash
# Stop: trước khi kết thúc lượt, đảm bảo code không lỗi typecheck và nhắc commit. Chặn tối đa 1 lần (tránh vòng lặp).
source "$(dirname "$0")/_json.sh"
INPUT=$(cat)
[ "$(printf '%s' "$INPUT" | json_get stop_hook_active)" = "true" ] && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
MSG=""
if [ -f tsconfig.json ] && [ -d node_modules ] && ! npx --no-install tsc --noEmit -p . >/dev/null 2>&1; then
  MSG="Typecheck đang lỗi (npm run typecheck). "
fi
if git rev-parse --is-inside-work-tree >/dev/null 2>&1 && [ -n "$(git status --porcelain -- . ':!output' 2>/dev/null)" ]; then
  MSG="${MSG}Còn thay đổi chưa commit: commit nếu bước này đã hoàn chỉnh."
fi
[ -n "$MSG" ] && { echo "$MSG" >&2; exit 2; }
exit 0
