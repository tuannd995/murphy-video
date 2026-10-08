# 01 · Tổng quan dự án

## Mục tiêu
Xưởng sản xuất video **hoạt hình vẽ tay giải thích kiến thức bằng tiếng Việt** cho YouTube (chính), TikTok, Shorts, Reels và Facebook. Yêu cầu:
- chi phí thấp, render tự động, tạo lại được từng phần;
- hình ảnh nhất quán giữa các video;
- một kênh duy nhất, mở rộng ra nhiều video và nhiều series.

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
Chi tiết đầy đủ, quy tắc tầng và cache nằm ở **`10-cau-truc-du-an.md`** (đọc ngay sau file này). Tóm tắt:
```
.
├── channel.json  CLAUDE.md  .claude/  docs/      cấu hình kênh, luật, agent, skill, hook, tài liệu
├── brand/ characters/ library/ fonts/ audio/     tài nguyên dùng chung của kênh
├── templates/ series/                              intro, outro, khung kịch bản; mỗi series một file
├── cache/         kho theo hash dùng chung: images, voice, render
├── videos/<slug>/   MỖI VIDEO MỘT THƯ MỤC CON: video.json, script.ts, scenes/, data/, build/, output/<tag>/
├── ledger/cost.jsonl      sổ chi phí duy nhất
├── src/  scripts/         code dùng chung, không chứa tên kênh hay chủ đề
```
Tài liệu phong cách (copy từ kit vào project): `docs/style/STYLE.md` + ảnh mẫu, `docs/style/NARRATION.md` (= kit/05), `docs/style/VOICE-STYLE.md` (= kit/11), `docs/style/mau-kich-ban.md` (= kit/12); công cụ đo giọng `tools/voice-profile.py`; kế hoạch đã duyệt `docs/plans/`; ảnh tham khảo bên thứ ba `docs/style/private/` (gitignore).

Mã nguồn:
```
src/
  config/     index.ts (đường dẫn, timing, audio, API; đọc channel.json) · formats.ts · style.ts
  script/     types.ts · timeline.ts · load.ts (đọc video theo --video)
  components/ canvas.ts · backdrop.ts · fx.ts · icons.ts · ui.ts · subtitles.ts · frame.ts · vertical.ts
  character/  sprites.ts · lipsync.ts · (doodle.ts: nhân vật vẽ hoàn toàn bằng code, tuỳ chọn)
  audio/      synth.ts · elevenlabs.ts · voice.ts
  utils/      anim.ts · media.ts · openrouter.ts · args.ts · resolve.ts (tìm tài nguyên video→kênh→shared) · cache.ts · ledger.ts
scripts/      build-script · cost · gen-images · gen-voice · gen-sfx · build-storyboard · render · render-scene
              mix-audio · assemble · make · gen-character · character-sheet · sprite-demo · lint-narration · budget-guard
              new-video · status · gc
```
Mọi script nhận `--video <slug>`. Có thể đặt mặc định bằng biến `VIDEO` hoặc file `.current-video`.

## Các cổng duyệt (bắt buộc)
1. **KỊCH BẢN**: sau khi `kiem-duyet` chấm lời thoại theo `NARRATION.md`.
2. **STORYBOARD**: khung hình mẫu của mọi scene, chạy với ảnh placeholder hoặc ảnh có sẵn.
3. **CHI TIÊU**: báo số ảnh, số ký tự và chi phí dự kiến; chờ đúng cụm "DUYỆT CHI".
4. **FINAL**: video hoàn chỉnh, cùng các bản ngắn nếu có.

## Nguyên tắc tiền
- Ngân sách mặc định mỗi video: **$1 cho ảnh** (tối đa khoảng 20 ảnh) và **6.000 credits voice**. Đặt ở `channel.json`, mỗi video có thể ghi đè trong `video.json`.
- Mọi khoản chi ghi vào **một sổ duy nhất `ledger/cost.jsonl`** (kèm kênh, video, bước). Chi phí xưởng (nhân vật, thư viện) có `video = null`.
- Lệnh tốn tiền mặc định chạy dry-run; phải thêm `--confirm` mới gọi API thật. Hook `budget-guard` chặn lệnh `--confirm` nếu vượt ngân sách của video, kênh (theo tháng) hoặc xưởng (theo tháng).
- Ảnh, voice, clip render lưu theo hash ở `cache/`, dùng chung mọi video. Đã có thì không tạo lại. Intro, outro, CTA chỉ trả tiền một lần cho cả kênh.

## Thời lượng
**Ưu tiên YouTube 8–10 phút** (kênh bí ẩn 10–15 phút). Các bản ngắn được cắt từ cùng kịch bản và voice. Chi tiết ở `06-kenh-dinh-dang.md`.

## `.gitignore` tối thiểu
```
node_modules/
.env
videos/**/build/
videos/**/output/
cache/render/
audio/**/*.wav
docs/style/private/
.current-video
exports/
```
Có commit: `characters/*/raw/` (để tách nền lại không tốn tiền), `library/`, `cache/{images,voice}` (mất tiền mới có, xem mục 9 của file 10 về sao lưu và Git LFS), `channels/`, `ledger/`, `videos/**/data/`.
