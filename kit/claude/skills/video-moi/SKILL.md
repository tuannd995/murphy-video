---
name: video-moi
description: Làm trọn một video mới từ chủ đề tới bản final và các bản ngắn, qua 4 cổng duyệt. Dùng khi người dùng đưa một chủ đề video mới. Đầu vào là kênh và chủ đề.
---
Đầu vào: `<kênh> "<chủ đề>"`. Slug = chủ đề viết không dấu, gạch nối. Tạo `videos/<kênh>/<slug>/`.
Làm theo `kit/08-quy-trinh-video.md` (hoặc `docs/HUONG-DAN.md`):

1. **tham-tu** → `data/sources.md`.
2. **bien-kich** → `script.ts` (8–10 phút, chia khối, theo NARRATION.md) → `npm run script`.
3. **kiem-duyet** chấm lời thoại → `data/review.md`. Gửi người dùng: dàn ý, toàn bộ lời thoại tiếng Việt, điểm tự nhiên, câu bị gắn cờ.
   → **[CỔNG 1: DUYỆT KỊCH BẢN]**. Người dùng sửa câu nào thì sửa câu đó, chấm lại.
4. **hoat-hoa** code các scene (ảnh placeholder hoặc nền library), storyboard với thời lượng ước lượng, khung hình mẫu mọi scene thành tờ xem trước.
   → **[CỔNG 2: DUYỆT STORYBOARD]**.
5. **ke-toan** dry-run ảnh mới + voice: bảng chi phí. → **[CỔNG 3: DUYỆT CHI]** (đúng cụm "DUYỆT CHI").
6. Song song: **hoa-si** tạo ảnh và soát lỗi ∥ **am-thanh** đọc voice và soát câu bất thường. Sau đó `npm run sfx`, `npm run make -- --video <v>`.
7. **kiem-duyet** soát video. Gửi bản 720p xem trước, kèm thời lượng và đường dẫn bản 1080p. → **[CỔNG 4: DUYỆT FINAL]**.
8. Bản ngắn: `npm run make -- --video <v> --type=tiktok` và `--type=shorts --all-shortable`. Gửi người dùng.
9. Gợi ý 3 tiêu đề, 3 ý tưởng thumbnail (một từ đỏ, nhân vật biểu cảm), mô tả có chapters, hashtag. Commit.
