import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const PATHS = {
  data: path.join(ROOT, "data"),
  script: path.join(ROOT, "data/script.json"),
  storyboard: path.join(ROOT, "data/storyboard.json"),
  cost: path.join(ROOT, "data/cost.json"),
  images: path.join(ROOT, "assets/images"),
  voice: path.join(ROOT, "assets/audio/voice"),
  music: path.join(ROOT, "assets/music"),
  sfx: path.join(ROOT, "assets/sfx"),
  fonts: path.join(ROOT, "assets/fonts"),
  output: path.join(ROOT, "output"),
  sceneClips: path.join(ROOT, "output/scenes"),
};

export const VIDEO = {
  width: Number(process.env.VIDEO_WIDTH ?? 1920),
  height: Number(process.env.VIDEO_HEIGHT ?? 1080),
  fps: Number(process.env.VIDEO_FPS ?? 30),
  crf: 22,
  preset: "medium",
};

export const TIMING = {
  sceneLeadIn: 0.6, // im lặng đầu scene (cho transition + SFX)
  captionGap: 0.25, // nghỉ giữa hai câu
  pauseAfterEllipsis: 0.6, // nghỉ dài hơn sau "..."
  sceneTail: 1.0,
  fade: 0.45, // fade đen ở mép scene
  charsPerSecond: 15.5, // ước lượng khi chưa có voice (đo từ ElevenLabs ~15–16 ký tự/giây)
  // nếu tổng thời lượng < minTotal, tự giãn khoảng nghỉ giữa các câu (tối đa maxExtraGap/câu)
  minTotal: 285,
  maxExtraGap: 0.9,
};

export const AUDIO = {
  sampleRate: 48000,
  voiceGainDb: 0,
  musicGainDb: -21,
  musicDuckDb: -8, // giảm thêm khi có giọng đọc
  sfxGainDb: -9,
};

export const TTS = {
  // "elevenlabs" nếu có ELEVENLABS_API_KEY, ngược lại edge-tts (miễn phí)
  provider: (process.env.TTS_PROVIDER ?? (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "edge")) as "elevenlabs" | "edge",
  // edge-tts
  voice: process.env.TTS_VOICE ?? "vi-VN-NamMinhNeural",
  rate: process.env.TTS_RATE ?? "+0%",
};

export const ELEVENLABS = {
  // mặc định: "Phong - Warm, Clear and Expressive" (giọng Bắc, Voice Library — cần gói Starter trở lên)
  voiceId: process.env.ELEVENLABS_VOICE_ID ?? "RxhjHDfpO54FYotYtKpw",
  // turbo/flash v2.5 hỗ trợ tiếng Việt, 0.5 credit/ký tự; eleven_v3 tự nhiên hơn nhưng 1 credit/ký tự
  model: process.env.ELEVENLABS_MODEL ?? "eleven_turbo_v2_5",
  creditsPerChar: Number(process.env.ELEVENLABS_CREDITS_PER_CHAR ?? ((process.env.ELEVENLABS_MODEL ?? "eleven_turbo_v2_5").includes("v2_5") ? 0.5 : 1)),
  speed: Number(process.env.ELEVENLABS_SPEED ?? 1.0),
};

export const API = {
  baseUrl: "https://openrouter.ai/api/v1",
  imageModel: process.env.IMAGE_MODEL ?? "google/gemini-2.5-flash-image",
  textModel: process.env.TEXT_MODEL ?? "google/gemini-2.5-flash-lite",
  budgetUsd: Number(process.env.BUDGET_USD ?? 2),
  // phòng hờ khi /models không trả giá ảnh: ước lượng thận trọng mỗi ảnh
  fallbackUsdPerImage: 0.05,
};
