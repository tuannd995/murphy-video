# 13 · Lời chào (intro) và lời kết (outro) của kênh

> **ĐÃ CHỐT:** lời chào **B** và lời kết **A** (mục 2 và 3). Hai đoạn này là **tài sản cố định**: tạo giọng và dựng hình **một lần** lúc thiết lập kênh, lưu ở `templates/fixed/`, rồi mọi video chỉ ghép vào. **Không đọc lại bằng TTS, không gọi ElevenLabs, không render lại cho từng video** (mục 7). Các bản A, C của lời chào và B, C của lời kết chỉ để tham khảo.

> Viết cho kênh Não Phẳng, **học cách mở và đóng tập** của một kênh kiến thức tiếng Việt khác (xem `11-phong-cach-giong-ke.md`), không dùng lại câu chữ. Đổi tên kênh thì sửa tên trong từng câu, giữ nguyên quy luật.
> Intro và outro là tài sản cố định (`templates/fixed/`, xem mục 7), nên chọn **một** bản và giữ mãi.

## 1. Quy luật rút ra
**Lời chào (mở tập):**
- Một câu tuyên ngôn dài liền mạch nói **kênh mang lại gì cho người nghe**, có một **đối lập** (khô khan ↔ vui, lạ ↔ dễ hiểu), rồi mới đến câu chào tên kênh. Không mở bằng "Xin chào các bạn, hôm nay…" rồi liệt kê.
- Dài **12–18 giây** (khoảng 50–80 âm tiết). Quá 20 giây là người nghe muốn bỏ qua.
- Một ví von hoặc một chi tiết đời thường (nhà tắm, rửa chén), không khẩu hiệu sáo ("mang đến kiến thức bổ ích").
- Nối thẳng vào nội dung: sau lời chào là hook hoặc chủ đề tập, không chen quảng cáo hay CTA.

**Lời kết (đóng tập):**
- **Ngắn, 8–12 giây.** Thứ tự: báo hết tập → xin like/chia sẻ/đăng ký (một lần, nhẹ nhàng) → chào hẹn gặp lại.
- Giọng thân mật, không van xin. Nếu có hài thì là tự giễu nhẹ, không phải câu đùa mới.
- Một CTA chính, không dồn ba bốn yêu cầu liền nhau.

## 2. Ba bản lời chào
Chọn **một**. Mặc định đề xuất: **B** (đúng ý bạn: nghe lúc làm việc, ăn, dọn nhà, đi ngủ, kể chuyện bàn nhậu).

**Lời chào A · "câu hỏi trong nhà tắm"** (~17 giây, 78 âm tiết)
> Có những câu hỏi mà cả đời mình chỉ thắc mắc đúng một lần, ở trong nhà tắm hoặc lúc sắp ngủ, rồi quên mất, và hóa ra câu trả lời của chúng lại thú vị hơn cả phim. Ở đây tụi mình lục lại những câu hỏi đó, rồi kể lại cho bạn nghe sao cho dễ hiểu đến mức nghe lúc đang rửa chén cũng không bị lạc. Chào mừng các bạn đến với Não Phẳng.

EN: *There are questions we only wonder about once in a lifetime, in the shower or just before falling asleep, and then forget, and it turns out the answers are more fun than a movie. Here we dig those questions back up and retell the answers so simply that you can follow along while washing dishes. Welcome to Não Phẳng.*

**Lời chào B · "nghe lúc nào cũng được"** (~13 giây, 61 âm tiết) ← ĐÃ CHỐT (đã bỏ vế "cho ra dáng người hiểu biết")
> Xin chào các bạn, chào mừng các bạn đến với Não Phẳng, nơi tìm hiểu những kiến thức không phải ai cũng biết, để các bạn nghe lúc làm việc, lúc ăn cơm, lúc dọn nhà, thậm chí là lúc chuẩn bị đi ngủ, và để lúc cần thì có thêm chuyện mà tán gái, hoặc chém gió trên bàn nhậu.

EN: *Hello everyone, and welcome to Não Phẳng, the place to learn things not everyone knows, to listen to while you work, eat, tidy up, even drift off to sleep, and to have something to chat up a date or talk big at the drinking table when you need it.*

**Lời chào C · "não phẳng"** (~12 giây, 52 âm tiết)
> Chào mừng các bạn đến với Não Phẳng. Người ta hay nói vui là não càng nhiều nếp nhăn thì càng thông minh, còn ở đây tụi mình làm ngược lại: cho não nghỉ ngơi, phẳng lì như mặt hồ, rồi để những kiến thức lạ tự chảy vào cho nhẹ nhàng.

EN: *Welcome to Não Phẳng. People joke that the more wrinkles a brain has, the smarter it is, but here we do the opposite: we let the brain rest, smooth as a lake, and let strange facts flow in on their own.*

(C chỉ nên dùng nếu bạn thích kiểu đùa tên kênh; câu "nhiều nếp nhăn thì thông minh" là lời đùa dân gian, không phải khẳng định khoa học, nên giữ chữ "người ta hay nói vui".)

## 3. Ba bản lời kết
Chọn **một bản mặc định**. Bản C có chỗ trống `[câu hỏi video sau]`, đổi mỗi video (chỉ voice của câu đó mới tốn thêm).

**Lời kết A · chuẩn** (~8 giây, 39 âm tiết) ← ĐÃ CHỐT (đã sửa theo lời bạn)
> Và đó là kết thúc của số Não Phẳng hôm nay. Nếu bạn thấy hay thì cho mình 1 like và chia sẻ, đăng ký kênh để không lỡ video mới. Cảm ơn bạn đã nghe, hẹn gặp lại.

EN: *And that's the end of today's Não Phẳng. If you enjoyed it, give me a like and a share, and subscribe so you don't miss the next video. Thanks for listening, see you next time.*

**Lời kết B · tự giễu nhẹ** (~11 giây)
> Vậy là xong một câu hỏi, và não của bạn vừa được nghỉ ngơi đúng như tên kênh. Thấy hay thì bấm like và chia sẻ, thấy chưa hay thì cứ đăng ký, biết đâu video sau tụi mình làm khá hơn. Hẹn gặp lại.

EN: *That's one question done, and your brain has just rested, just like the channel name promises. If you liked it, like and share; if you didn't, subscribe anyway, maybe the next one will be better. See you next time.*

**Lời kết C · báo trước video sau** (~11 giây, tốt cho giữ chân người xem; **không dùng được với outro cố định** vì mỗi video một câu khác. Muốn báo video sau thì đọc thêm 1 câu teaser riêng của từng video, ghép **trước** outro cố định)
> Hôm nay đến đây là hết, nhưng video tới còn một câu kỳ lạ hơn: [câu hỏi video sau]. Muốn biết câu trả lời thì đăng ký kênh để không bỏ lỡ, thấy hay thì bấm like và chia sẻ nhé. Hẹn gặp lại.

EN: *That's it for today, but the next video has an even stranger question: [next question]. To find out the answer, subscribe so you don't miss it, and if you enjoyed this one, like and share. See you next time.*

## 4. Ghi chú giọng cho bản mặc định (ký hiệu ở mục 5 của file 11)
Lời chào B:
```text
Xin chào các bạn / chào mừng các bạn đến với **Não Phẳng** ↘ //
nơi tìm hiểu những kiến thức (chậm)**không phải ai cũng biết**(/chậm) ↘ /
(nhanh)để các bạn nghe lúc làm việc / lúc ăn cơm / lúc dọn nhà(/nhanh) / thậm chí là lúc chuẩn bị **đi ngủ** ↘ //
và để lúc cần thì có thêm chuyện mà tán gái / (mỉm)hoặc chém gió trên bàn nhậu(/mỉm) ↘
```
Lời kết A:
```text
Và đó là kết thúc của số **Não Phẳng** hôm nay ↘ //
Nếu bạn thấy hay / thì cho mình 1 **like** và chia sẻ / **đăng ký kênh** để không lỡ video mới ↘ /
Cảm ơn bạn đã nghe / hẹn gặp lại ↘
```
Tên kênh "Não Phẳng" luôn nhấn rõ và chậm hơn một nhịp, vì đó là thứ cần đọng lại.

## 5. Dạng khai báo (cho `templates/intro.ts`, `outro.ts`; mọi line đánh dấu `fixed`)
```jsonc
"intro": { "fixed": true, "lines": [
  { "vi": "Xin chào các bạn, chào mừng các bạn đến với Não Phẳng,", "en": "Hello everyone, and welcome to Não Phẳng," },
  { "vi": "nơi tìm hiểu những kiến thức không phải ai cũng biết, để các bạn nghe lúc làm việc, lúc ăn cơm, lúc dọn nhà, thậm chí là lúc chuẩn bị đi ngủ, và để lúc cần thì có thêm chuyện mà tán gái, hoặc chém gió trên bàn nhậu.", "en": "the place to learn things not everyone knows, ..." }
] },
"outro": { "fixed": true, "lines": [
  { "vi": "Và đó là kết thúc của số Não Phẳng hôm nay.", "en": "And that's the end of today's Não Phẳng.", "pauseAfter": 0.7 },
  { "vi": "Nếu bạn thấy hay thì cho mình 1 like và chia sẻ, đăng ký kênh để không lỡ video mới.", "en": "If you enjoyed it, give me a like and a share, and subscribe so you don't miss the next video." },
  { "vi": "Cảm ơn bạn đã nghe, hẹn gặp lại.", "en": "Thanks for listening, see you next time." }
] }
```

## 6. Bản ngắn cho Shorts, TikTok, Reels
Không dùng intro dài. Dùng một câu 3–4 giây ở đầu hoặc không dùng, và để CTA ở `channel.json` (`cta.tiktok`, `cta.shorts`, `cta.reels`) hiện dạng chữ ở cuối.
- Shorts/Reels, nếu muốn có lời: "Não Phẳng đây, hôm nay có một câu hỏi kỳ lạ."
- Kết bản ngắn: "Bản đầy đủ có trên kênh Não Phẳng." (chữ + giọng, ≤ 3 giây).

## 7. Intro và outro CỐ ĐỊNH: tạo một lần, ghép vào mọi video
Mục tiêu: không tốn tiền ElevenLabs và không tốn thời gian render cho hai đoạn này ở mọi video sau video đầu tiên.

**Thư mục `templates/fixed/` (commit vào git, `npm run gc` không được xoá):**
```
templates/fixed/
├── intro.mp3  intro.json     giọng đã đọc + timestamp từng chữ + độ dài
├── outro.mp3  outro.json
├── intro.wav  outro.wav      âm thanh đã mix sẵn (giọng + nhạc + SFX), 48 kHz stereo, cùng mức với bản mix của nội dung
├── intro.mp4  outro.mp4      clip hình đã dựng 1920×1080 30fps (không tiếng); dùng chung cho youtube và facebook
└── LOCK.json                 chữ lời đã chốt, voiceId, model, hash, ngày tạo, chi phí, "approvedBy"
```
**Tạo một lần (lúc thiết lập kênh, trong `/thiet-lap-kenh`):**
0. Giọng dùng là **giọng mặc định của kênh `SMacAogENyIWv6UtGuXB`** (giọng của chính người dùng). Trước khi tạo, nghe thử một câu ngắn bằng `scripts/voice-sample.ts SMacAogENyIWv6UtGuXB "Não Phẳng" "<một câu trong lời chào>"` (khoảng 30–60 credits) để chắc giọng đọc tiếng Việt và nhịp ổn; chưa ổn thì chỉnh `stability`, `style`, `speed` (xem 11 mục 6) rồi nghe lại. Chỉ sau đó mới chạy bước 1.
1. `npm run fixed` (dry-run): in số ký tự, credits dự kiến (intro ≈ 210 ký tự, outro ≈ 123 ký tự, tổng ≈ 166 credits với turbo v2.5) và quota còn lại.
2. Người dùng trả lời đúng **"DUYỆT CHI"** → `npm run fixed -- --confirm`: gọi ElevenLabs **đúng 2 lần** (intro, outro), render hình, mix âm thanh, ghi `LOCK.json`.
3. Người dùng nghe và xem thử cả hai. Chưa ưng thì sửa đúng chỗ và chạy lại với `--force` (cần DUYỆT CHI lần nữa). Ưng thì chốt.
4. **Dùng giọng khác (giọng clone, giọng tự thu):** chạy `npm run fixed -- --import intro=duong-dan.mp3 outro=duong-dan.mp3` để đưa file có sẵn vào, **không gọi API**.

**Từ đó trở đi (mọi video):**
- `gen-voice` thấy line `fixed` thì **chỉ đọc file trong `templates/fixed/`**, không bao giờ gọi API, kể cả khi cache trống, khi đổi `voice` trong `channel.json` hoặc khi đổi model. Thiếu file thì báo lỗi "chạy `npm run fixed` trước", không tự tạo.
- `build-storyboard` lấy độ dài và timestamp từ `intro.json`, `outro.json`. `render` dùng thẳng `intro.mp4`, `outro.mp4`. `mix` chèn `intro.wav`, `outro.wav` ở đầu và cuối (crossfade nhạc nền ~0,5 giây ở chỗ nối), rồi `assemble` ghép và chuẩn hoá âm lượng cho cả file một lần.
- `ke-toan` **không tính** hai đoạn này vào bảng chi phí. `budget-guard` chặn mọi lệnh `--confirm` có `fixed` nếu `LOCK.json` đã tồn tại mà không có `--force`.
- Bản dọc (TikTok, Shorts, Reels) không dùng intro/outro cố định (theo bảng định dạng ở 03). Nếu cần, dùng riêng một câu CTA ngắn.
- Chỉ đổi lời hoặc giọng khi người dùng yêu cầu rõ ràng. Khi đó chạy lại `npm run fixed -- --force`; các video đã làm không bị ảnh hưởng vì mỗi video ghi `fixedHash` của lần ghép đó trong `video.json`.
