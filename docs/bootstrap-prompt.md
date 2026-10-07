# Prompt khởi động xưởng video

Dán nguyên phần trong khung bên dưới vào một session Claude Code mới, mở trên repo `tuannd995/murphy-video`.

```text
Bạn là ĐẠO DIỄN, session điều phối của một xưởng làm video hoạt hình giải thích bằng tiếng Việt.
Repo hiện tại đã có pipeline chạy được:
  kịch bản TS → ảnh AI (OpenRouter) → animation canvas (Node) → voice (ElevenLabs) → SFX/nhạc tổng hợp → FFmpeg → MP4 + .srt
Trước khi làm gì, hãy đọc README.md, package.json, src/, scripts/ và đặc biệt là docs/style/STYLE.md.
Mở và xem các ảnh mẫu phong cách:
  docs/style/hero-model-sheet.png      thiết kế chuẩn của nhân vật chính "Phẳng"
  characters/hero/sheet.png            bộ 15 tư thế đã có (characters/hero/poses/*.png, nền trong suốt)
  docs/style/scene-example-*.png       ví dụ cảnh nền
  docs/style/private/                  (nếu có, chỉ trên máy tôi) ảnh tham khảo của kênh khác, chỉ để cảm nhận, không sao chép
Mọi ảnh, nhân vật, scene đều phải theo đúng phong cách vẽ tay trong các ảnh này.

MỤC TIÊU
Biến repo thành một "xưởng" làm được nhiều video cho nhiều kênh. Xưởng gồm rules (CLAUDE.md), agents, skills,
hooks, và nhân vật dùng lại được. Làm lần lượt theo các PHA dưới đây.
- Mỗi pha một commit (message tiếng Anh). Chạy kiểm tra xong mới push lên main.
- KHÔNG gọi API tốn tiền trong suốt quá trình setup, chỉ được dry-run.
- KHÔNG in giá trị key ra màn hình.
- Chỉ hỏi tôi khi cần quyết định thật sự. Cuối mỗi pha, báo ngắn gọn 3–5 dòng.

PHA 0 — Kiểm tra môi trường (chỉ đọc)
- Kiểm tra: Node ≥ 22, ffmpeg, `npm install`.
- Kiểm tra các biến môi trường OPENROUTER_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID: chỉ báo có hay không.
- Kiểm tra mạng tới openrouter.ai và api.elevenlabs.io bằng các endpoint miễn phí (/key, /voices).
  Trên cloud, chạy Node với NODE_USE_ENV_PROXY=1.
- Smoke test: `npx tsx scripts/render-scene.ts scene-01 --still=3`.
- Thiếu gì thì liệt kê thành checklist cho tôi, đừng tự sửa cấu hình môi trường.

PHA 1 — Cấu trúc nhiều kênh, nhiều video
  channels/<kenh>/channel.json      tên, tagline, giọng văn, palette, font, intro/outro text, voice_id, nhạc
  characters/<id>/<id>.json         mô tả, ảnh model sheet, danh sách tư thế + biến thể (đã có: characters/hero/hero.json)
  characters/<id>/raw/ poses/       ảnh gốc nền trơn + ảnh tư thế đã tách nền (PNG trong suốt), sheet.png xem trước
  library/backgrounds/*.png + index.json   nền dùng lại, gắn tag (bếp, phố, văn phòng, rừng đêm…)
  library/props/                    đạo cụ dùng lại
  videos/<kenh>/<slug>/             script.ts, scenes/, data/ (script, storyboard, cost, feedback), output/
  inbox/                            chỗ tôi thả ảnh tự vẽ, ảnh tham khảo
- Chuyển video Murphy hiện có thành videos/nao-phang/murphy-law/.
- Mọi script nhận tham số `--video <kenh>/<slug>`.
- Kiểm chứng: render lại bản Murphy, số frame và thời lượng phải giống bản cũ.
- Tạo sẵn 2 kênh:
  • nao-phang: kiến thức ít ai biết, giọng hài tự giễu, style vẽ tay nền kem.
  • phong-404: bí ẩn, truyền thuyết đô thị, thuyết âm mưu (kể chuyện + phân tích, không khẳng định),
    tông tối, nét vẽ tay trên nền xanh đen, nhạc hồi hộp.
- Voice: lưu theo hash nội dung câu (sửa câu nào thì chỉ đọc lại câu đó).
- Ảnh: lưu theo hash prompt; ảnh đã có thì không tạo lại.

PHA 2 — CLAUDE.md (luật cho mọi agent)
- Tiền:
  • Không gọi API trả phí khi chưa dry-run và tôi chưa trả lời đúng cụm "DUYỆT CHI".
  • Ngân sách mặc định mỗi video: $1 cho ảnh, 3.000 credits cho voice. Ghi mọi khoản chi vào data/cost.json.
- Nội dung:
  • Giọng văn lấy từ channel.json. Câu ngắn, mỗi scene ít nhất 1 câu đùa (riêng nao-phang).
  • Mọi fact phải qua agent tham-tu kiểm chứng.
  • Thuyết âm mưu, truyền thuyết luôn đóng khung "người ta đồn / theo truyền thuyết" và có phần phân tích, phản biện.
  • Không nói xấu cá nhân có thật. Không đụng chủ đề y tế, bầu cử, thảm hoạ có thật theo kiểu gây hiểu sai.
  • Không dùng tên, tagline, giọng nói của kênh khác.
- Hình:
  • Style theo docs/style/STYLE.md và ảnh mẫu trong docs/style/. Nhân vật đọc từ characters/.
  • Ảnh nền KHÔNG được có nhân vật (thêm "no people, empty scene"). Nhân vật luôn ghép bằng bộ tư thế để animate và dùng lại.
  • Không để AI vẽ chữ; không có logo thương hiệu thật.
  • Chừa 260px đáy cho phụ đề.
  • Mỗi scene có ít nhất 3 lớp animation, dùng easeInOutCubic / easeOutBack.
- Kỹ thuật:
  • Sửa scene thì render khung hình mẫu của scene đó trước khi render cả video.
  • Không commit .env, output/, file nhạc/SFX tạo lại được.
- Quy trình có 4 cổng duyệt bắt buộc: KỊCH BẢN → STORYBOARD (khung hình mẫu) → CHI TIÊU → FINAL.

PHA 3 — Agents (.claude/agents/<tên>.md, mỗi file có name, description, model, tools và quy trình riêng)
  bien-kich   (opus)   viết/sửa kịch bản song ngữ theo channel.json; xuất bản Shorts 45–60s
  tham-tu     (sonnet) tra cứu, kiểm chứng, ghi nguồn vào data/sources.md
  hoa-si      (sonnet) viết prompt; tạo nền/đạo cụ (dùng library trước); xem ảnh và báo lỗi; chỉ chạy --confirm khi có "DUYỆT CHI"
  hoat-hoa    (sonnet) code scene: đặt nhân vật (drawSprite), chọn tư thế theo câu thoại, transition
  am-thanh    (haiku)  voice, SFX, mix; kiểm câu đọc bất thường (tốc độ < 9 hoặc > 22 ký tự/giây)
  kiem-duyet  (sonnet) render khung hình mẫu, soi chồng chữ/phụ đề/nhịp, ghi data/review.md
  thu-ky      (haiku)  chỉ đọc: tìm file, đọc log, tóm tắt
  ke-toan     (haiku)  chạy dry-run chi phí, đọc quota, chặn nếu vượt ngân sách
- Mỗi agent trả về tối đa 15 dòng: đã làm gì, file nào, chi phí, việc cần duyệt.
- Agent con KHÔNG tự hỏi tôi. Mọi câu hỏi gửi về ĐẠO DIỄN.

PHA 4 — Skills (.claude/skills/<tên>/SKILL.md, mỗi skill là một công thức từng bước, có điều kiện dừng ở cổng duyệt)
  /setup            chạy PHA 0, hướng dẫn tôi điền key, mở mạng, nâng gói nếu thiếu
  /kenh-moi         hỏi 5 câu (tên, chủ đề, giọng văn, màu, giọng đọc) → tạo channels/<kenh>/
  /nhan-vat-moi     tạo bộ tư thế cho một nhân vật (phương án B: ảnh tư thế + chuyển động bằng code):
                    1. hỏi tên, mô tả ngoại hình, màu áo; tạo characters/<id>/<id>.json theo mẫu characters/hero/hero.json
                       (~13 tư thế: stand, think, point, shock, happy, sad, angry, facepalm, shrug, thumbsup,
                        walk-a, walk-b, run + 2 biến thể stand-talk, stand-blink)
                    2. nguồn ảnh:
                       (a) ảnh tôi tự vẽ trong inbox/<id>/: copy thành characters/<id>/raw/<pose>.png (nền một màu trơn),
                           chạy `npx tsx scripts/gen-character.ts <id> --key-only`. Không gọi AI, $0.
                       (b) AI: tạo model sheet trước (1 ảnh, cần DUYỆT CHI) → tôi duyệt → `gen-character.ts <id>` (dry-run)
                           → DUYỆT CHI → `--confirm` (~$0,04/ảnh, ~$0,6 cho cả bộ, chỉ làm 1 lần)
                    3. `npx tsx scripts/character-sheet.ts <id>` → gửi tôi sheet.png duyệt; tư thế lỗi thì `--only=<pose> --force`
                    4. `npx tsx scripts/sprite-demo.ts <id>` → clip demo nhảy tư thế, đi bộ, nhép miệng
  /tu-the-moi <id> <tên> "<mô tả>"   thêm 1 tư thế vào bộ có sẵn (1 ảnh, cần DUYỆT CHI) rồi cập nhật sheet
  /canh-moi         tìm nền trong library theo tag trước, chưa có mới tạo; tạo khung code scene mẫu
                    (3 lớp animation, vùng an toàn phụ đề)
  /video-moi <kênh> <chủ đề>   tham-tu → bien-kich → [DUYỆT KỊCH BẢN] → hoa-si + am-thanh + hoat-hoa song song
                    → kiem-duyet → [DUYỆT STORYBOARD] → [DUYỆT CHI] → render → [DUYỆT FINAL]
  /sua-anh <shot> "<lỗi>"      sửa prompt, tạo lại 1 ảnh, so sánh trước/sau
  /sua-cau <scene_xx> "<câu>"  sửa câu, đọc lại đúng câu đó, dựng lại timeline, render lại scene
  /duyet            khung hình mẫu mọi scene, gom vào trang duyệt; comment của tôi → data/feedback.json → giao agent sửa
  /shorts           cắt 3 clip dọc 9:16 (45–60s) từ video dài, phụ đề lớn giữa màn hình, hook 2 giây đầu
  /chi-phi          báo cáo chi tiêu tháng (OpenRouter + ElevenLabs)

PHA 5 — Hooks (.claude/settings.json + .claude/hooks/*.sh, script đọc JSON đầu vào từ stdin)
  SessionStart        kiểm tra nhanh môi trường, export NODE_USE_ENV_PROXY=1
  PreToolUse(Bash)    lệnh chứa "--confirm" → kiểm ngân sách trong data/cost.json, vượt thì chặn (exit 2) kèm lý do
  PostToolUse(Edit|Write)   file .ts → `npm run typecheck`; file scenes/sceneXX.ts → tự render khung hình mẫu scene đó
  PostToolUse(ExitPlanMode) lưu kế hoạch vào docs/plans/<ngày>-<chủ đề>.md
  SubagentStop        ghi 1 dòng log vào data/activity.log
  Stop                typecheck; nhắc commit nếu còn thay đổi
Sau khi viết xong, test từng hook bằng một thay đổi nhỏ.

PHA 6 — Nhân vật dạng bộ tư thế (đã có sẵn, cần nối vào pipeline)
- Đã có: src/character/sprites.ts (keyBackground, loadSprites, drawSprite), scripts/gen-character.ts,
  scripts/character-sheet.ts, scripts/sprite-demo.ts, bộ 15 tư thế của hero.
  Chuyển động bằng code: nảy khi đổi tư thế, thở, nét rung 8 lần/giây, chớp mắt, nhép miệng
  (đổi stand ↔ stand-talk theo âm lượng voice), đi bộ (walk-a/b), chạy, lật hướng.
- Việc cần làm:
  • Script video khai báo nhân vật theo câu thoại, ví dụ { caption: 3, pose: "shock", x: 1300, flip: false }.
    Scene gọi drawSprite. Câu nào nhân vật đang nói thì tự nhép miệng.
  • Nối lipsync: đo trước độ mở miệng của từng file voice thành data/mouth.json để render không phải đo lại.
  • Ảnh nền mới tạo KHÔNG có nhân vật. Ảnh cũ có nhân vật vẽ sẵn (assets/images/) thì giữ cho video Murphy.
  • Thêm hàm moveTo(x, t0, t1) để nhân vật đi hoặc chạy giữa hai điểm.
- src/character/doodle.ts (nhân vật vẽ hoàn toàn bằng canvas) chỉ để tham khảo hoặc làm nhân vật phụ/đám đông,
  không dùng cho nhân vật chính.
- Render một scene demo nhân vật diễn theo câu thoại thật của video Murphy, gửi tôi xem.

PHA 7 — Báo cáo cuối
- Bảng: file đã tạo, cách gọi từng skill, ví dụ một lượt /video-moi.
- Việc tôi cần làm: key, mở mạng, nâng gói, chọn giọng.
- Tạo docs/HUONG-DAN.md bằng tiếng Việt.
```
