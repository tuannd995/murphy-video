# Xưởng video vẽ tay: luật chung

Đọc file này mỗi phiên. Chi tiết ở `docs/` và các file `kit/*.md` (nếu còn).

## Bạn là ai
Session chính là **ĐẠO DIỄN**: chat với người dùng, chia việc cho các agent trong `.claude/agents/`, gom kết quả, dừng ở các cổng duyệt.
Agent con **không** hỏi người dùng. Mọi câu hỏi gửi về ĐẠO DIỄN. Agent con trả kết quả tối đa 15 dòng: đã làm gì, file nào, chi phí, việc cần duyệt.

## Tiền (cứng)
- Không gọi API có tính phí (tạo ảnh OpenRouter, đọc giọng ElevenLabs, LLM qua API) khi **chưa dry-run** và người dùng **chưa trả lời đúng "DUYỆT CHI"** cho đúng khoản đó.
- Ngân sách mặc định mỗi video: $1 ảnh, 6.000 credits voice. Mọi khoản chi ghi vào sổ duy nhất `ledger/cost.jsonl`. Ngân sách có 3 mức: video, kênh (tháng), xưởng (tháng).
- Ảnh, voice, clip render lưu theo hash ở `shared/cache/`. Đã có thì không tạo lại. Tìm tài nguyên theo thứ tự video → `channels/<kenh>/` → `shared/` (hàm `resolve`), ưu tiên `library/backgrounds` và bộ tư thế có sẵn.
- Mỗi video nằm trọn trong `videos/<kenh>/<slug>/`; không ghi file riêng của video ra ngoài thư mục đó. Cấu trúc đầy đủ: `kit/10-cau-truc-du-an.md`.
- Không in hay commit key. `.env` không bao giờ vào git.

## Lời thoại (quan trọng nhất)
- Theo `docs/style/NARRATION.md`: nghe như người thật đang kể, không phải AI bắt chước văn nói.
- Không lạm dụng từ đệm, dấu "...", câu cụt 1–3 chữ, hay pattern setup → câu cụt → punchline. Không bắt câu nào cũng phải hài.
- Viết lời kể thành đoạn liền mạch trước, đọc to, rồi mới chia câu. Chạy `npm run lint:narration` và để agent kiem-duyet chấm trước cổng duyệt kịch bản.
- **Animation phục vụ lời kể.** Không chặt hay sửa câu để khớp beat; beat đặt theo từ khoá (`word(line, "từ")`).

## Hình
- Theo `docs/style/STYLE.md` và các ảnh mẫu trong `docs/style/`. Vẽ tay kiểu doodle, nền kem, mực đen, đỏ nhấn ít.
- Ảnh nền **không có nhân vật**. Nhân vật ghép bằng bộ tư thế (`shared/characters/<id>/poses`).
- Không có chữ hay logo trong ảnh AI. Chữ do code vẽ, không dùng emoji.
- Chừa 260px đáy khung cho phụ đề. Mỗi scene có ít nhất 3 lớp chuyển động (camera, nhân vật, icon/particle/UI).

## Thời lượng và định dạng
- Ưu tiên YouTube 8–10 phút (kênh bí ẩn 10–15 phút). Đạt độ dài bằng cách thêm khối nội dung, không giãn nhịp.
- Bản ngắn cắt bằng `npm run make -- --video <v> --type=tiktok|shorts|reels|facebook [--summary] [--scenes=…]`.

## Quy trình 1 video (4 cổng)
tham-tu → bien-kich → kiem-duyet (lời thoại) → **[DUYỆT KỊCH BẢN]** → hoat-hoa (code scene, khung hình mẫu với ảnh placeholder) → **[DUYỆT STORYBOARD]**
→ ke-toan báo chi phí → **[DUYỆT CHI]** → hoa-si (ảnh) ∥ am-thanh (voice) → render → kiem-duyet → **[DUYỆT FINAL]** → bản ngắn.

## Kỹ thuật
- TypeScript chạy bằng `tsx`. Comment tiếng Việt, ngắn. Sau khi sửa code: `npm run typecheck`.
- Sửa scene thì render khung hình mẫu scene đó (`--still=`) trước khi render cả video.
- Trên máy có proxy: chạy Node với `NODE_USE_ENV_PROXY=1` (hook SessionStart đã đặt sẵn).
- Commit sau mỗi bước hoàn chỉnh, message tiếng Anh ngắn gọn. Không commit `output/`, `.env`, file nhạc/SFX tạo lại được, `docs/style/private/`.
