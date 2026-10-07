# 08 · Quy trình làm một video (áp dụng cho mọi video, mọi kênh)

Gọi bằng `/video-moi <kênh> "<chủ đề>"`. Slug = chủ đề viết không dấu, gạch nối. Mọi file riêng của video nằm trong **một thư mục con** `videos/<kênh>/<slug>/` (cấu trúc ở `10-cau-truc-du-an.md`); tài nguyên dùng lại nằm ở `channels/<kênh>/` và `shared/`. Mỗi cổng đạt thì cập nhật `status` trong `video.json`.

## Các bước
| # | Ai | Làm gì | Đầu ra |
|---|---|---|---|
| 1 | tham-tu | Tra cứu, kiểm chứng, tìm "hiểu lầm phổ biến" và "chi tiết ít người biết" | `data/sources.md` |
| 2 | bien-kich | Dàn ý 6–10 khối → lời kể liền mạch từng khối → tách lines → dịch EN → shots/acts/sfx/summary/shortable | `script.ts`, `data/script.json` |
| 3 | kiem-duyet | `lint:narration` + đọc như đang nghe, chấm điểm, đề xuất câu thay | `data/review.md` |
| **CỔNG 1** | người dùng | **DUYỆT KỊCH BẢN**: đọc toàn bộ lời thoại, sửa câu nào thì `/sua-cau` | |
| 4 | hoat-hoa | Code scene; nền lấy từ library hoặc placeholder; storyboard ước lượng; khung hình mẫu | `scenes/*.ts`, tờ xem trước |
| **CỔNG 2** | người dùng | **DUYỆT STORYBOARD**: góp ý từng scene qua `/duyet` | `data/feedback.json` |
| 5 | ke-toan | Dry-run ảnh mới và voice → bảng chi phí | |
| **CỔNG 3** | người dùng | **DUYỆT CHI** (đúng cụm này) | |
| 6 | hoa-si ∥ am-thanh | Tạo ảnh (soát lỗi, đưa vào library) ∥ đọc voice (soát câu bất thường) | ảnh, voice + timestamp |
| 7 | đạo diễn | `npm run sfx` (nếu chưa có), `npm run make -- --video <v>` | `output/youtube/final.mp4` |
| 8 | kiem-duyet | Soát video: khung hình mẫu, độ lớn âm, phụ đề | |
| **CỔNG 4** | người dùng | **DUYỆT FINAL**: xem bản 720p | |
| 9 | đạo diễn | Bản ngắn (`/shorts`), gợi ý tiêu đề, thumbnail, mô tả có chapters, hashtag → `output/<tag>/publish.md`; thăng hạng ảnh mới vào library; commit | |

## Khi chưa ưng: sửa đúng chỗ, không làm lại cả video
| Không ưng | Cách sửa | Tốn |
|---|---|---|
| Một câu thoại | `/sua-cau` → chỉ đọc lại câu đó (voice lưu theo hash) → render lại scene đó | vài chục credits |
| Một ảnh nền | `/sua-anh` → tạo lại đúng shot đó | ~$0,04 |
| Animation, bố cục | góp ý qua `/duyet` → hoat-hoa sửa code → render lại scene | $0 |
| Tư thế nhân vật thiếu | `/tu-the-moi` | ~$0,04 |
| Nhịp chung (quá nhanh, quá chậm) | chỉnh `TIMING` trong config (GAP, LEAD_IN, TAIL) → storyboard → render | $0 |
| Cả giọng văn | sửa `channel.json` / NARRATION.md, rồi `/soat-loi-thoai` lại | $0 tới khi đọc lại voice |

Mỗi lần gửi người dùng duyệt thì gắn git tag `<slug>-v1`, `-v2`… để quay lại bản cũ được.

## Gửi file cho người dùng
- Video xem trước: bản 720p (`ffmpeg -vf scale=1280:720 -crf 25`) để nhẹ. Báo kèm đường dẫn bản 1080p.
- Ảnh soát: ghép thành tờ xem trước (ffmpeg `tile`), không gửi từng ảnh lẻ.
- Báo thời lượng, chi phí đã dùng, việc cần người dùng quyết định.
