# 04 · Hình ảnh và nhân vật

## 1. Ảnh mẫu (trong kit, copy vào `docs/style/`)
| File | Dùng để |
|---|---|
| `assets/style/hero-model-sheet.png` | Nhân vật mẫu "hero" (tên tạm "Phẳng"): thiết kế chuẩn, dùng làm reference khi tạo tư thế mới của hero, và làm reference **về nét vẽ** khi tạo nhân vật mới. |
| `assets/characters/hero/sheet.png` | Bộ 15 tư thế đã có (`poses/*.png`, nền trong suốt). Dùng ngay, **không tạo lại**. |
| `assets/style/scene-example-desk.png` | Ví dụ cảnh trong nhà, dùng làm ảnh reference style khi tạo nền. |
| `assets/style/scene-example-street.png` | Ví dụ cảnh ngoài phố. |

Lưu ý:
- Hai ảnh cảnh mẫu có vẽ sẵn nhân vật. Đó là phiên bản cũ; ảnh nền mới **không** vẽ nhân vật.
- Ảnh tham khảo của kênh khác chỉ để trong `docs/style/private/` (gitignore). Dùng để cảm nhận phong cách, **không sao chép** nhân vật hay bố cục.

## 2. Quy tắc phong cách mặc định (ghi vào `docs/style/STYLE.md`; kênh khác có thể đổi palette trong channel.json, giữ nguyên tinh thần vẽ tay)
- **Nét:** vẽ tay kiểu doodle, mực đen đậm, hơi run tay, viền dày. Màu phẳng, không gradient, gần như không đổ bóng.
- **Màu:** nền giấy kem `#f6eedc`, mực `#151515`, da trắng ngà `#fbf7ee`. Áo nhân vật chính xanh nhạt `#8cc4e4`, quần navy `#2b3445`. Đỏ nhấn `#e0362c` dùng rất ít.
- **Nhân vật:** đầu tròn to (khoảng 1/3 chiều cao), mắt chấm, lông mày dày biểu cảm, mũi là một nét cong nhỏ, tay chân mảnh. Biểu cảm phóng đại: giọt mồ hôi, đường sốc, dấu hỏi.
- **Cảnh:** phối cảnh bằng vài đường thẳng, chi tiết nét mảnh, nhiều khoảng trống, màu rất ít.
- **Chữ trên hình:** do code vẽ (Inter ExtraBold), AI không vẽ chữ. Tiêu đề kiểu thumbnail: một từ khoá màu đỏ, phần còn lại màu đen.
- **Cấm:** ảnh chân thực, 3D, anime, gradient, logo hoặc thương hiệu thật (kể cả logo Apple trên laptop), watermark, chữ trong ảnh.

`src/config/style.ts`:
```ts
export const STYLE =
  "hand-drawn doodle cartoon like a minimalist explainer YouTube channel, simple stick-figure-like characters with round heads, " +
  "thick slightly uneven black ink outlines, flat minimal coloring with almost no shading, warm cream paper background, " +
  "very limited palette (black ink, white, cream, light blue, small bold red accents), simple perspective line-drawn rooms and props, " +
  "comedic exaggerated poses, motion lines and sweat drops, lots of clean empty cream space, no gradients, no photorealism, no 3D, " +
  "no anime, no text, no letters, no typography, no watermark, no logo, no brand marks, 16:9";
export const BACKGROUND_SUFFIX = "no people, no characters, empty scene";
```

## 3. Nền dùng lại (`library/backgrounds/`)
- `index.json`: `[{ id, file, tags: ["bếp","trong nhà","buổi sáng"], prompt, created, usd }]`.
- Skill `/canh-moi` luôn tìm theo tag trước, không có mới tạo (cần DUYỆT CHI).
- Mục tiêu sau khoảng 5 video: mỗi video mới chỉ cần 3–5 nền mới.

## 4. Hệ thống bộ tư thế (sprite)
Nhân vật **không** vẽ vào ảnh nền. Mỗi nhân vật có một bộ ảnh tư thế được tạo **một lần** rồi dùng mãi. Mọi chuyển động do code tạo.

### `characters/<id>/<id>.json` (mẫu: `kit/assets/characters/hero/hero.json`)
```json
{ "id": "hero", "name": "Phẳng", "description": "...", "reference": "docs/style/hero-model-sheet.png", "heightPx": 620,
  "poses": [ { "id": "stand", "prompt": "standing relaxed facing the viewer..." }, { "id": "happy", "prompt": "...", "height": 1.18 } ],
  "variants": [ { "id": "stand-talk", "base": "stand", "edit": "keep the image exactly identical..., only change the mouth so it is open as if speaking" },
                { "id": "stand-blink", "base": "stand", "edit": "... only change the eyes so they are closed" } ] }
```
- Bộ tư thế chuẩn: `stand, think, point, shock, happy, sad, angry, facepalm, shrug, thumbsup, walk-a, walk-b, run`, cộng 2 biến thể `stand-talk` và `stand-blink`.
- `height` là hệ số chiều cao hiển thị cho tư thế giơ tay hoặc chạy (ví dụ happy 1.18, run 0.86), để các tư thế đứng có cùng tỉ lệ.

### Tạo bằng AI (`npm run character -- hero [--confirm] [--only=pose] [--force] [--key-only]`)
- Mỗi tư thế gửi kèm ảnh model sheet làm reference, `image_config.aspect_ratio = "3:4"`. Câu prompt chốt:
  `"Draw ONLY this one character, full body from head to shoes, centered, filling about 85% of the image height. Same character design and same hand-drawn doodle style as the reference... Background: one solid flat pure green color (#00FF00) everywhere, no floor, no shadow, no props, no text, no frame."`
- Biến thể (variant): gửi **ảnh raw của tư thế gốc** cùng câu lệnh sửa ("keep the image exactly identical, only change …"). Model sửa rất sát ảnh gốc.
- Lưu ảnh gốc ở `raw/<pose>.png` (commit lại, để tách nền lại được mà không tốn tiền). Ảnh đã tách nền lưu ở `poses/<pose>.png`.
- ⚠ Model **không** trả về nền xanh thuần (thường là xanh xám nhạt, có vân giấy). Đừng tách nền theo ngưỡng "độ xanh" cố định. Dùng thuật toán dưới đây.

### Tách nền (dùng cho cả ảnh AI lẫn ảnh tự vẽ, nền màu nào cũng được)
```ts
// 1) màu nền = trung vị các điểm ở viền ảnh
// 2) loang (flood fill) từ mép vào trong qua các điểm có khoảng cách màu RGB tới nền < tol (62) → trong suốt
// 3) xoá thêm các điểm còn lại có khoảng cách < tol*0.5 (nền bị kẹp giữa tay và hông)
// 4) điểm sát vùng đã xoá: alpha = clamp((dist - tol*0.5)/(tol*1.2)); khử màu nền: c' = (c - bg*(1-a))/a
// 5) cắt sát theo bounding box (alpha > 24), chừa lề 6px
```
Ảnh tự vẽ: lưu mỗi tư thế vào `characters/<id>/raw/<pose>.png` trên **nền một màu trơn**, khác màu nhân vật, rồi chạy `--key-only` ($0).

### Vẽ nhân vật trong scene: `drawSprite(ctx, char, state, {x, y, height, flip})`
- **Đổi khung** theo tư thế; khi đổi thì **nảy** nhẹ (scale 0.9 → easeOutBack → 1 trong 0,35s).
- **Thở:** scaleY = 1 + 0.012·sin(2.4t).
- **Nét rung kiểu vẽ tay:** 8 lần/giây xoay ±0,35° và dịch ±1,2px (giá trị ngẫu nhiên có seed theo nhịp).
- **Chớp mắt:** tư thế `stand` đổi sang `stand-blink` trong khoảng 3,5% mỗi chu kỳ 3,6 giây.
- **Nhép miệng:** khi đang nói và độ mở miệng > 0.28 thì `stand` đổi sang `stand-talk`.
- **Đi bộ:** luân phiên `walk-a`/`walk-b` 6 khung/giây, nhún 10px. **Chạy:** `run`, nhún 16px.
- **Lật hướng:** `flip` đổi trái/phải, không cần ảnh mới.
- Bóng: ellipse `rgba(0,0,0,0.12)` dưới chân.
- Kích thước tham khảo: khung 1920×1080, nhân vật cao 560–620px, đặt chân ở y khoảng 880.

### Độ mở miệng (lip-sync)
```ts
// decode voice → mono 16kHz → RMS mỗi 1/30s → chuẩn hoá theo percentile 95 → (r/peak - 0.08)*1.2 → clamp 0..1
// làm mượt: mở nhanh (hệ số 0.7), khép chậm (0.35). Đo một lần, lưu data/mouth/<hash>.json
```

### Diễn xuất theo câu thoại (`acts`)
```ts
acts: [ { line: 0, pose: "stand", x: 1350 }, { line: 2, pose: "shock" }, { line: 4, pose: "stand", walkTo: 600 } ]
```
Storyboard đổi `acts` thành mốc thời gian. Scene gọi `drawActor(ctx, t, s)`. Khi nhân vật đang ở tư thế `stand` và câu thoại đang phát, tự nhép miệng.

### Nhân vật vẽ hoàn toàn bằng code (tuỳ chọn)
`src/character/doodle.ts` (rig 2 xương với IK, biểu cảm vẽ bằng code) **chỉ dùng cho vai phụ hoặc đám đông**. Mặt nhân vật kiểu này kém duyên hơn ảnh vẽ, nên không dùng cho nhân vật chính.

## 5. Kênh khác dùng palette khác
Ví dụ kênh bí ẩn: nền xanh đen `#1b2230`, nét kem, nhấn đỏ máu `#b3302a`, nhạc `mystery`. Nhân vật riêng, tạo bằng `/nhan-vat-moi`.
