# 09 · Bài học đã gặp (đừng lặp lại)

## Lời thoại
- ❌ Viết kiểu "câu đùa nén": "Lần một. Sai." / "Newton không chứng minh nó." / "không phải nghiệp quật đâu". Đọc lên nghe giật cục, như AI cố làm hài.
- ❌ Sửa lỗi trên bằng cách nhét từ đệm ("nhé", "mà", "thế là", "y như rằng") và dấu "...". Nghe vẫn giả.
- ✅ Viết lời kể thành đoạn liền mạch trước, đọc to, rồi mới chia câu. Hài đến từ tình huống. Xem `05-loi-thoai.md`.
- ❌ Chia câu theo beat animation. Đây là nguyên nhân gốc của lời thoại giật cục. ✅ Beat đặt theo từ khoá, dùng timestamp từng chữ.

## Hình ảnh
- Prompt "chừa khoảng trống bên trái cho chữ" làm model vẽ **khung chữ nhật thừa**. Viết "uncluttered left third, plain wall".
- Model hay vẽ **logo thật** (Apple trên laptop). Luôn thêm `no logo, no brand marks`.
- Ảnh nền có vẽ sẵn nhân vật thì nhân vật không cử động được. Vẽ nền **không người**, ghép nhân vật bằng bộ tư thế.
- Nhân vật vẽ hoàn toàn bằng canvas: chuyển động tốt nhưng mặt "cứng code", không duyên bằng ảnh vẽ. Chỉ dùng cho vai phụ.
- Nền "xanh thuần" do AI trả về thực ra là xanh xám có vân, nên tách nền theo ngưỡng cố định sẽ thất bại. Dùng thuật toán loang từ mép (04).
- Gửi ảnh model sheet làm reference giúp nhân vật đồng nhất rất tốt. Biến thể (mở miệng, nhắm mắt) thì sửa từ **ảnh gốc của tư thế**.

## Voice
- ElevenLabs Free: **không dùng được giọng Library qua API** (402). Giọng Việt bản địa cần gói Starter, có giọng cần gói Creator.
- `eleven_v3` từ chối `previous_text`/`next_text` (400). Bỏ hai trường này khi dùng v3.
- Lỗi giữa chừng có thể để lại **file mp3 0 byte**, lần sau bị bỏ qua. Xoá file khi lỗi; chỉ coi file > 1KB là hợp lệ.
- Key thiếu quyền `user_read` thì không đọc được quota. Chỉ cảnh báo, đừng dừng cả quy trình.
- edge-tts (miễn phí) dùng WebSocket, sau proxy có thể không chạy.
- Tốc độ tiếng Việt khoảng 14–16 ký tự/giây. Ước lượng thời lượng theo con số này.

## Render và âm thanh
- Thời lượng scene phải **làm tròn theo frame**. Nếu không, audio lệch dần so với video.
- `-shortest` khi có stream phụ đề **cắt mất khoảng 1 giây cuối**. Không dùng.
- Grain đổi mỗi frame làm file nặng khoảng 3,5 lần. Chỉ đổi 6 lần/giây.
- Emoji trong chữ canvas hiện thành ô vuông. Không dùng emoji.
- Phụ đề dọc 2 dòng/trang làm câu bị cắt thành mẩu lẻ ("Bẹp."). Dùng 3 dòng.
- Giãn khoảng nghỉ để kéo dài video làm nhịp lê thê. Tối đa +0,25s/câu; muốn dài hơn thì thêm nội dung.
- In log tiến độ ra stdout khi pipe vào `head` gây lỗi EPIPE ồn ào. Đừng pipe output script vào `head`.

## Mạng và bảo mật
- `fetch` của Node không tự đi qua `HTTPS_PROXY`. Cần `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21).
- Không bao giờ dán key vào chat. Không in key ra log. Key lỡ lộ thì thu hồi và tạo key mới ngay.
- Repo public: **không** commit ảnh có bản quyền của kênh khác (thumbnail tham khảo). Để trong `docs/style/private/` (gitignore).

## Quy trình
- Luôn render **khung hình mẫu** trước khi render cả video (5 phút video mất khoảng 5 phút render).
- Gửi video 720p để duyệt cho nhẹ. Ảnh soát thì gửi dạng tờ xem trước.
- Chỉ gọi API trả phí sau khi dry-run và người dùng nói "DUYỆT CHI". Ghi mọi khoản chi vào ledger.
