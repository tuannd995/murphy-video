# 10 · Cấu trúc project đích (đọc ngay sau 01)

Project đích là **một xưởng duy nhất**, chứa nhiều kênh, mỗi kênh nhiều video. Mỗi lần làm video thì mọi thứ riêng của video đó nằm gọn trong **một thư mục con**; mọi thứ dùng lại được nằm ở tầng trên để chia sẻ. Cấu trúc này thay thế mọi sơ đồ thư mục cũ trong các file khác nếu có chỗ chưa khớp.

## 1. Ba tầng + một kho cache

```
.                                      ← gốc xưởng (git repo)
├── studio.json                        mặc định toàn xưởng: fps, kích thước, ngân sách, model ảnh/voice, RENDER_JOBS
├── CLAUDE.md  .claude/  docs/         luật, agent, skill, hook, tài liệu (xem 07)
│
├── shared/                            TẦNG 1 · dùng chung mọi kênh, mọi video
│   ├── characters/<id>/               <id>.json, raw/, poses/, sheet.png
│   ├── library/backgrounds/           <id>.png + index.json (tag, nguồn, kênh gốc, ngày)
│   ├── library/props/
│   ├── fonts/
│   ├── audio/sfx/  audio/music/       sinh bằng code (gitignore *.wav, tạo lại bằng `npm run sfx`)
│   └── cache/                         KHO THEO HASH, dùng chung toàn xưởng (mục 3)
│       ├── images/<hash>.png (+ .json: prompt, model, usd, ngày)
│       ├── voice/<hash>.mp3  (+ .json: text, voiceId, model, alignment)
│       └── render/<hash>.mp4          clip scene/intro/outro đã render (mục 4)
│
├── channels/<kenh>/                   TẦNG 2 · riêng từng kênh = nhận diện thương hiệu
│   ├── channel.json                   tên, tagline, giọng văn, palette, voice, nhạc, CTA, nhân vật mặc định
│   ├── brand/                         logo, banner, watermark, avatar, thumbnail mẫu, bảng màu
│   ├── library/backgrounds/           nền riêng của kênh (ưu tiên hơn shared)
│   ├── templates/
│   │   ├── intro.ts  outro.ts         scene intro/outro CỐ ĐỊNH của kênh (lời, animation)
│   │   └── <loai>.skeleton.ts         khung kịch bản cho từng dạng video (what-if, nghịch lý…)
│   └── series.json                    (tuỳ chọn) danh sách series, số tập, thumbnail template
│
├── videos/<kenh>/<slug>/              TẦNG 3 · MỖI VIDEO MỘT THƯ MỤC CON
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
├── src/  scripts/                     code dùng chung (không chứa tên kênh/chủ đề)
└── exports/                           (gitignore) bản bàn giao gom từ nhiều video, nếu cần
```

## 2. Quy tắc tìm tài nguyên theo tầng (cascade)

Mọi script tìm tài nguyên bằng **một hàm duy nhất** `resolve(kind, id, { channel, video })` trong `src/utils/resolve.ts`. Thứ tự: **video → kênh → shared**. Gặp trước thì dùng.
- `kind` gồm: `background`, `character`, `prop`, `font`, `sfx`, `music`, `template`.
- Không script nào được ghép đường dẫn tài nguyên bằng tay. Nhờ vậy muốn một kênh dùng nền hoặc nhân vật riêng thì chỉ cần đặt file vào thư mục kênh.
- Cấu hình cũng xếp tầng: `studio.json` < `channel.json` < `video.json`. Tầng dưới ghi đè tầng trên theo từng khoá (deep merge). Ví dụ kênh đổi `voice.id`, một video đổi `budget.imagesUsd`.
- Nhân vật: `channel.json` khai báo `character` mặc định. Scene dùng nhân vật khác thì ghi `character` trong `Act`.

## 3. Cache theo hash (tiết kiệm tiền nhiều nhất)

Mọi thứ tốn tiền đều lưu ở `shared/cache/` với tên = hash nội dung tạo ra nó, **không gắn với video nào**:

| Loại | Khoá hash | Hệ quả |
|---|---|---|
| Ảnh | `sha1(model + prompt + hash(ảnh style tham chiếu))` | cùng prompt ở video khác hoặc kênh khác không tốn thêm |
| Voice | `sha1(voiceId + model + settings + text đã chuẩn hoá)` | **intro, outro, CTA, câu lặp lại giữa các video đọc 1 lần duy nhất** |
| Clip render | `sha1(code scene + dữ liệu storyboard của scene + hash ảnh/voice dùng trong scene + định dạng)` | sửa 1 scene thì chỉ render lại scene đó |

- Video không sao chép file. `videos/.../data/manifest.json` chỉ ghi **tham chiếu**: `shot.id → hash ảnh`, `line.id → hash voice`, `scene.id → hash clip`. Xoá hay đổi tên video không làm mất cache.
- Trước mỗi lần gọi API: tính hash → có trong cache thì dùng luôn, dry-run ghi rõ "trúng cache N / M". Báo cáo `ke-toan` luôn nêu **tiền đã tiết kiệm nhờ cache**.
- `npm run gc` liệt kê file cache không video nào tham chiếu (đọc mọi `manifest.json`). **Chỉ báo, không tự xoá.**
- **Thăng hạng ảnh:** sau khi duyệt, ảnh mới của video được `hoa-si` đưa vào `channels/<k>/library/backgrounds/` (hoặc `shared/library/` nếu chung chung) kèm tag. Video sau gặp bối cảnh tương tự sẽ tìm thấy trong library trước khi nghĩ tới tạo mới (xem `gen-images` trong 03).

## 4. Intro, outro và clip dựng sẵn

- `channels/<k>/templates/intro.ts` và `outro.ts` là scene bình thường nhưng **cố định**: cùng lời, cùng animation cho mọi video của kênh. Chỉ khác nhau ở tham số tối thiểu (ví dụ tên video hiển thị).
- Voice của intro/outro nhờ cache nên chỉ trả tiền ở video đầu tiên. Clip render của chúng cũng được cache theo định dạng (youtube, tiktok…). Video sau ghép lại, không render lại.
- Đổi nội dung intro/outro thì hash đổi, tự đọc và render lại, các video cũ không bị ảnh hưởng.
- Khung kịch bản `<loai>.skeleton.ts` giúp các video cùng dạng có cùng cấu trúc khối (hook → bối cảnh → thân → kết). `bien-kich` bắt đầu từ khung này thay vì từ trang trắng.

## 5. `video.json` và trạng thái

```jsonc
{
  "channel": "naophang", "slug": "neu-trai-dat-ngung-quay", "title_vi": "...", "title_en": "...",
  "format": "youtube",                       // định dạng chính
  "status": "draft",                         // draft → script-approved → storyboard-approved → paid → rendered → final-approved → published
  "character": "hero",                       // ghi đè mặc định của kênh nếu cần
  "budget": { "imagesUsd": 1, "voiceCredits": 6000 },   // ghi đè studio.json nếu cần
  "created": "2026-10-07", "kitVersion": "1"
}
```
- Mỗi cổng duyệt đạt thì `status` tiến một bậc (do skill `video-moi` cập nhật, không sửa tay).
- `npm run status` in bảng mọi video: kênh, slug, trạng thái, số scene, chi phí đã dùng, định dạng đã xuất. Đây là bảng điều khiển của cả xưởng.
- `data/runs.jsonl`: mỗi lần chạy `make` hoặc lệnh render/voice/ảnh ghi một dòng `{ts, lệnh, tag, giây, số clip trúng cache, usd, credits}`. Dùng để biết lần chạy nào tốn gì.

## 6. Sổ chi phí duy nhất `ledger/cost.jsonl`

Mỗi dòng: `{ts, channel, video|null, step, model, item, usd|credits, cacheHit:false}`.
- `video = null` cho chi phí xưởng (tạo nhân vật, thư viện, thử giọng).
- Chỉ ghi thêm vào cuối, không sửa dòng cũ. Báo cáo theo kênh, theo video, theo tháng đều là truy vấn trên một file này (`npm run cost -- --report`).
- `budget-guard` kiểm tra 3 mức: **video** (`video.json`), **kênh theo tháng** (`channel.json.budget.monthly`), **xưởng theo tháng** (`studio.json`). Vượt mức nào cũng chặn lệnh `--confirm`.
- Thay cho `data/cost.json` theo video và `data/cost-library.json` ở các mô tả cũ.

## 7. Dòng chảy dữ liệu một lần chạy

```
videos/k/s/script.ts ──build-script──► data/script.json
        │                                   │
        │ resolve(background…) ◄── channel library ◄── shared library
        ▼
 gen-images (hash → shared/cache/images) ┐
 gen-voice  (hash → shared/cache/voice)  ├──► data/manifest.json
 intro/outro (channels/k/templates)      ┘
        ▼
 storyboard ─► render từng scene (hash → shared/cache/render, hoặc build/scenes)
        ▼
 mix (build/audio-mix.wav) ─► assemble ─► output/<tag>/final.mp4 + .srt + thumbnail + publish.md
        └──► mỗi bước ghi ledger/cost.jsonl và data/runs.jsonl
```

## 8. Git, dung lượng, sao lưu

- **Commit:** code, `studio.json`, `channels/**` (cả `brand/`), `shared/characters/**` (cả `raw/`), `shared/library/**`, `videos/**/{video.json,script.ts,scenes,data}`, `ledger/`, `shared/cache/{images,voice}`.
- **Không commit:** `.env`, `videos/**/build/`, `videos/**/output/`, `shared/cache/render/`, `shared/audio/**/*.wav`, `docs/style/private/`, `.current-video`, `exports/`.
- Ảnh và voice trong `shared/cache` là thứ **mất tiền mới có**, nên phải sao lưu. Cache lớn dần thì dùng Git LFS: tạo `.gitattributes` với `shared/cache/images/*.png`, `shared/cache/voice/*.mp3`, `shared/library/**/*.png`, `shared/characters/**/*.png` filter=lfs. Hỏi người dùng trước khi bật LFS.
- Ảnh nền lưu PNG khi tạo, nhưng có thể chuyển WebP chất lượng 92 cho library để nhẹ (vẫn giữ hash cũ trong manifest).
- Mỗi lần gửi duyệt gắn git tag `<kenh>/<slug>-v1`, `-v2`… để quay lại bản cũ.

## 9. Lệnh dùng chung

```
npm run new:channel -- <kenh>          tạo channels/<kenh>/ (qua skill /kenh-moi)
npm run new:video   -- <kenh> "<chủ đề>"   tạo videos/<kenh>/<slug>/ + video.json (qua skill /video-moi)
npm run status                         bảng trạng thái cả xưởng
npm run cost -- --report [--channel k] [--month 2026-10]
npm run gc                             báo file cache mồ côi
npm run make -- --video k/slug [--type …]
```
Mọi script khác vẫn nhận `--video <kenh>/<slug>` và dùng `src/utils/resolve.ts` để tìm tài nguyên.
