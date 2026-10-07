---
name: shorts
description: Tạo các bản ngắn (TikTok, YouTube Shorts, Reels, Facebook) từ một video dài đã xong, dùng lại voice và hình có sẵn.
---
1. Kiểm tra `summary` và `shortable` trong script. Nếu thiếu, đề xuất (khối tự đứng được, có hook trong 2 giây đầu) và hỏi duyệt.
2. `npm run make -- --video <v> --type=tiktok` (tóm tắt, > 1 phút), `--type=shorts --all-shortable`, `--type=reels --all-shortable`, `--type=facebook` nếu cần.
3. Kiểm tra thời lượng theo bảng định dạng. Clip nào thiếu hook ở 2 giây đầu thì đề xuất 1 câu mở đầu riêng cho bản ngắn (viết theo NARRATION.md; đọc thêm câu đó cần DUYỆT CHI).
4. Gửi danh sách file kèm thời lượng, cùng gợi ý caption và hashtag cho từng nền tảng.
