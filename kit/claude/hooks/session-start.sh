#!/usr/bin/env bash
# SessionStart: kiểm tra nhanh môi trường; stdout được đưa vào ngữ cảnh của Claude.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
# máy có proxy: fetch của Node cần NODE_USE_ENV_PROXY=1 (Node ≥ 22.21)
if [ -n "${HTTPS_PROXY:-}${https_proxy:-}" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export NODE_USE_ENV_PROXY=1' >> "$CLAUDE_ENV_FILE"
fi
ok() { command -v "$1" >/dev/null 2>&1 && echo "✓ $1" || echo "✗ $1 (chưa cài)"; }
echo "[xưởng video] kiểm tra môi trường:"
ok node; ok ffmpeg; ok ffprobe
[ -d node_modules ] && echo "✓ node_modules" || echo "✗ node_modules: chạy npm install"
if [ -f .env ]; then
  for k in OPENROUTER_API_KEY ELEVENLABS_API_KEY ELEVENLABS_VOICE_ID; do
    grep -qE "^$k=.+" .env && echo "✓ $k" || echo "✗ $k trống trong .env"
  done
else
  echo "✗ chưa có .env (copy .env.example → .env rồi điền key)"
fi
[ -f .current-video ] && echo "Video đang làm: $(cat .current-video)"
exit 0
