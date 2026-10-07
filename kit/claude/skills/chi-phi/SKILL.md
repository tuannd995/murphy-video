---
name: chi-phi
description: Báo cáo chi tiêu (OpenRouter + ElevenLabs) theo video, theo kênh và theo tháng; xem quota còn lại.
---
1. Đọc mọi `videos/*/*/data/cost.json` và `data/cost-library.json`. Gom theo tháng, kênh, video, hạng mục (ảnh, nhân vật, voice).
2. Gọi endpoint miễn phí: OpenRouter `/key` (đã dùng, hạn mức), ElevenLabs `/user/subscription` (credits đã dùng / giới hạn, ngày reset).
3. Trả bảng tổng kết, chi phí trung bình mỗi video, dự báo số video còn làm được trong tháng với quota hiện tại.
