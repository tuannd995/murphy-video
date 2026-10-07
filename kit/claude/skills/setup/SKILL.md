---
name: setup
description: Kiểm tra và hướng dẫn cài đặt môi trường (công cụ, key, mạng, gói ElevenLabs). Dùng khi mới mở dự án trên máy mới, hoặc khi lệnh báo lỗi môi trường.
---
1. Kiểm tra `node -v` (≥ 22.9), `npm -v`, `ffmpeg -version`, `ffprobe -version`, `git --version`. Nếu có Python thì kiểm tra thêm `python3 -m edge_tts --help`.
2. Kiểm tra có `.env` không. Nếu chưa có thì tạo từ `.env.example`, rồi nhờ người dùng tự điền (KHÔNG yêu cầu dán key vào chat).
3. Với từng biến OPENROUTER_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID: chỉ báo có hay không, không in giá trị.
4. Gọi endpoint miễn phí: OpenRouter `/api/v1/key` (hạn mức còn lại), ElevenLabs `/v1/voices` (key dùng được không), `/v1/user/subscription` (gói, quota; thiếu quyền thì ghi chú).
   Nếu có `HTTPS_PROXY` thì chạy với `NODE_USE_ENV_PROXY=1`.
5. `npm install` nếu chưa có node_modules. `npm run typecheck`. Render thử: `npx tsx scripts/sprite-demo.ts hero` (không tốn tiền).
6. Trả về bảng ✓/✗ cho từng mục, kèm cách sửa từng mục ✗:
   - mở mạng, nâng gói ElevenLabs Starter để dùng giọng tiếng Việt trong Library;
   - tạo key với đủ quyền (Text to Speech, Voices Read, User Read).
