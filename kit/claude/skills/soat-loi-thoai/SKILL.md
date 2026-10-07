---
name: soat-loi-thoai
description: Chấm toàn bộ lời thoại của một video theo docs/style/NARRATION.md và đề xuất câu viết lại. Không tự sửa khi chưa được duyệt.
---
1. `npm run lint:narration -- --video <v>`: đếm từ đệm, dấu "...", câu ≤ 3 chữ, chuỗi câu cụt liên tiếp, đánh số "thứ nhất / thứ hai", câu kết "!".
2. Đọc toàn bộ lời thoại như đang nghe một người kể. Đánh dấu câu "có mùi AI", câu cố gây cười, câu chuyển ý máy móc.
3. Xuất bảng: scene/câu → câu gốc → vấn đề → câu đề xuất. Chấm điểm tự nhiên 1–10. Ghi vào `data/review.md`.
4. Hỏi người dùng muốn áp dụng câu nào.
