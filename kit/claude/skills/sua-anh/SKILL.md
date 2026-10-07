---
name: sua-anh
description: Sửa một ảnh nền bị lỗi (khung thừa, chữ, logo, có người, sai style, sai bố cục). Đầu vào là video, shot và mô tả lỗi.
---
1. Mở ảnh hiện tại, xác nhận lỗi. Sửa prompt của shot trong `script.ts`: thêm ràng buộc phủ định cụ thể, đổi cách mô tả bố cục.
2. Dry-run → DUYỆT CHI → `npm run images -- --video <v> --only=<shot> --force --confirm`.
3. Ghép ảnh trước/sau cạnh nhau, gửi người dùng. Render lại khung hình mẫu scene đó.
