// Liệt kê voice ElevenLabs trong tài khoản (miễn phí) để chọn ELEVENLABS_VOICE_ID.
import { elevenQuota, elevenVoices } from "../src/audio/elevenlabs.js";

const q = await elevenQuota();
console.log(`Quota: ${q.used}/${q.limit} (tier: ${q.tier})\n`);
for (const v of await elevenVoices()) {
  const l = v.labels ?? {};
  console.log(`${v.voice_id}  ${v.name.padEnd(28)} ${[l.gender, l.accent, l.language, l.age].filter(Boolean).join(", ")}`);
}
console.log("\nThêm giọng tiếng Việt từ Voice Library (elevenlabs.io → Voices → Library, lọc Vietnamese) rồi chạy lại.");
