// Nghe thử 1 giọng ElevenLabs (~45 credits): tsx scripts/voice-sample.ts <voiceId> [tên] ["câu đọc thử"]
import fs from "node:fs";
import path from "node:path";
import { ELEVENLABS, PATHS } from "../src/config/index.js";
import { elevenTts } from "../src/audio/elevenlabs.js";

const [voiceId, name = voiceId] = process.argv.slice(2);
ELEVENLABS.voiceId = voiceId;
const dir = path.join(PATHS.output, "voice-test");
fs.mkdirSync(dir, { recursive: true });
const f = path.join(dir, `${name}.mp3`);
const text = process.argv[4] ?? "Xin chào các bạn, chào mừng đến với Não Phẳng! Nơi tụi mình hâm nóng lại những kiến thức nguội ngắt, chẳng giúp bạn giàu thêm, nhưng sẽ cứu bạn khi cuộc nhậu bắt đầu... im lặng.";
fs.writeFileSync(f, await elevenTts(text));
console.log(f);
