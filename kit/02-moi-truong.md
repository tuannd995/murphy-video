# 02 · Môi trường, key, mạng

## Công cụ
| Công cụ | Kiểm tra | Ghi chú |
|---|---|---|
| Node ≥ 22.9 | `node -v` | Cần `--env-file-if-exists`. Nếu ≥ 22.21 thì có `NODE_USE_ENV_PROXY`. |
| npm | `npm -v` | |
| ffmpeg + ffprobe | `ffmpeg -version` | Cần libx264, aac, filter `loudnorm`. |
| git | `git --version` | |
| Python 3 + `edge-tts` (tuỳ chọn) | `python3 -m edge_tts --help` | Chỉ là phương án TTS miễn phí. |

Gói npm: `@napi-rs/canvas` (dependency); `tsx`, `typescript`, `@types/node` (devDependencies). Không cần gì thêm.

## Biến môi trường (`.env`, đã có trong `.gitignore`; tạo thêm `.env.example` không chứa giá trị)
```
OPENROUTER_API_KEY=          # https://openrouter.ai/keys
ELEVENLABS_API_KEY=          # https://elevenlabs.io/app/settings/api-keys  — quyền: Text to Speech, Voices Read, User Read
ELEVENLABS_VOICE_ID=SMacAogENyIWv6UtGuXB   # MẶC ĐỊNH: giọng của chính người dùng (voice clone trong "My Voices", cần gói Starter trở lên). Dự phòng: RxhjHDfpO54FYotYtKpw ("Phong", giọng thư viện)
# tuỳ chọn
ELEVENLABS_MODEL=eleven_turbo_v2_5   # hoặc eleven_v3 (tự nhiên hơn, 1 credit/ký tự, KHÔNG nhận previous_text/next_text)
IMAGE_MODEL=google/gemini-2.5-flash-image
BUDGET_IMAGES_USD=1
BUDGET_VOICE_CREDITS=6000
RENDER_JOBS=4
```
Các script npm chạy với `tsx --env-file-if-exists=.env`. **Không bao giờ in giá trị key** ra màn hình. Khi kiểm tra, chỉ báo "có" hoặc "không".

## Kiểm tra mạng (chỉ dùng endpoint miễn phí)
- OpenRouter: `GET https://openrouter.ai/api/v1/key` (xem hạn mức) và `GET /api/v1/models` (bảng giá).
- ElevenLabs: `GET https://api.elevenlabs.io/v1/voices`. `GET /v1/user/subscription` cần quyền **User: Read**; nếu thiếu thì báo cho tôi nhưng vẫn chạy tiếp.
- Nếu máy đi qua proxy công ty (có biến `HTTPS_PROXY`): `fetch` của Node mặc định **không** đi qua proxy. Phải chạy Node với `NODE_USE_ENV_PROXY=1` (Node ≥ 22.21). Hook SessionStart tự đặt biến này (xem 07).
- Thư viện Python `edge-tts` dùng WebSocket, nên có thể bị chặn sau proxy. Khi đó dùng ElevenLabs.

## Gói dịch vụ cần biết
- **ElevenLabs Free không được dùng giọng trong Voice Library qua API** (lỗi 402 `paid_plan_required`). Giọng tiếng Việt bản địa đều nằm trong Library, nên cần gói **Starter** trở lên. Một số giọng còn yêu cầu gói Creator (lỗi `free_users_not_allowed` hoặc "creator tier").
- Giọng mặc định có sẵn của ElevenLabs (George, Brian…) là giọng Anh, đọc tiếng Việt sẽ lơ lớ. Chỉ dùng để demo.
- OpenRouter tính tiền theo token. `gemini-2.5-flash-image` khoảng **$0,039 mỗi ảnh**. Lấy chi phí thật của từng lần gọi từ `usage.cost` khi gửi `usage: { include: true }`.

## Kết quả PHA 0
Đưa tôi một bảng ✓/✗ cho từng mục (công cụ, key, mạng, gói ElevenLabs nếu đọc được). Mục ✗ thì kèm cách khắc phục.
