---
name: kenh-moi
description: Tạo một kênh mới (channels/<id>/channel.json) với tên, chủ đề, giọng văn, màu, nhân vật, giọng đọc, nhạc, CTA. Dùng khi người dùng muốn mở kênh hoặc series mới.
---
1. Hỏi người dùng 6 câu (gợi ý sẵn đáp án từ kit/06-kenh-dinh-dang.md):
   tên kênh · chủ đề · đối tượng (có phải trẻ em không) · cảm giác/giọng văn · màu chủ đạo · nhân vật (dùng hero hay tạo mới) · giọng đọc.
2. Tạo `channels/<id>/channel.json` theo mẫu trong kit/06-kenh-dinh-dang.md.
   Kênh trẻ em: đặt `"audience": "made_for_kids"`, ghi chú các tính năng bị tắt, và không dùng nhạc hay nội dung đáng sợ.
3. Viết intro và outro theo docs/style/NARRATION.md (tự nhiên, không chèn câu đùa), chạy `npm run lint:narration` trên đoạn đó.
4. Nếu kênh cần nhân vật mới: đề xuất chạy /nhan-vat-moi. Nếu cần palette hay nhạc mới: thêm mood nhạc vào `src/audio/synth.ts` (không tốn tiền).
5. Gợi ý 3 mô tả kênh YouTube và bio TikTok (dưới 80 ký tự) kèm hashtag. Nhắc người dùng kiểm tra tên còn trống không.
