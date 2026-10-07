import { ELEVENLABS } from "../config/index.js";

const BASE = "https://api.elevenlabs.io/v1";

function key() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("Thiếu ELEVENLABS_API_KEY");
  return k;
}

async function req(pathname: string, init: RequestInit = {}) {
  const res = await fetch(BASE + pathname, {
    ...init,
    headers: { "xi-api-key": key(), "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`ElevenLabs ${pathname} ${res.status}: ${(await res.text()).slice(0, 400)}`);
  return res;
}

/** Quota còn lại (miễn phí, không tốn credit) */
export async function elevenQuota() {
  const s = await (await req("/user/subscription")).json();
  return { used: s.character_count as number, limit: s.character_limit as number, tier: s.tier as string };
}

/** Danh sách voice trong tài khoản (miễn phí) */
export async function elevenVoices(): Promise<{ voice_id: string; name: string; labels?: Record<string, string> }[]> {
  return (await (await req("/voices")).json()).voices;
}

/** Đọc 1 câu → mp3. previous/next text giúp ngữ điệu liền mạch giữa các câu. */
export async function elevenTts(text: string, previous?: string, next?: string): Promise<Buffer> {
  const res = await req(`/text-to-speech/${ELEVENLABS.voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS.model,
      language_code: "vi",
      previous_text: previous,
      next_text: next,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true, speed: ELEVENLABS.speed },
    }),
  });
  return Buffer.from(await res.arrayBuffer());
}
