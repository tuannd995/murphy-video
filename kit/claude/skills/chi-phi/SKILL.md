---
name: chi-phi
description: Báo cáo chi tiêu (OpenRouter + ElevenLabs) theo video, theo series và theo tháng; xem quota còn lại.
---
1. Chạy `npm run cost -- --report` (đọc `ledger/cost.jsonl`), có thể thêm `--series` hoặc `--month`. Gom theo tháng, series, video, hạng mục (ảnh, nhân vật, voice) và nêu tiền tiết kiệm nhờ cache. Chạy `npm run status` để xem chi phí cạnh trạng thái từng video.
2. Gọi endpoint miễn phí: OpenRouter `/key` (đã dùng, hạn mức), ElevenLabs `/user/subscription` (credits đã dùng / giới hạn, ngày reset).
3. Trả bảng tổng kết, chi phí trung bình mỗi video, dự báo số video còn làm được trong tháng với quota hiện tại.
