# 01 · Tổng quan dự án

## Mục tiêu
Xưởng sản xuất video **hoạt hình vẽ tay giải thích kiến thức bằng tiếng Việt** cho YouTube (chính), TikTok, Shorts, Reels và Facebook. Yêu cầu:
- chi phí thấp, render tự động, tạo lại được từng phần;
- hình ảnh nhất quán giữa các video;
- mở rộng ra nhiều kênh và nhiều video.

**Không dùng AI tạo video.** Chuỗi xử lý:
```
kịch bản (TS) → ảnh nền AI (OpenRouter, mỗi cảnh 1 ảnh) + bộ tư thế nhân vật (tạo 1 lần, dùng lại)
→ animation bằng code (canvas, Node) → voice-over (ElevenLabs, mỗi câu 1 file)
→ SFX + nhạc nền (tổng hợp bằng code) → mix audio → FFmpeg → MP4 + phụ đề .srt (Việt/Anh)
```

## Công nghệ
- Node ≥ 22 + TypeScript (chạy bằng `tsx`), `@napi-rs/canvas` (vẽ frame, có prebuilt, không cần build native).
- FFmpeg / ffprobe (encode, decode audio, ghép, loudnorm).
- OpenRouter (tạo ảnh, model mặc định `google/gemini-2.5-flash-image`). Có thể đổi model qua biến môi trường.
- ElevenLabs (TTS tiếng Việt). Phương án miễn phí: `edge-tts` (Python), chỉ chạy được khi mạng cho WebSocket.
- Không dùng Remotion, Puppeteer, React. Mỗi frame vẽ trực tiếp lên canvas rồi pipe raw RGBA vào ffmpeg.

## Cấu trúc thư mục (đích cuối)
```
.
├── CLAUDE.md                      luật chung cho mọi agent (07-claude-setup.md)
├── .claude/
│   ├── settings.json              hooks
│   ├── agents/*.md                8 agent chuyên môn
│   ├── skills/<tên>/SKILL.md      công thức cho từng việc
│   └── hooks/*.sh
├── docs/
│   ├── style/STYLE.md             phong cách hình ảnh + ảnh mẫu (copy từ kit/assets/style)
│   ├── style/NARRATION.md         phong cách lời thoại (= kit/05-loi-thoai.md)
│   ├── style/private/             ảnh tham khảo của bên thứ ba (GITIGNORE, không commit)
│   ├── plans/                     kế hoạch đã duyệt (hook lưu tự động)
│   └── HUONG-DAN.md
├── channels/<kenh>/channel.json   tên, tagline, giọng văn, palette, intro/outro, voice, nhạc, CTA
├── characters/<id>/
│   ├── <id>.json                  mô tả, ảnh model sheet, danh sách tư thế
│   ├── raw/<pose>.png             ảnh gốc nền trơn (AI hoặc tự vẽ)
│   ├── poses/<pose>.png           đã tách nền (PNG trong suốt)
│   └── sheet.png                  tờ xem trước
├── library/
│   ├── backgrounds/<id>.png + index.json   nền dùng lại, có tag (bếp, phố, văn phòng…)
│   └── props/
├── videos/<kenh>/<slug>/
│   ├── script.ts                  kịch bản (nguồn chính, có type)
│   ├── scenes/sceneXX.ts          animation từng scene
│   ├── data/                      script.json, storyboard*.json, cost.json, alignment/, review.md, feedback.json
│   ├── assets/images/             ảnh nền riêng của video (ít nhất có thể, ưu tiên library)
│   ├── assets/voice/              <hash-câu>.mp3 (+ .json timestamp)
│   └── output/                    (gitignore) scenes/*.mp4, audio-mix.wav, <slug>[-<định dạng>].mp4, .srt
├── assets/fonts/  assets/sfx/  assets/music/   (sfx/music tạo lại được → gitignore *.wav)
├── src/
│   ├── config/   index.ts (đường dẫn, timing, audio, API) · formats.ts · style.ts
│   ├── script/   types.ts · timeline.ts · load.ts (đọc video theo --video)
│   ├── components/ canvas.ts · backdrop.ts · fx.ts · icons.ts · ui.ts · subtitles.ts · frame.ts · vertical.ts
│   ├── character/ sprites.ts · lipsync.ts · (doodle.ts: nhân vật vẽ hoàn toàn bằng code, tuỳ chọn)
│   ├── audio/    synth.ts · elevenlabs.ts · voice.ts
│   └── utils/    anim.ts · media.ts · openrouter.ts · args.ts
└── scripts/      build-script · cost · gen-images · gen-voice · gen-sfx · build-storyboard · render · render-scene
                  mix-audio · assemble · make · gen-character · character-sheet · sprite-demo · lint-narration · budget-guard
```
Mọi script nhận `--video <kenh>/<slug>`. Có thể đặt mặc định bằng biến `VIDEO` hoặc file `.current-video`.

## Các cổng duyệt (bắt buộc)
1. **KỊCH BẢN**: sau khi `kiem-duyet` chấm lời thoại theo `NARRATION.md`.
2. **STORYBOARD**: khung hình mẫu của mọi scene, chạy với ảnh placeholder hoặc ảnh có sẵn.
3. **CHI TIÊU**: báo số ảnh, số ký tự và chi phí dự kiến; chờ đúng cụm "DUYỆT CHI".
4. **FINAL**: video hoàn chỉnh, cùng các bản ngắn nếu có.

## Nguyên tắc tiền
- Ngân sách mặc định mỗi video: **$1 cho ảnh** (tối đa khoảng 20 ảnh) và **6.000 credits voice**.
- Mọi khoản chi ghi vào `videos/.../data/cost.json`. Bộ nhân vật và thư viện nền ghi vào `data/cost-library.json`.
- Lệnh tốn tiền mặc định chạy dry-run; phải thêm `--confirm` mới gọi API thật. Hook `budget-guard` chặn lệnh `--confirm` nếu vượt ngân sách.
- Ảnh và voice lưu theo hash nội dung (prompt / câu thoại). Đã có thì không tạo lại.

## Thời lượng
**Ưu tiên YouTube 8–10 phút** (kênh bí ẩn 10–15 phút). Các bản ngắn được cắt từ cùng kịch bản và voice. Chi tiết ở `06-kenh-dinh-dang.md`.

## `.gitignore` tối thiểu
```
node_modules/
.env
**/output/
assets/sfx/*.wav
assets/music/*.wav
docs/style/private/
.current-video
```
Có commit: `characters/*/raw/` (để tách nền lại không tốn tiền), `library/`, `videos/*/*/assets/` (ảnh, voice), `data/*.json`.
