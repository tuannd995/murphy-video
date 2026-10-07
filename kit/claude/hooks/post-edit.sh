#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit): typecheck khi sửa .ts; nhắc render khung hình mẫu khi sửa scene. exit 2 = báo lỗi cho Claude.
source "$(dirname "$0")/_json.sh"
INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | json_get tool_input.file_path)
case "$FILE" in *.ts) ;; *) exit 0 ;; esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f tsconfig.json ] || exit 0
if ! OUT=$(npx --no-install tsc --noEmit -p . 2>&1); then
  echo "Typecheck lỗi sau khi sửa $FILE:" >&2
  echo "$OUT" | head -20 >&2
  exit 2
fi
case "$FILE" in */scenes/scene*.ts)
  echo "Đã sửa scene $(basename "$FILE" .ts): nhớ render khung hình mẫu (render-scene --still=…) và xem trước khi render cả video." >&2
  exit 2 ;;
esac
exit 0
