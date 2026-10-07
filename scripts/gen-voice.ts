// Voice-over tiếng Việt: mỗi câu caption = 1 file mp3 (đồng bộ subtitle chính xác, dễ sửa từng câu).
// Provider:
//   - elevenlabs (khi có ELEVENLABS_API_KEY): chất lượng cao, tính theo ký tự → cần --confirm
//   - edge (mặc định nếu không có key): edge-tts miễn phí. Cài: pip install edge-tts
//   npm run voice                          # dry-run với ElevenLabs: in số ký tự + quota còn lại
//   npm run voice -- --confirm             # tạo các câu còn thiếu
//   npm run voice -- --confirm --force     # tạo lại tất cả
//   npm run voice -- --confirm --only=scene-04_02
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { ELEVENLABS, PATHS, TTS } from "../src/config/index.js";
import { voiceFile } from "../src/audio/voice.js";
import type { ScriptFile } from "../src/script/types.js";
import { elevenQuota, elevenTts } from "../src/audio/elevenlabs.js";
import { loadLedger, saveLedger } from "../src/utils/openrouter.js";

const pexec = promisify(execFile);
const args = process.argv.slice(2);
const force = args.includes("--force");
const confirm = args.includes("--confirm");
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const provider = TTS.provider;

const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));
fs.mkdirSync(PATHS.voice, { recursive: true });

const hasAudio = (f: string) => fs.existsSync(f) && fs.statSync(f).size > 1000;
const clean = (s: string) => s.replace(/[“”"]/g, "").replace(/^\.\.\./, "").trim();
const all = script.scenes.flatMap((s) =>
  s.captions.map((c, i) => ({
    file: voiceFile(s.id, i),
    text: clean(c.vi),
    prev: i > 0 ? clean(s.captions[i - 1].vi) : undefined,
    next: i < s.captions.length - 1 ? clean(s.captions[i + 1].vi) : undefined,
  })),
);
const jobs = all
  .filter((j) => !only || only.includes(path.basename(j.file, ".mp3")))
  .filter((j) => force || !hasAudio(j.file));
const chars = jobs.reduce((n, j) => n + j.text.length, 0);

console.log(`TTS provider: ${provider} | ${jobs.length} câu | ${chars} ký tự`);
if (jobs.length === 0) process.exit(0);

if (provider === "elevenlabs") {
  const credits = Math.ceil(chars * ELEVENLABS.creditsPerChar);
  console.log(`Model ${ELEVENLABS.model}, voice ${ELEVENLABS.voiceId || "(chưa đặt)"} → ~${credits} credits`);
  try {
    const q = await elevenQuota();
    console.log(`Quota ElevenLabs: đã dùng ${q.used}/${q.limit}, còn ${q.limit - q.used} (tier: ${q.tier})`);
    if (q.limit - q.used < credits) {
      console.error("Không đủ quota cho lần chạy này. Dừng.");
      process.exit(1);
    }
  } catch (e) {
    console.warn("⚠ Không đọc được quota:", (e as Error).message);
  }
  if (!ELEVENLABS.voiceId) {
    console.error("Thiếu ELEVENLABS_VOICE_ID. Chạy `npm run voices` để xem danh sách voice và chọn một giọng.");
    process.exit(1);
  }
  if (!confirm) {
    console.log("\nDry-run. Thêm --confirm để gọi API ElevenLabs.");
    process.exit(0);
  }
}

let done = 0;
async function one(j: (typeof jobs)[number]) {
  if (provider === "elevenlabs") {
    fs.writeFileSync(j.file, await elevenTts(j.text, j.prev, j.next));
  } else {
    await pexec("python3", ["-m", "edge_tts", "--voice", TTS.voice, `--rate=${TTS.rate}`, "--text", j.text, "--write-media", j.file]);
  }
}
async function worker() {
  for (let j = jobs.shift(); j; j = jobs.shift()) {
    for (let attempt = 1; ; attempt++) {
      try {
        await one(j);
        break;
      } catch (e) {
        fs.rmSync(j.file, { force: true }); // không để lại file rỗng
        if (attempt >= 3) throw e;
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    process.stdout.write(`\r  ${++done} xong`);
  }
}
await Promise.all(Array.from({ length: provider === "elevenlabs" ? 2 : 3 }, worker));

if (provider === "elevenlabs") {
  const ledger = loadLedger();
  ledger.spent.push({ ts: new Date().toISOString(), step: "tts", model: `elevenlabs/${ELEVENLABS.model}`, item: `${done} câu, ${chars} ký tự`, usd: 0 });
  saveLedger(ledger);
}
console.log("\nVoice xong → assets/audio/voice/");
