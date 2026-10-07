#!/usr/bin/env bash
# PreToolUse(Bash): lệnh tốn tiền (--confirm) phải qua kiểm tra ngân sách. exit 2 = chặn lệnh, stderr gửi lại cho Claude.
source "$(dirname "$0")/_json.sh"
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | json_get tool_input.command)
case "$CMD" in *--confirm*) ;; *) exit 0 ;; esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if [ ! -f scripts/budget-guard.ts ]; then
  echo "budget-guard: chưa có scripts/budget-guard.ts nên chưa kiểm được ngân sách. Hãy tạo script đó trước khi chạy lệnh --confirm." >&2
  exit 2
fi
if ! OUT=$(npx --no-install tsx --env-file-if-exists=.env scripts/budget-guard.ts "$CMD" 2>&1); then
  echo "Bị chặn bởi budget-guard: $OUT" >&2
  echo "Nhắc: chỉ chạy --confirm sau khi đã dry-run và người dùng trả lời 'DUYỆT CHI'." >&2
  exit 2
fi
exit 0
