# 03 · Đặc tả pipeline

Phần đặc tả này rút ra từ một pipeline đã chạy thật (đã làm ra một video hoàn chỉnh khoảng 5,5 phút, kèm bản TikTok và Shorts). Dùng chung cho mọi video của kênh. Bám đúng các con số và mẹo ghi ở đây. Những chỗ ghi "⚠" là lỗi đã từng gặp.

## 1. Lệnh npm
```jsonc
"scripts": {
  "script":     "tsx scripts/build-script.ts",                         // videos/<k>/<s>/script.ts → data/script.json
  "lint:narration": "tsx scripts/lint-narration.ts",                   // chấm lời thoại theo NARRATION.md
  "cost":       "tsx --env-file-if-exists=.env scripts/cost.ts",       // chỉ gọi endpoint miễn phí
  "images":     "tsx --env-file-if-exists=.env scripts/gen-images.ts", // dry-run; --confirm mới gọi API
  "voice":      "tsx --env-file-if-exists=.env scripts/gen-voice.ts",  // dry-run; --confirm mới gọi API
  "voices":     "tsx --env-file-if-exists=.env scripts/list-voices.ts",
  "sfx":        "tsx scripts/gen-sfx.ts",
  "storyboard": "tsx scripts/build-storyboard.ts",
  "render":     "tsx scripts/render.ts",
  "mix":        "tsx scripts/mix-audio.ts",
  "final":      "tsx scripts/assemble.ts",
  "make":       "tsx scripts/make.ts",                                 // storyboard → render → mix → final
  "character":  "tsx --env-file-if-exists=.env scripts/gen-character.ts",
  "new:video":  "tsx scripts/new-video.ts",                            // tạo videos/<slug>/ + video.json
  "status":     "tsx scripts/status.ts",                               // bảng trạng thái, chi phí cả xưởng
  "gc":         "tsx scripts/gc.ts",                                   // liệt kê cache mồ côi (chỉ báo)
  "typecheck":  "tsc --noEmit"
}
```
Mọi lệnh nhận `--video <slug>`; tài nguyên luôn tìm qua `src/utils/resolve.ts` (thư mục video → gốc kênh, xem 10). Các lệnh từ `storyboard` trở đi nhận thêm `--type`, `--summary`, `--scenes`.

## 2. Kịch bản (`videos/<slug>/script.ts`)
```ts
export interface Line {                                      // 1 câu nói tự nhiên (đủ ý), = 1 file voice + 1 phụ đề
  vi: string; en: string;
  say?: string;            // cách đọc cho TTS khi tên riêng/thuật ngữ bị đọc sai (phụ đề vẫn dùng vi)
  pauseAfter?: number;     // giây nghỉ sau câu, thay GAP mặc định (chỗ "//" trong 11-phong-cach-giong-ke.md)
  delivery?: string;       // ghi chú nhấn nhá theo ký hiệu của 11; không vào phụ đề, không gửi TTS
}
export interface Shot { id: string; fromLine: number; background?: string /* id trong library */; prompt?: PromptParts }
export interface Cue  { sfx: string; line?: number; word?: string; offset?: number; gainDb?: number }
export interface Act {                                      // 1 sân khấu nhân vật theo câu thoại
  line: number; pose: string; x?: number; flip?: boolean; walkTo?: number; character?: string;
}
export interface SceneDef {
  id: string;               // "scene-01"
  title: string;            // "Hook", "Intro kênh", "Outro kênh"…  (intro/outro nhận diện qua kind)
  kind?: "intro" | "outro" | "content";
  lines: Line[];
  shots: Shot[];            // ảnh nền; shot không có prompt = dùng lại ảnh cùng id / từ library
  acts?: Act[];             // nhân vật làm gì theo câu thoại
  sfx: Cue[];
  music: string;            // id track nhạc (vd "curious", "warm", "mystery")
  summary?: number[];       // câu giữ lại trong bản tóm tắt
  shortable?: boolean;      // cắt riêng thành Shorts/Reels được
  notes?: string;           // mô tả hình ảnh/animation cho agent hoat-hoa
}
export interface VideoScript { channel: string; slug: string; title_vi: string; title_en: string; character: string; scenes: SceneDef[] }
```
- **Phong cách mục tiêu** (nhịp, cấu trúc, ví von, ký hiệu nhấn nhá): `11-phong-cach-giong-ke.md`; kịch bản mẫu: `12-kich-ban-mau.md`.
- **Quy tắc viết** (bắt buộc, xem `05-loi-thoai.md`): viết lời kể cả đoạn trước, đọc to, rồi mới tách thành `lines`. Mỗi `Line` là một câu (đôi khi hai câu) **đủ ý**. **Không** tách câu chỉ để có beat animation. Beat đặt theo từ khoá (mục 5).
- `build-script` xuất `data/script.json`: các trường gốc, cộng prompt ảnh đã ghép theo template, cộng số âm tiết tiếng Việt. Nếu tổng ngắn hơn khoảng 1.500 âm tiết (dưới 8 phút) thì in cảnh báo.

## 3. Ảnh nền (`gen-images`)
- **Ưu tiên library**: shot có `background: "kitchen-01"` thì không tạo ảnh mới. Tìm theo thứ tự `videos/<slug>/library/backgrounds` rồi `library/backgrounds` (hàm `resolve`). Shot không chỉ định id thì tìm theo tag trong `index.json` trước. Chỉ tạo ảnh khi không có nền phù hợp. Sau khi duyệt, ảnh mới được **thăng hạng** vào library của kênh (hoặc shared nếu chung chung) kèm tag.
- **Ảnh nền KHÔNG có nhân vật** (`no people, no characters, empty scene`). Nhân vật luôn ghép bằng bộ tư thế (04).
- Prompt ghép theo template `[SCENE][ENVIRONMENT][COMPOSITION][LIGHTING][MOOD][CAMERA][STYLE]` (STYLE lấy từ `src/config/style.ts`, xem 04). Composition nên **chừa khoảng trống** cho chữ và nhân vật, nhưng **không được viết "empty area on the left"**, vì model sẽ vẽ thành khung chữ nhật thừa (⚠). Viết là: `"uncluttered left third of the frame, plain wall"`.
- Lưu ở `cache/images/<hash>.png` với `hash = sha1(model + prompt + hash(ảnh style tham chiếu)).slice(0,12)` (kèm `.json`: prompt, model, usd). Video chỉ ghi `shot.id → hash` trong `data/manifest.json`. Dry-run in "trúng cache N/M" và số tiền tiết kiệm.
- Request OpenRouter:
```ts
const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "video-studio" },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "16:9" },             // "3:4" cho tư thế nhân vật
    usage: { include: true },                             // để lấy usage.cost (USD thật)
    messages: [{ role: "user", content: [
      { type: "text", text: "Style reference (copy the drawing style, not the content):" },
      { type: "image_url", image_url: { url: "data:image/png;base64,<docs/style/scene-example-desk.png>" } },
      { type: "text", text: prompt },
    ]}],
  }),
});
const j = await r.json();
const dataUrl = j.choices[0].message.images[0].image_url.url;  // "data:image/png;base64,...."
const usd = j.usage?.cost ?? 0;
```
- Trước **mỗi** ảnh: nếu `đã chi + ước tính > ngân sách` thì dừng. Ước tính lấy từ `/models` (completion khoảng $30/1M token × ~1.300 token mỗi ảnh); nếu đã có số đo thật thì lấy trung bình thực tế.

## 4. Voice (`gen-voice`)
- 1 `Line` = 1 lần gọi = `cache/voice/<sha1(voiceId+model+settings+text).slice(0,12)>.mp3`, kèm `.json` timestamp. Câu giống nhau ở video khác (intro, outro, CTA, câu lặp) tự trúng cache. Video ghi `line.id → hash` trong `data/manifest.json`. Sửa một câu thì chỉ câu đó phải đọc lại.
- **Dùng endpoint có timestamp** để đặt beat theo từ:
```ts
POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/with-timestamps?output_format=mp3_44100_128
headers: { "xi-api-key": key, "Content-Type": "application/json" }
body: {
  text, model_id, language_code: "vi",
  voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true, speed: 1.0 },
  // previous_text/next_text giúp nối ngữ điệu giữa các câu — ⚠ KHÔNG gửi khi model là eleven_v3 (lỗi 400)
  ...(model === "eleven_v3" ? {} : { previous_text, next_text }),
}
→ { audio_base64, alignment: { characters[], character_start_times_seconds[], character_end_times_seconds[] } }
```
- Trước khi đọc thật, dry-run in ra: số câu, số ký tự, credits dự kiến (turbo/flash v2.5 = 0,5 credit/ký tự; v3 = 1) và quota còn lại. Thiếu quyền `user_read` thì bỏ qua bước xem quota, không dừng.
- Chuẩn hoá text trước khi gửi: bỏ ngoặc kép kiểu `“ ”`.
- Sau khi đọc: kiểm tra tốc độ đọc từng câu. Ngoài khoảng **9–22 ký tự/giây** thì báo là bất thường (v3 thỉnh thoảng đọc lạc).
- Nếu lỗi: thử lại 3 lần, **xoá file rỗng** (⚠ từng để lại file 0 byte khiến lần sau bỏ qua câu đó).
- Tốc độ đo được: tiếng Việt khoảng **14–16 ký tự/giây**. Dùng con số này để ước lượng khi chưa có voice.

## 5. Storyboard (`build-storyboard`): timeline tuyệt đối
Với từng scene đã chọn (theo `--type`, `--scenes`, intro/outro):
```
t = LEAD_IN (0.6s)
for line i:   (khoảng nghỉ = line.pauseAfter ?? GAP; voice gửi TTS dùng line.say ?? line.vi)
  nếu --summary và i ∉ scene.summary: line.skip = true; start = end = t   (thời lượng 0, không voice, không phụ đề)
  else: dur = ffprobe(voice) hoặc len(vi)/15.5; start = t; end = t+dur; t = end + GAP(0.25s) + (vi kết thúc "..." ? 0.6 : 0)
scene.duration = round((t - GAP + TAIL(1.0s)) * fps) / fps      ⚠ làm tròn theo frame, nếu không audio/video lệch dần
shot.start = lines[fromLine].start - 0.15 ; shot.end = shot kế tiếp hoặc hết scene
sfx.time = (word ? wordTime(line, word) : lines[line].start) + offset ; bỏ cue gắn với câu bị skip
acts → thời điểm đổi tư thế = start của line (hoặc wordTime)
```
- `wordTime(line, word)`: tìm vị trí chữ trong `text` → `alignment.character_start_times_seconds[idx]` → cộng `line.start`. Khi chưa có voice: nội suy theo tỉ lệ vị trí ký tự.
- Nếu ngắn hơn mục tiêu của định dạng: được giãn GAP thêm **tối đa 0,25s/câu** (⚠ giãn 0,9s làm video lê thê). Vẫn thiếu thì in cảnh báo "thêm khối nội dung", **không giãn thêm**.
- Ghi `videos/<k>/<s>/data/storyboard[.<tag>].json` gồm `type, title, vertical, cta, width, height, fps, total_duration, scenes[]`.

## 6. Render (canvas → ffmpeg)
- Mọi scene vẽ trong hệ toạ độ logic **1920×1080**. Bản ngang: scale lên kích thước output. Bản dọc: xem mục 8.
- Scene renderer: `(ctx, t, s) => void`. `s` gồm `scene, images, cap(i)` (= start câu i), `capEnd(i)`, `word(i, "từ")`, `actor` (trạng thái nhân vật hiện tại).
- Thứ tự layer trong 1 frame:
  1. nền (Ken Burns: zoom 1.00→1.08, pan nhẹ, rung tay ±4px, "thở" scaleY 1+0.0045·sin);
  2. layer riêng của scene (icon vector, UI, particle);
  3. nhân vật (drawSprite);
  4. vignette 0.38;
  5. grain 0.04;
  6. phụ đề;
  7. dip-to-black ở mép scene (0.45s; scene đầu 0.9s).
- Không vẽ overlay ở **260px đáy** (dành cho phụ đề).
- ⚠ Grain đổi mỗi frame làm file nặng gấp khoảng 3,5 lần (290MB thay vì 82MB). Chỉ đổi pattern **6 lần/giây**.
- Mỗi scene render thành một mp4 riêng, **lưu theo hash** `sha1(code scene + dữ liệu storyboard của scene + hash ảnh/voice dùng + định dạng)` ở `build/scenes/` (riêng intro/outro của kênh thì ở `cache/render/`), scene không đổi thì bỏ qua. Chạy song song `RENDER_JOBS` tiến trình (mỗi tiến trình là `npx tsx scripts/render-scene.ts <id> ...`):
```ts
const ff = spawn("ffmpeg", ["-y","-v","error","-f","rawvideo","-pix_fmt","rgba","-s",`${w}x${h}`,"-r","30","-i","-",
  "-c:v","libx264","-preset","medium","-crf","22","-pix_fmt","yuv420p","-r","30", out]);
for (let f = 0; f < frames; f++) { paint(f/30); if (!ff.stdin.write(Buffer.from(canvas.data()))) await once(ff.stdin,"drain"); }
```
- `--still=2.5,8` xuất PNG để soát nhanh (`build/stills/`). Luôn render khung hình mẫu trước khi render cả video.
- Font: copy Inter (Bold/ExtraBold/SemiBold/Medium) vào `fonts/` và đăng ký bằng `GlobalFonts.registerFromPath`. Inter có đủ dấu tiếng Việt. ⚠ **Không dùng emoji** trong chữ vẽ lên canvas (hiện thành ô vuông).
- Tốc độ tham khảo: 1080p30, 4 nhân CPU, khoảng 5 phút render cho 5,5 phút video.

## 7. Phụ đề
- Song ngữ: tiếng Việt Inter Bold, tiếng Anh Inter Medium màu `#f2d38a` bên dưới, nền hộp `rgba(14,18,26,0.62)` bo góc 18.
- Ngang: VI 46px, EN 30px, rộng tối đa 1480, mỗi trang 2 dòng, đáy cách mép 56px.
- Câu dài: chia trang theo thời gian, tỉ lệ với độ dài câu.
- Bỏ qua câu `skip`. Xuất thêm `.vi.srt` và `.en.srt`, rồi nhúng soft-sub (`mov_text`, language `vie`/`eng`).

## 8. Bố cục dọc 9:16 (TikTok/Shorts/Reels)
- Canvas 1080×1920. Vẽ frame 16:9 (không phụ đề) ra canvas phụ 1920×1080, sau đó:
  1. nền = frame phóng to phủ kín (scale 1920/1080) + lớp tối `rgba(14,18,26,0.72)`;
  2. frame chính rộng 1080, cao 608, đặt ở y=600;
  3. nhãn kênh (pill đỏ) ở y=170, tiêu đề video Inter ExtraBold 64px tối đa 3 dòng từ y=290;
  4. phụ đề VI 54px / EN 32px, rộng tối đa 980, **3 dòng/trang** (⚠ 2 dòng thì câu bị cắt thành mẩu lẻ), đáy ở y=1640;
  5. CTA (pill đỏ, không emoji) xuất hiện 3,5 giây cuối của scene cuối.
- Nâng cấp sau: scene khai báo bố cục dọc riêng (nhân vật to, ở giữa) thay vì lồng khung 16:9.

## 9. Âm thanh
- **SFX tổng hợp bằng code** (`src/audio/synth.ts`, WAV mono 48kHz), không lo bản quyền:
  whoosh (noise lọc dải quét), pop (sine quét xuống), ding (1318Hz + hoạ âm, tắt dần), thud (sine 95→40Hz + noise), click, error (2 nốt square mềm 233/196Hz), success (arpeggio C-E-G), crank (đề máy hụt), rain (noise + giọt), tick, scratch, typing, bubble, swell (riser), glitch.
- **Nhạc nền tổng hợp:** mỗi mood là một vòng hợp âm (pad tam giác qua lowpass, bass sine, arpeggio pluck Karplus-Strong, kick mềm, shaker), lặp đúng số ô nhịp để nối liền. Ví dụ: `curious` C–Am–F–G 100bpm, `warm` F–G–Em–Am 82bpm, `mystery` Am–F–Dm–E 70bpm (pad tối, không kick).
- **Mix** (Float32, 48kHz stereo):
  - voice 0dB;
  - nhạc −21dB, **duck thêm −8dB** khi có giọng (attack 0,12s, release 0,6s), crossfade 1,5s khi đổi mood, fade in 1,5s, fade out 3s;
  - SFX −9dB (+gainDb từng cue), pan lệch nhẹ luân phiên;
  - soft limiter ở 0,8.
- **Ghép file:** concat các clip scene bằng demuxer, `-c:v copy`; audio `-af loudnorm=I=-16:TP=-1.5:LRA=11` (chuẩn YouTube −16 LUFS), aac 192k, `-movflags +faststart`. ⚠ **Không dùng `-shortest`** khi có stream phụ đề (video bị cắt mất ~1 giây).

## 10. Định dạng (`src/config/formats.ts`)
| type | kích thước | lý tưởng | intro/outro | mặc định tóm tắt | CTA |
|---|---|---|---|---|---|
| youtube | 1920×1080 | 8–10 phút | có | không | — |
| facebook | 1920×1080 | 3–5 phút | có | có | — |
| tiktok | 1080×1920 | 1:01–3:00 | không | có | "Follow để xem thêm…" |
| shorts | 1080×1920 | 30–60s (tối đa 3 phút) | không | không | "Xem bản đầy đủ trên YouTube …" |
| reels | 1080×1920 | 30–90s | không | không | "Theo dõi … để xem thêm" |

- Tag đường dẫn: youtube đầy đủ → không hậu tố; còn lại ví dụ `tiktok-summary`, `shorts-scene-04` → `data/storyboard.<tag>.json`, `output/<tag>/` (trong thư mục video).
- `make --all-shortable`: tạo mỗi scene `shortable` thành một clip.

## 11. Chi phí và kiểm soát
- `src/utils/openrouter.ts` và `src/audio/elevenlabs.ts` là các client mỏng. Mọi lần gọi có tính phí đều thêm một dòng vào **`ledger/cost.jsonl`**: `{ts, channel, video|null, step, model, item, usd|credits}`. Chỉ ghi thêm, không sửa dòng cũ.
- `scripts/budget-guard.ts "<lệnh>"`: đọc `--video` trong lệnh, cộng sổ theo video, kênh (tháng này), xưởng (tháng này), ước tính phần còn thiếu (đã trừ phần trúng cache). Vượt `budget` ở bất kỳ mức nào thì exit 1 và in lý do. Hook PreToolUse gọi script này cho mọi lệnh có `--confirm`.
- `scripts/cost.ts`: chỉ gọi endpoint miễn phí; `--report [--series s] [--month YYYY-MM]` in bảng tổng hợp từ sổ.

## 12. Soát lời thoại (`lint-narration`)
Đếm trên `lines[].vi`, in bảng vi phạm theo `05-loi-thoai.md`:
- từ đệm (à, ủa, nhé, mà, thế là, y như rằng, đấy, nha, nhỉ) trên mỗi 5 câu;
- số dấu "...";
- câu ≤ 3 chữ;
- ≥ 2 câu ≤ 5 chữ liên tiếp (dấu hiệu chặt câu);
- câu mở bằng "Lý do thứ…/Thứ nhất…" lặp lại;
- câu kết bằng "!" quá nhiều.

Script chỉ **báo**, không tự sửa. Agent `kiem-duyet` đề xuất câu thay.
