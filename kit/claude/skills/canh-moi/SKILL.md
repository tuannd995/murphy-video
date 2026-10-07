---
name: canh-moi
description: Chuẩn bị nền cho scene (ưu tiên thư viện, chưa có mới tạo) và tạo khung code scene mẫu. Dùng khi kịch bản cần bối cảnh mới hoặc khi bắt đầu code một scene.
---
1. Đọc `notes` và `shots` của scene. Tìm trong `channels/<kênh>/library/backgrounds/index.json` rồi `shared/library/backgrounds/index.json` theo tag. Có nền hợp thì gán `background: <id>` cho shot.
2. Không có: viết prompt theo template (STYLE + `no people, no characters, empty scene`, bố cục chừa chỗ cho nhân vật và chữ, không viết "empty area").
   Dry-run → DUYỆT CHI → tạo → xem ảnh → thêm vào library kèm tag.
3. Tạo file scene từ template `src/scenes/_template.ts` (3 lớp: camera Ken Burns, drawActor theo acts, layer icon/UI), chừa 260px đáy.
   Beat theo `s.word(line, "từ")`.
4. `npm run typecheck`, render khung hình mẫu 3 thời điểm, gửi xem.
