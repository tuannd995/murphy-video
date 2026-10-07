// Nghe thử 1 giọng ElevenLabs (~45 credits): tsx scripts/voice-sample.ts <voiceId> [tên]
import fs from "node:fs";
import path from "node:path";
import { ELEVENLABS, PATHS } from "../src/config/index.js";
import { elevenTts } from "../src/audio/elevenlabs.js";

const [voiceId, name = voiceId] = process.argv.slice(2);
ELEVENLABS.voiceId = voiceId;
const dir = path.join(PATHS.output, "voice-test");
fs.mkdirSync(dir, { recursive: true });
const f = path.join(dir, `${name}.mp3`);
fs.writeFileSync(f, await elevenTts("Bảy giờ sáng. Bạn đang vội đi làm. Nhưng lần này, bạn đã chuẩn bị mọi thứ từ tối hôm trước."));
console.log(f);
