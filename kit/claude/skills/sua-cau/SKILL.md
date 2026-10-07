---
name: sua-cau
description: Sửa một câu thoại rồi chỉ đọc lại và render lại phần liên quan. Đầu vào là video, scene, số câu và câu mới.
---
1. Kiểm tra câu mới theo NARRATION.md. Có vấn đề thì đề xuất phương án tự nhiên hơn trước khi sửa.
2. Sửa `lines[i]` (vi + en) trong `script.ts`, chạy `npm run script`.
3. Dry-run voice (chỉ câu đó, vì voice lưu theo hash) → DUYỆT CHI → `npm run voice -- --video <v> --confirm`.
4. `npm run storyboard`, render lại riêng scene đó (`npm run render -- --only=<scene>`), `npm run mix`, `npm run final`.
5. Gửi đoạn video của scene vừa sửa.
