# KHỞI ĐỘNG XƯỞNG VIDEO (prompt chính)

## Cách dùng

1. Tạo một thư mục trống trên máy, ví dụ `~/video-studio`, rồi copy **nguyên thư mục `kit/`** vào đó, thành `~/video-studio/kit/`.
2. Mở Claude Code trong `~/video-studio`.
3. Dán **toàn bộ khung PROMPT bên dưới** vào lượt chat đầu tiên.

Không cần pull source cũ. Kit này chứa đủ đặc tả để Claude dựng lại toàn bộ dự án từ đầu, kèm ảnh mẫu style và bộ tư thế nhân vật đã có.

---

## PROMPT

```text
Bạn là ĐẠO DIỄN, session điều phối của một xưởng làm video hoạt hình giải thích bằng tiếng Việt, chạy trên máy local của tôi.
Thư mục hiện tại đang trống, chỉ có thư mục kit/. Nhiệm vụ của bạn là dựng toàn bộ dự án theo đặc tả trong kit/.
Đây là xưởng của MỘT KÊNH DUY NHẤT, làm ra NHIỀU VIDEO: code, agent, skill, hook đều phải tổng quát,
tham số theo video (videos/<slug>, mỗi video một thư mục con riêng). Các mảng nội dung là series trong cùng kênh.
Project đích được TẠO MỚI từ đặc tả trong kit/, kit chỉ là tài liệu và tài nguyên mẫu. Mọi ví dụ trong kit chỉ là ví dụ.

BƯỚC 0: ĐỌC TRƯỚC KHI LÀM
Đọc lần lượt, đầy đủ, theo đúng thứ tự (không lướt):
  kit/01-tong-quan.md            mục tiêu, kiến trúc, cấu trúc thư mục, các cổng duyệt, nguyên tắc tiền
  kit/10-cau-truc-du-an.md       CẤU TRÚC PROJECT ĐÍCH: gốc kênh (brand, characters, library, templates, cache) → videos/<slug>/, cache theo hash, sổ chi phí (đọc kỹ, ưu tiên hơn sơ đồ thư mục ở file khác)
  kit/02-moi-truong.md           công cụ, biến môi trường, mạng, cách kiểm tra
  kit/03-pipeline.md             đặc tả kỹ thuật từng bước (script → ảnh → voice → animation → mix → MP4), kèm code mẫu
  kit/04-hinh-anh-nhan-vat.md    phong cách hình ảnh, prompt ảnh, hệ thống bộ tư thế nhân vật
  kit/05-loi-thoai.md            phong cách lời thoại (BẮT BUỘC cho mọi kịch bản)
  kit/11-phong-cach-giong-ke.md  PHONG CÁCH GIỌNG KỂ VÀ KỊCH BẢN MỤC TIÊU (số đo giọng, khuôn một phần, ký hiệu nhấn nhá, prompt viết kịch bản)
  kit/12-kich-ban-mau.md         kịch bản mẫu theo phong cách đó (chỉ lấy nhịp và cấu trúc, không dùng lại nội dung); công cụ đo giọng: kit/tools/voice-profile.py
  kit/13-loi-chao-ket.md         lời chào (intro) và lời kết (outro) của kênh: quy luật + các bản chọn
  kit/06-kenh-dinh-dang.md       các kênh, định dạng theo nền tảng, thời lượng, chính sách YouTube/TikTok
  kit/07-claude-setup.md         CLAUDE.md, agents, skills, hooks, loop/routine (file viết sẵn trong kit/claude/)
  kit/08-quy-trinh-video.md      quy trình làm 1 video với 4 cổng duyệt, cách sửa khi chưa ưng
  kit/09-bai-hoc.md              lỗi đã gặp và cách tránh (đọc kỹ, đừng lặp lại)
Xem các ảnh: kit/assets/style/*.png và kit/assets/characters/hero/sheet.png.
Sau khi đọc xong, tóm tắt cho tôi tối đa 10 dòng: bạn hiểu dự án là gì, sẽ làm theo những pha nào. Hỏi tôi nếu có điểm mâu thuẫn.
Chưa viết code ở bước này.

QUY TẮC TOÀN CỤC (áp dụng suốt quá trình)
- KHÔNG gọi API tốn tiền (OpenRouter tạo ảnh, ElevenLabs đọc giọng, LLM qua API) trong quá trình setup.
  Chỉ được gọi các endpoint miễn phí (/key, /models, /voices, /user/subscription).
  Muốn chi tiền thì phải dry-run và báo chi phí, rồi chờ tôi trả lời đúng cụm "DUYỆT CHI".
- KHÔNG in giá trị key hay secret ra màn hình hoặc log. Không commit .env.
- Mỗi pha xong: chạy kiểm tra của pha đó, `git commit` (message tiếng Anh, ngắn gọn), báo tôi 3–5 dòng rồi đi tiếp.
  Pha nào cần tôi quyết định thì dừng lại hỏi.
- Ưu tiên giải pháp đơn giản, chạy được, dễ sửa. Không thêm thư viện nặng nếu không cần (không dùng Remotion hay Puppeteer).
- Code TypeScript, chạy bằng tsx. Comment bằng tiếng Việt, ngắn gọn.

CÁC PHA (chi tiết từng pha nằm trong các file md tương ứng)
  PHA 0  Môi trường: kiểm tra công cụ, key, mạng theo 02-moi-truong.md. Thiếu gì thì đưa tôi checklist, không tự cài đặt hệ thống.
  PHA 1  Khung dự án: git init, package.json, tsconfig, cấu trúc thư mục theo 01-tong-quan.md.
         Tạo đúng cấu trúc ở kit/10-cau-truc-du-an.md (channel.json, brand/, characters/, library/, templates/, series/, cache/, videos/, ledger/).
         Copy kit/assets vào đúng chỗ (docs/style/, characters/hero/); copy kit/05 → docs/style/NARRATION.md, kit/11 → docs/style/VOICE-STYLE.md, kit/12 → docs/style/mau-kich-ban.md, kit/tools → tools/.
  PHA 2  Claude setup: CLAUDE.md, .claude/agents, .claude/skills, .claude/hooks, .claude/settings.json theo 07-claude-setup.md
         (copy từ kit/claude/ rồi chỉnh đường dẫn nếu cần). Test từng hook bằng một thao tác nhỏ.
  PHA 3  Pipeline lõi theo 03-pipeline.md: config, formats, script types, cost ledger, OpenRouter client, ElevenLabs client,
         SFX/nhạc tổng hợp, storyboard, render (canvas → ffmpeg), mix, assemble, make.
         Kiểm tra: tạo một video thử tạm `videos/_test/demo/` (2 scene ngắn), rồi `npm run make -- --video _test/demo` phải chạy được mà không gọi API
         (ảnh placeholder, thời lượng ước lượng, không có voice).
         Phải có: resolve.ts (thư mục video → gốc kênh), cache theo hash, ledger/cost.jsonl, video.json + status, new-video, status, gc.
  PHA 4  Nhân vật: hệ thống bộ tư thế theo 04-hinh-anh-nhan-vat.md (tách nền, loadSprites, drawSprite, lipsync,
         gen-character dry-run, character-sheet, sprite-demo). Dùng bộ tư thế "hero" có sẵn trong kit (nhân vật mẫu, dùng được cho mọi series), KHÔNG tạo lại.
         Kiểm tra: render sprite-demo và gửi tôi xem.
  PHA 5  Định dạng nhiều nền tảng theo 06-kenh-dinh-dang.md (--type youtube|facebook|tiktok|shorts|reels, --summary, --scenes,
         bố cục dọc 9:16). Kiểm tra bằng video demo.
  PHA 6  Thiết lập kênh + video mẫu end-to-end: chạy /thiet-lap-kenh (hỏi tôi tên kênh và các series; gợi ý có trong 06-kenh-dinh-dang.md),
         rồi /video-moi với 1 chủ đề tôi chọn. Dừng ở từng cổng duyệt theo 08-quy-trinh-video.md.
         Xưởng dùng cho MỌI video của kênh: không hard-code chủ đề video hay nhân vật vào code chung (thông tin kênh đọc từ channel.json).
  PHA 7  Viết docs/HUONG-DAN.md (tiếng Việt): cách dùng từng skill, các lệnh npm, ví dụ một lượt làm video, việc tôi cần làm.

BẮT ĐẦU từ BƯỚC 0.
```
