# 11 · Phong cách giọng kể và kịch bản mục tiêu

> Phong cách người dùng muốn hướng tới, rút ra từ một tập podcast/video kiến thức tiếng Việt hài hước (khoảng 19 phút, một người dẫn). Chỉ lấy **phong cách** (cấu trúc, nhịp, cách ví von, cách nhấn nhá). **Không sao chép nội dung hay câu chữ** của nguồn.
> Agent `bien-kich` và `kiem-duyet` đọc file này cùng `05-loi-thoai.md` (NARRATION). Kịch bản mẫu: `12-kich-ban-mau.md`. Công cụ đo giọng: `tools/voice-profile.py`.

## 0. Giới hạn của bản phân tích (đọc trước)
- Phần **đo được** (mục 1): lấy từ phân tích tín hiệu âm thanh (cao độ, nhịp, khoảng nghỉ). Con số đáng tin, nhưng đo giọng nam một người trong một tập; nên coi là **vùng mục tiêu**, không phải hằng số tuyệt đối.
- Phần **văn bản** (mục 3–4): lấy từ bản chép lời bằng máy nhận dạng (sai chính tả tên riêng và thuật ngữ, không có dấu câu). Cấu trúc và cách viết đủ tin cậy, nhưng từng chữ thì không.
- Phần **cảm giác** (giọng "vui, lém lỉnh, tự tin"…) là suy ra từ số đo và văn bản, **chưa được người nghe kiểm chứng**. Người dùng nên nghe lại nguồn và chỉnh các mô tả ở mục 2 cho đúng ý mình.

## 1. Số đo của giọng mục tiêu
| Thông số | Giá trị đo | Ý nghĩa khi thu hoặc chỉnh TTS |
|---|---|---|
| Giới tính, âm vực | Nam, cao độ trung vị ≈ **133 Hz** (đa số đoạn 103–191 Hz) | Giọng nam trung hơi trầm, không quá dày |
| Tốc độ | ≈ **4,6 âm tiết/giây** khi đang nói (khoảng 4,2–5,3) | Nhanh và liền mạch. Giọng AI thường chậm hơn (≈ 3,5–4), nên thường phải tăng tốc nhẹ |
| Nghỉ giữa các cụm | trung vị **0,33 s** (đa số 0,27–0,42 s, dài nhất ≈ 1,35 s) | Hầu như không ngắt dài. Chỉ nghỉ rõ trước chuyển ý hoặc câu chốt |
| Ngữ điệu | Mỗi cụm bắt đầu **cao hơn trung bình ≈ 3–4 nửa cung** rồi trôi xuống; **≈ 76% cụm kết thúc bằng hạ giọng** (≈ 3 nửa cung), chỉ ≈ 10% lên giọng | Kiểu "kể": mở cao, hạ ở cuối, không lên giọng cuối câu như người bán hàng |
| Biên độ ngữ điệu | Rộng, khoảng 10–12 nửa cung giữa quãng thấp và cao trong một cụm | Giọng lên xuống rõ, không đều đều |
| Nhấn mạnh | ≈ **1,6 điểm nhấn mỗi giây**, tức khoảng 1 nhấn mỗi 3 âm tiết | Nhấn dày: danh từ, con số, từ gây bất ngờ đều có lực |
| Âm lượng | Dải động rộng, đoạn nhấn cao hơn mức nền khoảng 6 dB | Có nhạc nền nhẹ và hiệu ứng âm thanh, giọng luôn nổi lên rõ |

## 2. Mô tả giọng (prompt để mô tả, thu âm hoặc remix trên giọng của bạn)

Dán nguyên khối này cho người thu âm, cho Claude khi cần chỉnh kịch bản theo giọng, hoặc làm nền để bạn tự thu.

```text
GIỌNG KỂ: "người bạn thông minh vừa đọc được điều thú vị và kể ngay cho bạn nghe".

Vai: một người đàn ông ba mươi tuổi, ngồi uống nước với bạn bè, tự tin vì biết nhiều nhưng không lên mặt.
Không giống MC truyền hình, không giống người đọc tin, không giống diễn viên lồng tiếng quảng cáo.
Mục đích của giọng là làm người nghe THẤY MUỐN NGHE TIẾP, không phải làm họ thấy mình giỏi.

NHỊP
- Nói nhanh và liền, khoảng 4,5 âm tiết mỗi giây. Hơi thở lấy ở cuối cụm, không lấy giữa chừng.
- Giữa các cụm chỉ nghỉ ngắn, khoảng một phần ba giây. Chỉ nghỉ dài (khoảng nửa giây đến một giây) ở hai chỗ:
  trước câu chốt gây bất ngờ, và khi chuyển sang ý mới.
- Khi liệt kê hoặc kể chuỗi sự việc thì nói nhanh dần, như đang chạy theo ý nghĩ.
- Khi vào thông tin quan trọng (tên người, năm, con số) thì chậm lại một nhịp và rõ từng chữ.

CAO ĐỘ VÀ NGỮ ĐIỆU
- Mỗi cụm mở ở cao hơn giọng nói bình thường một chút, rồi trôi dần xuống, hạ hẳn ở cuối cụm (kiểu kể chuyện, chắc chắn).
- Hầu hết cuối cụm là hạ giọng. Chỉ lên giọng ở các câu hỏi thật sự, và lên nhẹ, như đang chờ người nghe nhập cuộc.
- Biên độ lên xuống rộng, nhưng không diễn. Lên xuống theo ý nghĩa, không theo "chất giọng".

NHẤN NHÁ
- Nhấn khoảng ba âm tiết một lần, vào chữ mang nghĩa: danh từ, con số, động từ chính, và từ gây bất ngờ.
- Nhấn bằng cách tăng lực và kéo dài nhẹ chữ đó, không bằng cách gào to.
- Câu ví von, so sánh: đọc chậm hơn một chút và hạ giọng như kể nhỏ cho riêng người nghe, rồi trả giọng về bình thường ở câu sau.
- Không nhấn chữ nào chỉ vì nó đứng cuối câu.

CẢM XÚC VÀ HÀI
- Hài kiểu "mặt nghiêm": đọc ví von lạ hoặc phóng đại bằng giọng bình tĩnh như đang nói chuyện thật.
  Người nghe tự bật cười, người kể không cười theo, nhiều lắm chỉ có chút mỉm cười trong giọng.
- Không có câu đùa tách riêng. Câu đùa nằm trong câu, nối liền với ý đang nói.
- Khi kể chuyện nặng (một người bị oan, một thảm họa), hạ tốc độ, bỏ hết đùa, giọng ấm và chắc.

KHÔNG LÀM
- Không kéo dài chữ cuối câu, không hát hóa câu, không giọng "reviewer".
- Không lên giọng cuối mọi câu. Không thở dài, không cười thành tiếng giữa câu.
- Không cố tạo bất ngờ ở mọi câu: để dành lực cho vài điểm chính của mỗi phần.
- Không đọc từng chữ rời nhau. Câu dài thì đọc thành một hơi liền.

VÀO PHẦN, RA PHẦN
- Vào: bằng một tình huống đời thường, giọng nhẹ như đang nói chuyện, rồi dần đầy lên.
- Ra: câu chốt hạ giọng, dừng nửa giây, rồi chuyển sang phần mới bằng một câu hỏi hoặc một mâu thuẫn.
```

Bản tiếng Anh ngắn (dùng cho công cụ tạo giọng từ mô tả như ElevenLabs Voice Design, hoạt động tốt hơn với tiếng Anh):
```text
A Vietnamese man in his early thirties, mid-low pitch (around 130 Hz), warm, confident and conversational.
Fast, fluent storytelling pace, about 4.5 syllables per second, very short pauses between phrases.
Each phrase starts slightly high and glides down, ending with a falling intonation; rarely rising at the end.
Wide pitch movement, frequent but natural emphasis on key words, numbers and surprises.
Dry, deadpan humor: calm voice while saying funny comparisons. Sounds like a clever friend telling an interesting story, not a presenter or announcer.
```

## 3. Cấu trúc một tập (≈ 19 phút trong nguồn; video của ta 8–10 phút dùng 3 phần thay vì 4)
1. **Mở đầu (10–20 giây):** một tuyên ngôn hoặc câu hỏi hút người nghe. Rồi intro kênh (giọng, nhạc hiệu).
2. **Ba đến bốn phần độc lập (3–5 phút mỗi phần)**, nối bằng một sợi chung rất lỏng (một chủ đề tập hoặc một câu hỏi lớn). Mỗi phần tự đứng được, nên có thể cắt riêng làm Shorts.
3. **Phần cuối** thường là câu chuyện lịch sử có nhân vật và có twist, kết bằng một bài học nhân văn.
4. **Outro rất ngắn (≈ 8 giây):** kết thúc số, lời nhắn like/share, chào.

### Khuôn của một phần (7 bước)
1. **Tình huống đời thường**, ngôi "bạn" ("Bạn đang đứng giữa nhà, tay không, mặt đần ra, nhớ mãi không ra mình định làm gì"). Ai cũng gật đầu.
2. **Nghịch lý:** nêu hai sự thật mâu thuẫn, hoặc một câu hỏi tưởng vô lý ("Đã quên thì sao biết mình đang quên?").
3. **Ẩn dụ vật thể** để giải thích cơ chế: ngăn kéo, lá thư và phong bì, ông bảo vệ, quân domino, chiếc cc trong email… Mỗi khái niệm trừu tượng gắn với một hình ảnh cụ thể.
4. **Tên nhà khoa học + năm + con số** (neo uy tín), kèm thuật ngữ chuyên môn một lần, giải nghĩa ngay.
5. **Chia kiểu** ("có hai kiểu", "kiểu thứ nhất… kiểu thứ hai…") khi nội dung có nhiều trường hợp.
6. **Hệ quả thực dụng:** mẹo hoặc điều có thể làm ngay, hoặc lý do tiến hóa.
7. **Câu chốt có hình ảnh**, hạ giọng, rồi một **câu bản lề** sang phần sau ("Nghịch lý này ở đâu ra vậy?", "Nhưng khoan…").

## 4. Cách dùng ngôn ngữ
- **Ngôi:** "bạn" là chính (đa số câu), thỉnh thoảng "chúng ta", "tôi" khi kể kinh nghiệm riêng. Không gọi "các bạn ơi" liên tục.
- **Câu dài, liền mạch, nhiều mệnh đề** nối bằng "mà", "nhưng", "tức là", "nghĩa là", "thế là", "nói cách khác", "nói dễ hiểu". Không chặt vụn.
- **Từ đệm thưa**: "đấy/ấy/nha" khoảng một lần mỗi 300 âm tiết. Phù hợp với NARRATION.md (không lạm dụng từ đệm).
- **Cụm chuyển ý khẩu ngữ:** "nhưng khoan", "đây mới là chỗ tinh vi nhất", "nghe thì vô lý nhưng thật ra lại rất hợp lý", "thú vị ở chỗ", "nghe cho kỹ".
- **Luôn có con số hoặc tên cụ thể:** năm, độ C, số người, tên người. Không nói mơ hồ "một số nghiên cứu cho thấy".
- **Hài đến từ ví von bất ngờ và phóng đại**, đan trong câu và cùng một hơi, không phải câu đùa tách riêng. Mẫu: "trống trơn như tài khoản ngân hàng cuối tháng", "tiệc linh đình cho vi khuẩn", "chào đón còn nồng nhiệt hơn cả người thân". Khoảng một ví von mỗi 30–45 giây.
- **Kể chuyện nặng thì bỏ đùa**, dùng giọng nhân văn (một người bị oan, một thảm họa).
- **Tiếng Anh/thuật ngữ gốc** chỉ xuất hiện một lần, kèm giải nghĩa, rồi quay lại tiếng Việt.

### Đối chiếu với `05-loi-thoai.md`
Không mâu thuẫn. Phong cách này chính là "câu dài, liền mạch, hài từ tình huống và cách quan sát". Hai điểm cần hiểu đúng:
- Hài **dày hơn** mức "không cần đoạn nào cũng hài": mục tiêu là một ví von mỗi 30–45 giây, nhưng mỗi cái phải bắt nguồn từ chính nội dung đang giải thích, không phải câu đùa gắn thêm.
- Vẫn **cấm** "...", câu cụt 1–3 chữ, chuỗi setup → câu cụt → punchline. Nhịp nhanh đến từ câu dài đọc liền, không từ việc chặt câu.

## 5. Ký hiệu nhấn nhá (để ghi chú kịch bản khi remix)
Dùng trong bản thu mẫu và khi dặn người đọc hoặc TTS. Dòng ghi chú đặt **ngoài** `vi` (trường `delivery` của line), không đưa vào phụ đề.

| Ký hiệu | Cách đọc |
|---|---|
| **chữ đậm** | nhấn mạnh: tăng lực, kéo dài nhẹ |
| `/` | nghỉ ngắn ≈ 0,3 s (chỗ ngắt hơi thường) |
| `//` | nghỉ dài ≈ 0,7–1,0 s (trước chốt bất ngờ, hoặc chuyển ý) |
| `↘` | hạ giọng cuối cụm (mặc định, ghi khi cần nhấn mạnh) |
| `↗` | lên giọng nhẹ (câu hỏi thật, chờ người nghe nhập cuộc) |
| `(nhanh)…(/nhanh)` | tăng tốc cho chuỗi liệt kê |
| `(chậm)…(/chậm)` | chậm lại, rõ từng chữ (tên, năm, số) |
| `(nhỏ)…(/nhỏ)` | hạ giọng như kể riêng cho người nghe (ví von, bí mật) |
| `(mỉm)` | giọng có chút cười, không bật thành tiếng |

### Ví dụ ngắn có ghi chú (đủ để remix)
Nguyên văn đoạn kịch bản (từ `12-kich-ban-mau.md`):
> Có một chuyện mà ai cũng từng thử hồi nhỏ và ai cũng thất bại, đó là tự cù chính mình. Bạn có thể cù nách, cù bàn chân, cù cổ, dùng ngón tay hay dùng cả cọng lông gà cũng được, và kết quả vẫn y như nhau là chẳng có gì xảy ra, trong khi chỉ cần một đứa bạn lén chạm nhẹ vào đúng chỗ đó là bạn đã lăn ra cười không thở nổi.

Bản có ghi chú giọng:
```text
Có một chuyện mà ai cũng từng thử hồi nhỏ / và ai cũng **thất bại** ↘ / đó là (chậm)tự cù **chính mình**(/chậm) ↘ //
(nhanh)Bạn có thể cù nách / cù bàn chân / cù cổ / dùng ngón tay hay dùng cả cọng lông gà cũng được(/nhanh) /
và kết quả vẫn y như nhau / là (chậm)**chẳng có gì** xảy ra(/chậm) ↘ //
trong khi chỉ cần một đứa bạn (nhỏ)lén chạm nhẹ(/nhỏ) vào đúng chỗ đó /
là bạn đã (mỉm)lăn ra cười **không thở nổi**(/mỉm) ↘ //
```
Ghi chú vì sao: câu 1 mở ở mức cao vừa, hạ hẳn ở "thất bại" để tạo cảm giác chắc chắn; chuỗi liệt kê nói nhanh dần như đang nghĩ ra thêm; "chẳng có gì xảy ra" chậm và nhấn vì là điểm quay; hình ảnh "lén chạm" hạ nhỏ như kể riêng; vế cuối giữ giọng mỉm, nhấn ở "không thở nổi" rồi hạ giọng và nghỉ dài trước câu tiếp.

Đoạn ví von (để thấy cách hạ giọng kể nhỏ):
```text
Mỗi khi bạn quyết định cử động một ngón tay / não không chỉ gửi lệnh cho cơ bắp / mà còn lặng lẽ gửi kèm **một bản sao** ↘ /
(nhỏ)giống như một nhân viên gửi mail cho sếp / và đồng thời **cc** luôn cho cả phòng kế toán(/nhỏ) ↘ //
```

## 6. Remix trên giọng của bạn
### Cách A · Tự thu âm
1. Đọc to bản có ghi chú ở mục 5 (và vài đoạn trong `12-kich-ban-mau.md`) bằng giọng của bạn, **không bắt chước giọng nguồn**, chỉ bắt chước **quy luật**: mở cao hạ cuối cụm, nhấn dày, nghỉ ngắn, chậm lại ở con số.
2. Chạy `python3 tools/voice-profile.py ban-thu.wav --text kich-ban.txt` (cần `pip install librosa numpy`). Công cụ in bảng so với mục tiêu ở mục 1 và gợi ý chỉnh ("hạ giọng cuối cụm mới 40%, mục tiêu 76%").
3. Chỉ so các thông số **không phụ thuộc giọng**: tốc độ, nghỉ, % hạ giọng cuối cụm, nhấn mỗi giây. Cao độ tuyệt đối tuỳ giọng của bạn (nữ hoặc nam trầm sẽ khác 133 Hz, không sao).

### Cách B · Giọng clone (ElevenLabs) hoặc giọng thư viện
**Giọng mặc định của kênh là giọng của chính người dùng: `SMacAogENyIWv6UtGuXB`.** Dùng nó cho mọi video và cho intro/outro cố định. Nên nghe thử một đoạn ngắn trước (xem bên dưới) vì chất lượng tiếng Việt của giọng clone phụ thuộc mẫu thu và model.
- Thiết lập khởi điểm: model `eleven_turbo_v2_5`, `stability` 0,35–0,45 (thấp hơn = nhiều lên xuống hơn), `similarity_boost` 0,8, `style` 0,2–0,3, `speed` 1,05–1,10 nếu giọng chậm hơn 4 âm tiết/s. Đo lại bằng `voice-profile.py` sau khi tạo mẫu.
- Nhịp nghỉ không điều khiển bằng dấu câu mà bằng **ranh giới line** và `TIMING`: giữ `GAP` ≈ 0,3 s (mục tiêu khoảng nghỉ trung vị 0,33 s). Chỗ nghỉ dài (`//`) đặt `pauseAfter: 0.8` cho line đó (xem 03).
- Nhấn mạnh và lên xuống bị giới hạn bởi TTS. Cách tăng hiệu quả: viết câu ngắn hơn một chút ở chỗ cần nhấn, thêm dấu phẩy trước chữ cần nhấn, và thử các giọng khác nhau (Phong, Ninh Đôn, Tony Hoang, Đức MC, Hào) để chọn giọng ra nhiều lên xuống nhất cho cùng một đoạn.
- Tên riêng nước ngoài đọc sai thì dùng trường `say` (cách đọc cho TTS, phụ đề vẫn dùng `vi`), ví dụ `vi: "Blakemore"`, `say: "Bleik-mo"`.

## 7. Prompt cho Claude: viết kịch bản theo phong cách này
```text
Viết kịch bản video tiếng Việt cho kênh Não Phẳng về chủ đề: "<chủ đề>" (series: <series>).

Trước khi viết, đọc: docs/style/NARRATION.md, kit/11-phong-cach-giong-ke.md (mục 3 và 4), kit/12-kich-ban-mau.md (chỉ lấy nhịp và cấu trúc, KHÔNG dùng lại nội dung).
Chỉ dùng thông tin có nguồn trong videos/<slug>/data/sources.md.

Cấu trúc: hook một câu hỏi/tình huống (15–20 giây) → intro kênh → 3 phần độc lập, mỗi phần theo khuôn 7 bước (tình huống đời thường → nghịch lý → ẩn dụ vật thể → tên + năm + con số → chia kiểu → hệ quả thực dụng → câu chốt có hình ảnh + câu bản lề) → kết gom lại → outro ngắn.
Tổng khoảng 2.200–2.700 âm tiết (8–10 phút).

Giọng: ngôi "bạn", câu dài liền mạch nối bằng "mà/nhưng/tức là/nghĩa là", từ đệm thưa, mỗi 30–45 giây có một ví von bất ngờ gắn với nội dung. Phần kể chuyện nặng thì bỏ đùa.
Cấm: dấu "...", câu 1–3 chữ đứng riêng, chuỗi setup → câu cụt → punchline, đánh số máy móc.

Xuất: (1) bản văn xuôi liền mạch từng phần để tôi đọc duyệt; (2) sau khi tôi duyệt mới tách thành lines và ghi chú giọng (ký hiệu mục 5) vào trường `delivery`; (3) liệt kê các ví von đã dùng và nguồn của từng con số.
```

## 8. Checklist chấm theo phong cách này
- [ ] Mỗi phần mở bằng tình huống đời thường ngôi "bạn", không mở bằng định nghĩa.
- [ ] Có ít nhất một nghịch lý hoặc mâu thuẫn được nêu rõ trước khi giải thích.
- [ ] Mỗi khái niệm trừu tượng có một hình ảnh vật thể đi kèm.
- [ ] Mỗi phần có tên người, năm và con số cụ thể, và có nguồn.
- [ ] Ví von đan trong câu, khoảng 30–45 giây một cái; không có câu đùa đứng riêng.
- [ ] Câu dài liền mạch; đọc to một hơi không bị vấp.
- [ ] Cuối phần có câu chốt hình ảnh và câu bản lề sang phần sau.
- [ ] Phần kể chuyện nặng không có đùa.
- [ ] Đo bản voice: tốc độ 4,2–5,0 âm tiết/s (giọng người), % hạ giọng cuối cụm ≥ 60%, nghỉ giữa cụm trung vị 0,25–0,45 s.
