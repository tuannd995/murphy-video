# Nghịch lý Murphy — video giáo dục 5 phút (AI image + JavaScript animation)

Pipeline tạo video storytelling tiếng Việt (~4:50) với subtitle song ngữ Việt/Anh, **không dùng AI video**:

```
script (TS) → AI image (OpenRouter, 14 ảnh) → canvas animation (Node) → voice-over (edge-tts)
→ SFX + nhạc tổng hợp local → mix audio → FFmpeg → MP4 + .srt
```

## Chi phí (ngân sách $2)

| Hạng mục | Cách làm | Chi phí |
|---|---|---|
| Kịch bản song ngữ | Claude viết trực tiếp trong `src/script/murphy.ts` | $0 |
| 13 key visual + 1 character reference | OpenRouter `google/gemini-2.5-flash-image`, 16:9 | ~$0.04/ảnh → **~$0.55** |
| Voice-over tiếng Việt | ElevenLabs `eleven_turbo_v2_5` (~3.400 ký tự ≈ 1.700 credits, nằm trong gói free 10k/tháng); hoặc edge-tts miễn phí | $0 với gói free |
| Nhạc nền (2 track) + 15 SFX | tổng hợp bằng code (`src/audio/synth.ts`) | $0 |
| Animation + render | `@napi-rs/canvas` + FFmpeg, chạy local | $0 |

Mọi lệnh gọi API có tính phí đều phải qua bước kiểm tra chi phí. Sổ chi tiêu nằm ở `data/cost.json`:

- `npm run cost` chỉ gọi các endpoint miễn phí (`/key`, `/models`), ước tính chi phí và ghi vào `data/cost.json`.
- `npm run images` mặc định là **dry-run**. Chỉ khi thêm `-- --confirm` mới thật sự gọi API.
- Trước mỗi ảnh, script kiểm tra `đã chi + ước tính ≤ BUDGET_USD`, nếu vượt thì dừng. Chi phí thật của từng ảnh (`usage.cost`) được ghi vào sổ.
- Ảnh đã có thì bỏ qua, nên chạy lại không bị tính tiền lại.

## Cài đặt

```bash
npm install
pip install edge-tts          # TTS miễn phí
cp .env.example .env          # điền OPENROUTER_API_KEY
```

Cần Node 22+, Python 3, FFmpeg. Mạng phải truy cập được `openrouter.ai` (ảnh) và `api.elevenlabs.io` (voice), hoặc `speech.platform.bing.com` nếu dùng edge-tts.

## Chạy

```bash
npm run script        # src/script/murphy.ts → data/script.json
npm run cost          # ước tính chi phí, ghi data/cost.json
npm run images        # dry-run: liệt kê ảnh sẽ tạo
npm run images -- --confirm   # tạo ảnh (character-ref trước, rồi 13 shot dùng ref để giữ nhân vật)
npm run voices        # liệt kê voice ElevenLabs → chọn ELEVENLABS_VOICE_ID
npm run voice         # dry-run: số ký tự + quota còn lại
npm run voice -- --confirm    # 60 câu voice-over → assets/audio/voice/
npm run sfx           # SFX + nhạc → assets/sfx, assets/music
npm run storyboard    # đo độ dài voice → data/storyboard.json (timeline tuyệt đối)
npm run render        # render 9 scene song song → output/scenes/*.mp4
npm run mix           # voice + nhạc (auto-duck) + SFX → output/audio-mix.wav
npm run final         # → output/murphy-law.mp4 (+ .vi.srt, .en.srt, soft-sub 2 ngôn ngữ)
```

`npm run preview` chạy toàn bộ mà **không** gọi API và không cần voice. Ảnh còn thiếu được thay bằng placeholder, thời lượng ước theo số ký tự. Dùng lệnh này để test flow.

### Regenerate từng phần

```bash
npm run images -- --confirm --only=s04-desk-usb --force   # vẽ lại 1 ảnh
npm run voice -- --confirm --only=scene-04_02 --force     # đọc lại 1 câu
npx tsx scripts/render-scene.ts scene-04                  # render lại 1 scene
npx tsx scripts/render-scene.ts scene-04 --still=3,8.5    # xuất frame PNG để soát bố cục
npm run mix && npm run final
```

## Cấu trúc

```
src/
  script/      murphy.ts (kịch bản + shot + SFX cue), types.ts, timeline.ts
  scenes/      scene01..09.ts: animation riêng từng scene; common.ts: shot layer + transition
  components/  backdrop (Ken Burns, "thở"), fx (mưa, bụi, glitch, grain), icons (vector),
               ui (panel, terminal, pill, bubble), subtitles (VI + EN), frame (ghép layer)
  audio/       synth.ts (SFX + nhạc), voice.ts
  config/      index.ts (kích thước, timing, giá, TTS), style.ts (art style + prompt template)
  utils/       anim.ts (easing), media.ts (ffprobe/wav), openrouter.ts (API + sổ chi phí)
scripts/       build-script, cost, gen-images, gen-voice, gen-sfx, build-storyboard,
               render, render-scene, mix-audio, assemble
data/          script.json, storyboard.json, cost.json
assets/        images/, audio/voice/, music/, sfx/, fonts/
output/        scenes/*.mp4, audio-mix.wav, murphy-law.mp4, *.srt
```

## Thiết kế

- **Đồng bộ voice và subtitle**: mỗi câu caption là một file TTS riêng, nên thời điểm bắt đầu và kết thúc của câu là chính xác. Animation bám theo `cap(i)` (lúc câu i bắt đầu), nên khi đổi giọng hoặc tốc độ đọc thì hiệu ứng vẫn khớp.
- **Độ dài mục tiêu**: nếu tổng thời lượng < `TIMING.minTotal` (285s), khoảng nghỉ giữa các câu tự giãn ra (tối đa +0.9s/câu).
- **Mỗi scene ≥ 3 layer animation**:
  - Layer 1: camera zoom/pan.
  - Layer 2: nhân vật "thở" và handheld drift.
  - Layer 3+: icon, particle, UI, chữ.
  - Layer phủ: subtitle, vignette, grain.
  - Easing dùng `easeInOutCubic` và `easeOutBack`.
- **Nhân vật nhất quán**: tạo `character-ref.png` trước, rồi gửi ảnh này kèm mọi prompt shot. Prompt theo template `[CHARACTER][SCENE][ENVIRONMENT][COMPOSITION][LIGHTING][MOOD][CAMERA][STYLE]` trong `src/config/style.ts`.
- **Bố cục chừa chỗ cho overlay**: prompt yêu cầu chừa khoảng trống (thường ở bên trái) để đặt UI, nên không cần tạo ảnh nền riêng.
- **Scale lên nhiều video**: chỉ cần thay `src/script/<topic>.ts` và các file `scenes/`. Pipeline, audio, cost guard giữ nguyên.

## Nhân vật (bộ tư thế)

Phong cách và ảnh mẫu: [`docs/style/STYLE.md`](docs/style/STYLE.md).

```bash
npx tsx scripts/gen-character.ts hero                 # dry-run: liệt kê tư thế + chi phí
npx tsx scripts/gen-character.ts hero --confirm       # AI vẽ các tư thế còn thiếu (nền xanh) → tự tách nền
npx tsx scripts/gen-character.ts hero --key-only      # tách nền lại từ raw/ (dùng cho ảnh tự vẽ), $0
npx tsx scripts/character-sheet.ts hero               # characters/hero/sheet.png
npx tsx scripts/sprite-demo.ts hero                   # output/sprite-demo.mp4
```

Dùng ảnh tự vẽ: lưu mỗi tư thế thành `characters/<id>/raw/<pose>.png` trên **nền một màu trơn** (khác màu nhân vật), rồi chạy `--key-only`.
