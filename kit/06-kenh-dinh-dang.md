# 06 · Kênh, định dạng, chính sách nền tảng

## 1. `channel.json` ở gốc project (một kênh duy nhất; ví dụ cho kênh kiến thức)
```json
{
  "id": "nao-phang",
  "name": "Não Phẳng",
  "tagline": "Những điều thú vị không phải ai cũng biết",
  "topic": "kiến thức ít ai biết, hiện tượng đời thường, tâm lý, khoa học vui",
  "tone": "kể chuyện tự nhiên, hài nhẹ đến từ tình huống (luôn tuân theo docs/style/NARRATION.md)",
  "palette": { "paper": "#f6eedc", "ink": "#151515", "accent": "#e0362c" },
  "character": "hero",
  "voice": { "provider": "elevenlabs", "voiceId": "SMacAogENyIWv6UtGuXB", "model": "eleven_turbo_v2_5", "fallbackVoiceId": "RxhjHDfpO54FYotYtKpw" },   // voiceId = giọng của chính người dùng (mặc định); Phong chỉ là dự phòng
  "music": { "default": "curious", "outro": "warm" },
  "intro": { "fixed": true, "ref": "13-loi-chao-ket.md, lời chào B" },   // CỐ ĐỊNH: tạo một lần bằng npm run fixed, lưu ở templates/fixed/ (xem 13 mục 7)
  "outro": { "fixed": true, "ref": "13-loi-chao-ket.md, lời kết A" },
  "cta": { "tiktok": "Follow để xem thêm", "shorts": "Xem bản đầy đủ trên YouTube Não Phẳng", "reels": "Theo dõi Não Phẳng để xem thêm" },
  "budget": { "videoImagesUsd": 1, "videoVoiceCredits": 6000, "monthlyUsd": 8, "monthlyVoiceCredits": 60000 },
  "targetMinutes": [8, 10],
  "audience": "not_made_for_kids"
}
```
Kênh còn có `brand/` (logo, banner, watermark, avatar, thumbnail mẫu), `templates/` (`intro.ts`, `outro.ts`, khung kịch bản theo series) và `series/` như mô tả ở `10-cau-truc-du-an.md`. Lời intro và outro: xem `13-loi-chao-ket.md` (quy luật, 3 bản lời chào, 3 bản lời kết, ghi chú giọng) và phải tuân theo `NARRATION.md`. Ví dụ hướng intro người dùng thích: *"nơi tìm hiểu những điều không phải ai cũng biết, để nghe lúc làm việc, ăn uống, dọn nhà hay trước khi ngủ, và có thêm chuyện để kể với bạn bè."* Viết lại cho tự nhiên, không chèn câu đùa.

## 2. Một kênh, nhiều series
Chỉ có **một kênh**. Các mảng nội dung là **series** (`series/<id>.json`) trong cùng kênh, dùng chung nhân vật, thương hiệu, intro/outro, library và cache. Mỗi series chỉ khác khung kịch bản, thumbnail mẫu, thời lượng và nhạc mặc định.

| Series | Chủ đề | Thời lượng | Ghi chú |
|---|---|---|---|
| **What If** | "Nếu… thì sao?" | 8–10 phút | Series chủ lực, dễ lan truyền. |
| **Câu hỏi kỳ lạ** | Những thắc mắc ai cũng từng nghĩ mà ít người trả lời | 8–10 phút | Lấy câu hỏi làm hook. |
| **Nghịch lý đời thường** | Hiện tượng quen thuộc có lời giải bất ngờ | 8–10 phút | Ví dụ bánh mì luôn úp bơ xuống sàn. |

Thêm series mới chỉ cần thêm `series/<id>.json` và một khung `templates/<id>.skeleton.ts`, không cần tạo kênh. Nếu chủ đề lệch hẳn (ví dụ nội dung trẻ em, mục 5) thì đó là **một project khác** dùng lại kit này, không trộn vào kênh.

Gợi ý tên kênh (cần kiểm tra trùng): Não Phẳng · Ủa Vậy Hả? · Biết Rồi Khổ Lắm.

## 3. Định dạng theo nền tảng
- **Ưu tiên số 1: YouTube dài 8–10 phút.** Từ 8 phút trở lên mới chèn được quảng cáo giữa video (mid-roll). Muốn đủ độ dài thì **thêm khối nội dung**, không giãn nhịp đọc.
- Kịch bản chia **khối 60–90 giây**, mỗi khối tự đứng được. Đánh dấu `summary` và `shortable` để cắt ra các bản ngắn.
- Mỗi video dài nên kèm: 1 TikTok trên 1 phút (`--type=tiktok`), 4–6 Shorts/Reels (`--all-shortable`), và một bản Facebook nếu có fanpage.
- **Thumbnail + tiêu đề** quyết định phần lớn lượt xem. Thumbnail theo style vẽ tay: một từ đỏ to, nhân vật biểu cảm mạnh, tối đa 4–5 chữ. Làm 2–3 phương án để A/B test (YouTube "Test & Compare").

## 4. Chính sách cần tuân thủ (theo thông tin tháng 10/2026, nên kiểm tra lại định kỳ)
- **YouTube Partner Program:** cần 1.000 người đăng ký + 4.000 giờ xem trong 12 tháng (hoặc 10 triệu view Shorts trong 90 ngày). **Từ 1/2/2027**, kênh mới cần **8.000 giờ** hoặc 20 triệu view Shorts. Kênh đã được duyệt trước ngày đó thì giữ điều kiện cũ.
- **"Inauthentic content"** (tên cũ là "repetitious content"): YouTube tắt kiếm tiền với kênh làm nội dung hàng loạt na ná nhau, ví dụ slideshow đọc giọng máy hay đăng 10+ video/ngày. AI vẫn được dùng làm công cụ. Cách tránh:
  - mỗi video có góc nhìn riêng và có người duyệt;
  - hình ảnh và animation khác nhau giữa các video;
  - đăng 1–2 video dài/tuần/kênh.
- **Nhãn nội dung AI:** bật nhãn "altered or synthetic content" nếu nội dung trông như thật hoặc giọng AI giống người thật. Hoạt hình vẽ tay thường không bắt buộc, nhưng nên bật nếu có nghi ngờ.
- **TikTok Creator Rewards:** chỉ trả tiền cho video trên 1 phút. Tài khoản cần 10k follower, 100k view trong 30 ngày, chủ tài khoản 18+. Kiểm tra trong Creator Tools xem Việt Nam đã được tham gia chưa.
- **Bản quyền:** nhạc và SFX tự tổng hợp. Nhạc AI chỉ dùng từ gói có quyền thương mại. Không dùng tên, tagline, nhân vật hay giọng của kênh khác.

## 5. Nội dung trẻ em: không trộn vào kênh này
- Gắn nhãn "Made for Kids" (luật COPPA) **tắt** quảng cáo cá nhân hoá, bình luận, chuông thông báo, màn hình kết thúc và thẻ, nút lưu playlist, bài đăng cộng đồng. Vì vậy kênh này đặt `"audience": "not_made_for_kids"` và không làm nội dung nhắm trẻ em.
- Nếu sau này muốn làm kênh trẻ em, tạo **project mới** từ kit (nhân vật, palette, kênh riêng). YouTube đang siết mạnh "AI slop" cho trẻ em (tháng 4/2026 hơn 200 tổ chức gửi thư tới Google/YouTube) nên cần quy trình duyệt chất lượng chặt, nội dung giáo dục thật, không giật gân, không màu nhấp nháy.

## 6. Lộ trình gợi ý
1. **Từ nay đến 2/2027:** mỗi tuần 1 video dài và khoảng 5 clip ngắn, cố đạt điều kiện kiếm tiền cũ. Xoay vòng 3 series để xem series nào có số liệu tốt nhất.
2. **Đánh giá sau khoảng 12 video dài:** CTR trên 4–5%, thời gian xem trung bình trên 35–40%. Chưa có video nào vượt mức trung bình của kênh khoảng 3 lần thì đổi chủ đề hoặc cách trình bày trước khi tăng số lượng.
3. **Sau đó:** dồn video vào series tốt nhất, giữ các series còn lại ở nhịp thưa hơn.

## 7. Chi phí tham khảo mỗi video (khi đã có bộ nhân vật và thư viện nền)
| | Video 8–10 phút |
|---|---|
| Ảnh | $0,25–0,40 (giảm dần khi library đầy) |
| Voice (ElevenLabs) | ~3–3,5k credits (intro/outro là tài sản cố định, không tính lại) |
| Nhạc / SFX / render | $0 |

Chi phí cố định mỗi tháng: ElevenLabs (gói Starter hoặc Creator tuỳ nhu cầu), gói Claude, cộng tiền API.
