---
name: duyet
description: Tạo trang hoặc tờ duyệt storyboard (khung hình mẫu mọi scene, kèm lời thoại) để người dùng góp ý từng scene, rồi gom góp ý thành việc cần sửa.
---
1. Render khung hình mẫu ở giữa mỗi câu thoại của mọi scene, ghép tờ xem trước theo scene (ffmpeg tile, có tên scene và câu thoại).
2. Gửi người dùng (hoặc tạo trang HTML duyệt nếu có công cụ artifact).
3. Góp ý của người dùng ghi vào `data/feedback.json`: `[{scene, line?, type: "hinh"|"loi"|"am-thanh"|"nhip", note}]`.
4. Phân việc: lời thoại → bien-kich; hình/animation → hoat-hoa; ảnh → hoa-si (DUYỆT CHI); âm thanh → am-thanh. Làm xong render lại riêng các scene liên quan.
