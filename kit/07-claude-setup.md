# 07 · Thiết lập Claude Code: CLAUDE.md, agents, skills, hooks, loop

Mọi file đều có sẵn trong `kit/claude/`. PHA 2 chỉ cần copy vào đúng chỗ:
```
kit/claude/CLAUDE.md       → ./CLAUDE.md
kit/claude/settings.json   → ./.claude/settings.json
kit/claude/agents/*.md     → ./.claude/agents/
kit/claude/skills/*/       → ./.claude/skills/
kit/claude/hooks/*.sh      → ./.claude/hooks/   (chmod +x)
```
Sau khi copy, kiểm tra lại đường dẫn và tên lệnh npm trong các file có khớp với code đã dựng không. Nếu khác thì sửa file trong `.claude/`, không sửa trong `kit/`.

## 1. Mô hình điều phối
- Người dùng **chỉ chat với session chính (ĐẠO DIỄN)**. Đạo diễn giao việc cho agent bằng công cụ Agent (subagent), nhận kết quả tóm tắt rồi báo người dùng.
- **Agent con không gọi được agent khác.** Chỉ có 2 tầng: đạo diễn → các agent. Việc nhiều tầng hoặc song song lớn (làm nhiều video một lúc) thì dùng Workflow hoặc mở thêm session riêng cho mỗi video.
- Việc độc lập thì giao song song (ví dụ hoa-si ∥ am-thanh). Việc nhỏ, đạo diễn tự làm luôn: gọi agent tốn thêm token để nạp lại ngữ cảnh.

## 2. Agents (`.claude/agents/`)
| Agent | Model | Việc |
|---|---|---|
| bien-kich | opus | Viết và sửa kịch bản theo NARRATION.md; chia khối; summary/shortable; acts |
| tham-tu | sonnet | Tra cứu, kiểm chứng, ghi `data/sources.md` |
| hoa-si | sonnet | Prompt nền, dùng library, tạo và soát ảnh, tư thế mới (dry-run → DUYỆT CHI) |
| hoat-hoa | sonnet | Code scene canvas, đặt beat theo từ khoá, render khung hình mẫu |
| am-thanh | haiku | Voice, SFX, mix, soát câu đọc bất thường, đo độ lớn |
| kiem-duyet | sonnet | Chấm lời thoại; soát khung hình và video |
| thu-ky | haiku | Chỉ đọc: tìm file, log, trạng thái |
| ke-toan | haiku | Ước tính chi phí, quota, báo cáo; không bao giờ tự `--confirm` |

Chọn model theo việc: tìm kiếm và thao tác máy móc dùng **haiku**; code và soát dùng **sonnet**; viết kịch bản và lên kế hoạch dùng **opus**. Session đạo diễn nên dùng opus.

## 3. Skills (`.claude/skills/<tên>/SKILL.md`), gọi bằng `/tên`
| Skill | Khi nào |
|---|---|
| `/setup` | Máy mới, hoặc lỗi môi trường |
| `/kenh-moi` | Mở kênh hoặc series mới |
| `/nhan-vat-moi` | Nhân vật mới: ảnh tự vẽ ($0) hoặc AI (~$0,6 cả bộ) |
| `/tu-the-moi <id> <tư thế> "<mô tả>"` | Thêm 1 tư thế cho nhân vật có sẵn |
| `/canh-moi` | Nền cho scene (library trước) + khung code scene |
| `/video-moi <kênh> "<chủ đề>"` | Trọn quy trình 1 video, 4 cổng duyệt |
| `/sua-anh` · `/sua-cau` | Sửa 1 ảnh / 1 câu, chỉ làm lại phần liên quan |
| `/soat-loi-thoai` | Chấm lời thoại theo NARRATION.md |
| `/duyet` | Tờ duyệt storyboard, gom góp ý thành việc cần sửa |
| `/shorts` | Bản TikTok/Shorts/Reels/Facebook từ video dài |
| `/chi-phi` | Báo cáo chi tiêu, quota |

Skill là "công thức": từng bước, có điểm dừng ở cổng duyệt. Thêm skill mới bằng cách tạo thư mục `.claude/skills/<tên>/SKILL.md` với frontmatter `name` và `description`. Description phải nói rõ **khi nào dùng**.

## 4. Hooks (`.claude/settings.json` + `.claude/hooks/*.sh`)
| Sự kiện | Script | Làm gì |
|---|---|---|
| SessionStart | session-start.sh | In trạng thái công cụ, key (có/không), video đang làm. Đặt `NODE_USE_ENV_PROXY=1` qua `$CLAUDE_ENV_FILE` nếu có proxy |
| PreToolUse (Bash) | budget-guard.sh | Lệnh có `--confirm` → gọi `scripts/budget-guard.ts`; vượt ngân sách hoặc chưa có script thì **chặn** (exit 2) |
| PostToolUse (Edit\|Write\|MultiEdit) | post-edit.sh | Sửa file `.ts` → typecheck, lỗi thì báo Claude; sửa scene → nhắc render khung hình mẫu |
| PostToolUse (ExitPlanMode) | save-plan.sh | Lưu kế hoạch vào `docs/plans/<ngày-giờ>.md` |
| SubagentStop | log-agent.sh | Ghi `data/activity.log` |
| Stop | stop-check.sh | Typecheck lỗi hoặc còn thay đổi chưa commit → nhắc 1 lần (có chống lặp qua `stop_hook_active`) |

- Hook đọc JSON từ stdin. Dùng `node` để đọc JSON, không phụ thuộc `jq`.
- Exit 2 nghĩa là chặn (PreToolUse) hoặc gửi phản hồi cho Claude (PostToolUse, Stop).
- `settings.json` có sẵn danh sách lệnh render và build được phép chạy không cần hỏi, và chặn đọc `.env`.
- Test từng hook sau khi copy: ví dụ `echo '{"tool_input":{"command":"npm run images -- --confirm"}}' | .claude/hooks/budget-guard.sh; echo $?`.

## 5. Loop và Routine
- `/loop 10m kiểm tra render của <video> đã xong chưa; xong thì soát và gửi tôi`: dùng khi render lâu.
- `/loop 30m lấy 1 chủ đề trong topics/queue.md, chạy /video-moi tới CỔNG 1 rồi dừng`: soạn kịch bản theo lô. Dừng ở cổng duyệt nên **không tự chi tiền**.
- Muốn **lịch cố định** (ví dụ 8h sáng thứ Hai soạn 3 kịch bản) thì dùng **Routine / scheduled task**, vì loop chỉ sống trong session đang mở.
- Mỗi vòng loop tốn token. Chỉ loop việc thật sự phải chờ, và đặt khoảng cách vòng dài.

## 6. Bộ nhớ dự án
- `.current-video` (một dòng `kenh/slug`) là video đang làm. Script đọc file này khi không truyền `--video`.
- `docs/plans/` lưu kế hoạch đã duyệt. `data/activity.log` lưu nhật ký agent. `videos/.../data/review.md` lưu kết quả soát. `ledger/cost.jsonl` là sổ chi phí duy nhất. `npm run status` cho bảng trạng thái cả xưởng.
