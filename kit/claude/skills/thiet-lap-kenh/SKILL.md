---
name: thiet-lap-kenh
description: Thiết lập kênh duy nhất (channel.json, brand, intro/outro) hoặc thêm một series mới vào kênh. Dùng lúc khởi tạo project hoặc khi muốn thêm mảng nội dung.
---
Dự án chỉ có MỘT kênh. Skill này chạy một lần lúc khởi tạo, sau đó dùng để thêm series.

**Lần đầu (chưa có channel.json):**
1. Hỏi người dùng (gợi ý sẵn đáp án từ kit/06-kenh-dinh-dang.md): tên kênh · tagline · giọng văn · màu chủ đạo · nhân vật (dùng hero hay tạo mới) · giọng đọc · các series ban đầu.
2. Tạo `channel.json` theo mẫu trong kit/06-kenh-dinh-dang.md, gồm `budget` (video và tháng), `"audience": "not_made_for_kids"`. Tạo `brand/`, `series/`, `templates/`.
3. Viết intro và outro vào `templates/intro.ts`, `outro.ts`: đưa người dùng chọn 1 trong 3 bản lời chào và 1 trong 3 bản lời kết ở kit/13-loi-chao-ket.md (đổi tên kênh nếu khác), theo docs/style/NARRATION.md (tự nhiên, không chèn câu đùa). Giữ cố định để voice được cache. Chạy `npm run lint:narration` trên đoạn đó.
4. Nếu cần nhân vật mới: đề xuất /nhan-vat-moi. Nếu cần palette hay nhạc mới: thêm mood nhạc vào `src/audio/synth.ts` (không tốn tiền).
5. Gợi ý 3 mô tả kênh YouTube và bio TikTok (dưới 80 ký tự) kèm hashtag. Nhắc người dùng kiểm tra tên còn trống không.

**Thêm series:** hỏi tên, mô tả, thời lượng, nhạc mặc định → tạo `series/<id>.json` và `templates/<id>.skeleton.ts` (hook → bối cảnh → thân → kết, chia khối 60–90 giây). Không tạo kênh mới.
