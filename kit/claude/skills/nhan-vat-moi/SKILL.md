---
name: nhan-vat-moi
description: Tạo bộ tư thế cho một nhân vật mới (ảnh tư thế nền trong suốt + chuyển động bằng code). Hỗ trợ ảnh người dùng tự vẽ hoặc AI vẽ. Dùng khi cần nhân vật mới cho kênh hoặc video.
---
1. Hỏi: id (chữ thường, gạch nối), tên, ngoại hình (tóc, áo, màu, phụ kiện), tính cách, kênh dùng. Nguồn ảnh: tự vẽ hay AI.
2. Tạo `characters/<id>/<id>.json` theo mẫu `characters/hero/hero.json` (13 tư thế chuẩn + 2 biến thể stand-talk, stand-blink). Thêm tư thế riêng nếu kênh cần.
3a. **Ảnh tự vẽ** (thường nằm trong `inbox/<id>/`):
    - Cần mỗi tư thế một file, nền một màu trơn, khác màu nhân vật.
    - Copy thành `characters/<id>/raw/<pose>.png`, chạy `npm run character -- <id> --key-only` ($0).
3b. **AI vẽ:**
    - Tạo model sheet trước (1 ảnh, 3 góc: chính diện, 3/4, cận mặt biểu cảm), theo style docs/style/STYLE.md, dùng ảnh mẫu `docs/style/hero-model-sheet.png` làm reference **về nét vẽ**, không phải ngoại hình. Dry-run, rồi DUYỆT CHI.
    - Gửi model sheet cho người dùng duyệt. Chưa ưng thì sửa mô tả và tạo lại (tối đa 3 lần, mỗi lần đều DUYỆT CHI).
    - Lưu thành `docs/style/<id>-model-sheet.png`, đặt `reference` trong json.
    - `npm run character -- <id>` (dry-run, khoảng $0,04/ảnh, khoảng $0,6 cả bộ). DUYỆT CHI rồi chạy `--confirm`.
4. `npx tsx scripts/character-sheet.ts <id>` và gửi sheet.png. Tư thế lỗi thì `--only=<pose> --force` (DUYỆT CHI từng lần).
5. `npx tsx scripts/sprite-demo.ts <id>`, gửi clip demo (nảy khi đổi tư thế, thở, chớp mắt, nhép miệng, đi bộ, chạy).
6. Commit `characters/<id>/` (cả raw/ để tách nền lại không tốn tiền).
