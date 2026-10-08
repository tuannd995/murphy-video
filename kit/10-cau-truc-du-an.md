# 10 · Cấu trúc project đích (đọc ngay sau 01)

Project đích là **xưởng của MỘT kênh duy nhất**, làm ra nhiều video. Gốc project chứa mọi thứ dùng chung của kênh (thương hiệu, nhân vật, thư viện nền, cache, sổ chi phí). Mỗi lần làm video thì mọi thứ riêng của video đó nằm gọn trong **một thư mục con** `videos/<slug>/`. Các mảng nội dung khác nhau (What If, nghịch lý đời thường, câu hỏi kỳ lạ…) là **series** trong cùng kênh, không phải kênh riêng.

Cấu trúc này thay thế mọi sơ đồ thư mục khác nếu có chỗ chưa khớp.

## 1. Hai tầng + một kho cache

```
.                                      ← gốc xưởng = gốc kênh (git repo)
├── channel.json                       TOÀN BỘ cấu hình kênh (mục 2)
├── CLAUDE.md  .claude/  docs/         luật, agent, skill, hook, tài liệu (xem 07)
│
├── brand/                             logo, banner, watermark, avatar, thumbnail mẫu, bảng màu
├── characters/<id>/                   <id>.json, raw/, poses/, sheet.png
├── library/
│   ├── backgrounds/                   <id>.png + index.json (tag, nguồn video, ngày)
│   └── props/
├── fonts/
├── audio/sfx/  audio/music/           sinh bằng code (gitignore *.wav, tạo lại bằng `npm run sfx`)
├── templates/
│   ├── intro.ts  outro.ts             khai báo intro/outro CỐ ĐỊNH của kênh (lời + animation)
│   ├── fixed/                         intro/outro ĐÃ TẠO MỘT LẦN: mp3, json, wav, mp4, LOCK.json (commit, gc không xoá; xem 13 mục 7)
│   └── <series>.skeleton.ts           khung kịch bản cho từng series (hook → bối cảnh → thân → kết)
├── series/<id>.json                   mỗi series: tên, mô tả, khung dùng, thumbnail template, thời lượng, nhạc
│
├── cache/                             KHO THEO HASH, dùng chung mọi video (mục 3)
│   ├── images/<hash>.png (+ .json: prompt, model, usd, ngày)
│   ├── voice/<hash>.mp3  (+ .json: text, voiceId, model, alignment)
│   └── render/<hash>.mp4              clip scene/intro/outro đã render
│
├── videos/<slug>/                     MỖI VIDEO MỘT THƯ MỤC CON
│   ├── video.json                     metadata + trạng thái (mục 5)
│   ├── script.ts                      kịch bản (nguồn chính)
│   ├── scenes/sceneXX.ts              animation riêng của video (chỉ những gì không dùng lại được)
│   ├── data/                          script.json, manifest.json, storyboard[.tag].json,
│   │                                  sources.md, review.md, feedback.json, runs.jsonl
│   ├── build/                         (gitignore) trung gian: scenes/*.mp4, audio-mix.wav, stills/
│   └── output/<tag>/                  thành phẩm theo định dạng: final.mp4, .vi.srt, .en.srt,
│                                      thumbnail.png, publish.md (tiêu đề, mô tả, chapters, hashtag)
│                                      <tag> = youtube | tiktok-summary | shorts-scene-04 | …
│
├── ledger/cost.jsonl                  SỔ CHI PHÍ DUY NHẤT, chỉ ghi thêm (mục 6)
├── topics/queue.md                    hàng đợi chủ đề (mỗi dòng: series | chủ đề | trạng thái)
├── src/  scripts/                     code dùng chung (không chứa chủ đề video cụ thể)
└── exports/                           (gitignore) bản bàn giao gom từ nhiều video, nếu cần
```

## 2. `channel.json`: một file cho cả kênh

Gồm: `name`, `tagline`, `topic`, `tone`, `palette`, `character` mặc định, `voice`, `music`, `intro`, `outro`, `cta`, `targetMinutes`, `audience`, `defaults` (fps, kích thước, `RENDER_JOBS`, model ảnh/voice) và `budget`:
```jsonc
"budget": { "videoImagesUsd": 1, "videoVoiceCredits": 6000, "monthlyUsd": 8, "monthlyVoiceCredits": 60000 }
```
Mẫu đầy đủ ở `06-kenh-dinh-dang.md`. Không còn `studio.json` hay thư mục `channels/`.

## 3. Quy tắc tìm tài nguyên

Mọi script tìm tài nguyên bằng **một hàm duy nhất** `resolve(kind, id, { video })` trong `src/utils/resolve.ts`. Thứ tự: **thư mục video → gốc kênh**.
- `kind` gồm: `background`, `character`, `prop`, `font`, `sfx`, `music`, `template`.
- Ví dụ: video có `videos/<slug>/library/backgrounds/x.png` (nền chỉ dùng riêng) thì dùng nó; không có thì lấy `library/backgrounds/x.png`.
- Không script nào được ghép đường dẫn tài nguyên bằng tay.
- Cấu hình xếp tầng `channel.json` < `video.json` (deep merge theo khoá). Ví dụ một video đổi `budget.videoImagesUsd`, hay đổi `character`.
- Series cho thêm một tầng giữa: `channel.json` < `series/<id>.json` < `video.json` (series có thể đổi thời lượng mục tiêu, nhạc mặc định, khung kịch bản).

## 4. Cache theo hash (tiết kiệm tiền nhiều nhất)

Mọi thứ tốn tiền đều lưu ở `cache/` với tên = hash nội dung tạo ra nó, **không gắn với video nào**:

| Loại | Khoá hash | Hệ quả |
|---|---|---|
| Ảnh | `sha1(model + prompt + hash(ảnh style tham chiếu))` | cùng prompt ở video khác không tốn thêm |
| Voice | `sha1(voiceId + model + settings + text đã chuẩn hoá)` | câu lặp lại giữa các video chỉ đọc 1 lần (intro/outro thì không qua cache mà là tài sản cố định, mục 5) |
| Clip render | `sha1(code scene + dữ liệu storyboard của scene + hash ảnh/voice dùng trong scene + định dạng)` | sửa 1 scene thì chỉ render lại scene đó |

- Video không sao chép file. `videos/<slug>/data/manifest.json` chỉ ghi **tham chiếu**: `shot.id → hash ảnh`, `line.id → hash voice`, `scene.id → hash clip`. Xoá hay đổi tên video không làm mất cache.
- Trước mỗi lần gọi API: tính hash → có trong cache thì dùng luôn. Dry-run ghi rõ "trúng cache N / M" và số tiền tiết kiệm. Báo cáo `ke-toan` luôn nêu số này.
- `npm run gc` liệt kê file cache không video nào tham chiếu (đọc mọi `manifest.json`). **Chỉ báo, không tự xoá.**
- **Thăng hạng ảnh:** sau khi duyệt, ảnh mới của video được `hoa-si` đưa vào `library/backgrounds/` kèm tag. Video sau gặp bối cảnh tương tự sẽ tìm thấy trong library trước khi nghĩ tới tạo mới (xem `gen-images` trong 03).

## 5. Intro, outro: tài sản cố định, tạo một lần
- `templates/intro.ts` và `outro.ts` khai báo lời và animation. Hai đoạn này được **tạo một lần** bằng `npm run fixed` (đọc giọng đúng 2 lần, dựng hình, mix âm thanh) và lưu ở `templates/fixed/` cùng `LOCK.json`. Chi tiết và quy tắc ở `13-loi-chao-ket.md` mục 7.
- Mọi video sau chỉ **ghép** các file này vào đầu và cuối. Không gọi TTS, không render lại, không tính vào chi phí. Điều này đúng ngay cả khi `cache/` bị dọn hoặc khi `voice` trong `channel.json` đổi.
- Chỉ tạo lại khi người dùng yêu cầu rõ (`--force`, có DUYỆT CHI). Video cũ không bị ảnh hưởng vì mỗi video ghi `fixedHash` lúc ghép.
- Khung kịch bản `<series>.skeleton.ts` giúp các video cùng series có cùng cấu trúc khối. `bien-kich` bắt đầu từ khung này thay vì từ trang trắng, và **không viết intro/outro** (đã cố định).

## 6. `video.json` và trạng thái

```jsonc
{
  "slug": "neu-trai-dat-ngung-quay", "series": "what-if", "title_vi": "...", "title_en": "...",
  "format": "youtube",                       // định dạng chính
  "status": "draft",                         // draft → script-approved → storyboard-approved → paid → rendered → final-approved → published
  "character": "hero",                       // ghi đè mặc định của kênh nếu cần
  "budget": { "videoImagesUsd": 1, "videoVoiceCredits": 6000 },   // ghi đè channel.json nếu cần
  "created": "2026-10-07", "kitVersion": "1"
}
```
- Mỗi cổng duyệt đạt thì `status` tiến một bậc (do skill `video-moi` cập nhật, không sửa tay).
- `npm run status` in bảng mọi video: slug, series, trạng thái, số scene, chi phí đã dùng, định dạng đã xuất. Đây là bảng điều khiển của cả kênh.
- `data/runs.jsonl`: mỗi lần chạy `make` hoặc lệnh render/voice/ảnh ghi một dòng `{ts, lệnh, tag, giây, số clip trúng cache, usd, credits}`.

## 7. Sổ chi phí duy nhất `ledger/cost.jsonl`

Mỗi dòng: `{ts, video|null, step, model, item, usd|credits}`.
- `video = null` cho chi phí chung (tạo nhân vật, thư viện, thử giọng).
- Chỉ ghi thêm vào cuối, không sửa dòng cũ. Báo cáo theo video, theo series, theo tháng đều là truy vấn trên một file này (`npm run cost -- --report [--series s] [--month YYYY-MM]`).
- `budget-guard` kiểm tra 2 mức: **video** (`videoImagesUsd`, `videoVoiceCredits`) và **kênh theo tháng** (`monthlyUsd`, `monthlyVoiceCredits`). Vượt mức nào cũng chặn lệnh `--confirm`.

## 8. Dòng chảy dữ liệu một lần chạy

```
videos/<slug>/script.ts ──build-script──► data/script.json
        │                                      │
        │ resolve(background…) ◄── library/ (video → gốc kênh)
        ▼
 gen-images (hash → cache/images) ┐
 gen-voice  (hash → cache/voice)  ├──► data/manifest.json
 templates/fixed (intro, outro)    ┘  (có sẵn, không gọi API)
        ▼
 storyboard ─► render từng scene (hash → cache/render hoặc build/scenes)
        ▼
 mix (build/audio-mix.wav) ─► assemble ─► output/<tag>/final.mp4 + .srt + thumbnail + publish.md
        └──► mỗi bước ghi ledger/cost.jsonl và data/runs.jsonl
```

## 9. Git, dung lượng, sao lưu

- **Commit:** code, `channel.json`, `brand/`, `characters/**` (cả `raw/`), `library/**`, `templates/` (cả `templates/fixed/`), `series/`, `topics/`, `ledger/`, `cache/{images,voice}`, `videos/**/{video.json,script.ts,scenes,data}`.
- **Không commit:** `.env`, `videos/**/build/`, `videos/**/output/`, `cache/render/`, `audio/**/*.wav`, `docs/style/private/`, `.current-video`, `exports/`.
- Ảnh và voice trong `cache/` là thứ **mất tiền mới có**, nên phải sao lưu. Cache lớn dần thì dùng Git LFS: tạo `.gitattributes` với `cache/images/*.png`, `cache/voice/*.mp3`, `library/**/*.png`, `characters/**/*.png` filter=lfs. Hỏi người dùng trước khi bật LFS.
- Ảnh nền lưu PNG khi tạo, nhưng có thể chuyển WebP chất lượng 92 cho library để nhẹ (vẫn giữ hash cũ trong manifest).
- Mỗi lần gửi duyệt gắn git tag `<slug>-v1`, `-v2`… để quay lại bản cũ.

## 10. Lệnh dùng chung

```
npm run new:video -- "<chủ đề>" [--series what-if]   tạo videos/<slug>/ + video.json (qua skill /video-moi)
npm run status                                        bảng trạng thái cả kênh
npm run cost -- --report [--series s] [--month YYYY-MM]
npm run gc                                            báo file cache mồ côi
npm run make -- --video <slug> [--type …]
```
Mọi script khác nhận `--video <slug>` (hoặc đọc `.current-video`) và dùng `src/utils/resolve.ts` để tìm tài nguyên.
