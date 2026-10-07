# 06 · Kênh, định dạng, chính sách nền tảng

## 1. `channels/<kenh>/channel.json` (ví dụ cho một kênh kiến thức; mỗi kênh một file)
```json
{
  "id": "nao-phang",
  "name": "Não Phẳng",
  "tagline": "Những điều thú vị không phải ai cũng biết",
  "topic": "kiến thức ít ai biết, hiện tượng đời thường, tâm lý, khoa học vui",
  "tone": "kể chuyện tự nhiên, hài nhẹ đến từ tình huống (luôn tuân theo docs/style/NARRATION.md)",
  "palette": { "paper": "#f6eedc", "ink": "#151515", "accent": "#e0362c" },
  "character": "hero",
  "voice": { "provider": "elevenlabs", "voiceId": "RxhjHDfpO54FYotYtKpw", "model": "eleven_turbo_v2_5" },
  "music": { "default": "curious", "outro": "warm" },
  "intro": { "lines": ["Xin chào các bạn, chào mừng các bạn quay trở lại với Não Phẳng."] },
  "outro": { "lines": [] },
  "cta": { "tiktok": "Follow để xem thêm", "shorts": "Xem bản đầy đủ trên YouTube Não Phẳng", "reels": "Theo dõi Não Phẳng để xem thêm" },
  "budget": { "monthlyUsd": 8, "monthlyVoiceCredits": 60000 },   // chặn ở mức kênh (ghi đè studio.json)
  "targetMinutes": [8, 10],
  "audience": "not_made_for_kids"
}
```
Mỗi kênh còn có thư mục `brand/` (logo, banner, watermark, avatar, thumbnail mẫu) và `templates/` (`intro.ts`, `outro.ts`, khung kịch bản theo dạng video) như mô tả ở `10-cau-truc-du-an.md`. Lời intro và outro cũng phải tuân theo `NARRATION.md`. Ví dụ hướng intro người dùng thích: *"nơi tìm hiểu những điều không phải ai cũng biết, để nghe lúc làm việc, ăn uống, dọn nhà hay trước khi ngủ, và có thêm chuyện để kể với bạn bè."* Viết lại cho tự nhiên, không chèn câu đùa.

## 2. Ba kênh và thứ tự triển khai
| Kênh | Chủ đề | Thời lượng | Ghi chú |
|---|---|---|---|
| **Não Phẳng** (làm trước) | Kiến thức ít ai biết | 8–10 phút | Pipeline hợp nhất. Tông vẽ tay nền kem. |
| **Phòng 404** (thử 2–3 tập dạng series "Não Phẳng giải mã", số liệu tốt thì tách kênh) | Bí ẩn, truyền thuyết đô thị, thuyết âm mưu | 10–15 phút | Luôn đóng khung "người ta kể / theo truyền thuyết" và có phần phân tích. Tránh y tế, bầu cử, thảm hoạ có thật. |
| **Kênh trẻ em** (làm sau cùng) | Bài hát, kể chuyện | Clip 3–5 phút và bản tổng hợp 30–60 phút | Xem mục 5. Nhân vật và palette riêng, tươi, tròn trịa. |

Gợi ý tên kênh (cần kiểm tra trùng): Não Phẳng · Ủa Vậy Hả? · Biết Rồi Khổ Lắm / Phòng 404 · Hồ Sơ Nửa Đêm · Đèn Pin Lúc 3 Giờ / Cú Mèo Kể Chuyện · Nốt Nhạc Tí Hon · Làng Bé Bông.

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

## 5. Kênh trẻ em: luật riêng
- **Bắt buộc gắn nhãn "Made for Kids"** (luật COPPA). Khi gắn nhãn, YouTube **tắt**: quảng cáo cá nhân hoá (chỉ còn quảng cáo theo ngữ cảnh, RPM thấp), bình luận, chuông thông báo, màn hình kết thúc và thẻ, nút lưu playlist, bài đăng cộng đồng.
- **Kiếm tiền:**
  - video tổng hợp 30–60 phút (nhiều quảng cáo giữa video);
  - phát hành bài hát lên các nền tảng nhạc (Spotify/Apple Music, qua nhà phân phối), chỉ khi sở hữu quyền bài hát;
  - tài trợ nhắm tới **phụ huynh**;
  - bán bản quyền nội dung cho app hoặc nền tảng trẻ em.
- Quảng bá bằng quảng cáo trả phí: chỉ nhắm **phụ huynh** (25–44 tuổi, sở thích nuôi dạy con). Không nhắm trẻ em.
- **Rủi ro:** áp lực lớn về "AI slop" cho trẻ em (tháng 4/2026 hơn 200 tổ chức đã gửi thư tới Google/YouTube). YouTube Kids chỉ nhận một nhóm nhỏ kênh AI chất lượng cao. Nội dung phải có giá trị giáo dục: không giật gân, không màu nhấp nháy, không đề tài đáng sợ. TikTok gần như không dùng được cho mảng này (người dùng phải 13+).

## 6. Lộ trình gợi ý
1. **Từ nay đến 2/2027:** dồn sức cho Não Phẳng, mỗi tuần 1 video dài và khoảng 5 clip ngắn, cố đạt điều kiện kiếm tiền cũ. Thử 2–3 tập bí ẩn.
2. **Đánh giá sau khoảng 12 video dài:** CTR trên 4–5%, thời gian xem trung bình trên 35–40%. Chưa có video nào vượt mức trung bình của kênh khoảng 3 lần thì đổi chủ đề hoặc cách trình bày trước khi tăng số lượng.
3. **Quý 1–2/2027:** tách Phòng 404 nếu số liệu tốt. Kênh trẻ em chỉ làm khi đã có quy trình duyệt chất lượng chặt.

## 7. Chi phí tham khảo mỗi video (khi đã có bộ nhân vật và thư viện nền)
| | Kiến thức 8–10 phút | Bí ẩn 10–15 phút | Trẻ em |
|---|---|---|---|
| Ảnh | $0,25–0,40 | $0,40–0,60 | $0,30–0,50 |
| Voice (ElevenLabs) | ~3–3,5k credits | ~4,5–6,5k credits | ~1,5–2,5k credits |
| Nhạc / SFX / render | $0 | $0 | Bài hát AI ~$0,02–0,05 |

Chi phí cố định mỗi tháng nếu chạy đủ 3 kênh: ElevenLabs Creator $22, Suno Pro khoảng $10, gói Claude, cộng tiền API.
