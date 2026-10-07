---
name: tu-the-moi
description: Thêm một tư thế hoặc biểu cảm mới vào bộ tư thế của nhân vật có sẵn. Dùng khi kịch bản cần hành động mà bộ tư thế chưa có (ngồi, ôm đầu, cầm điện thoại…).
---
Đầu vào: `<id> <tên-tư-thế> "<mô tả hành động>"`.
1. Kiểm tra `characters/<id>/<id>.json` xem đã có tư thế tương tự chưa. Có thì đề xuất dùng lại, hoặc dùng `flip` để lật hướng.
2. Thêm mục vào `poses` (hoặc `variants` nếu chỉ đổi mắt/miệng của tư thế có sẵn; variant dùng ảnh gốc làm nền nên giống hơn).
3. Dry-run → DUYỆT CHI → `npm run character -- <id> --only=<tên> --confirm`.
4. Cập nhật sheet.png, gửi người dùng xem. Commit.
