// Ghép các scene clip + audio mix → output/murphy-law.mp4, kèm subtitle .srt tiếng Việt & tiếng Anh (soft-sub).
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../src/config/index.js";
import type { Storyboard } from "../src/script/timeline.js";
import { fmtTime, probeDuration, run } from "../src/utils/media.js";

const sb: Storyboard = JSON.parse(fs.readFileSync(PATHS.storyboard, "utf8"));
const out = PATHS.output;

// subtitles
for (const lang of ["vi", "en"] as const) {
  let n = 0;
  const body = sb.scenes
    .flatMap((s) => s.captions.map((c) => `${++n}\n${fmtTime(s.start + c.start)} --> ${fmtTime(s.start + c.end + 0.2)}\n${c[lang]}\n`))
    .join("\n");
  fs.writeFileSync(path.join(out, `murphy-law.${lang}.srt`), body);
}

const clips = sb.scenes.map((s) => path.join(PATHS.sceneClips, `${s.id}.mp4`));
const missing = clips.filter((c) => !fs.existsSync(c));
if (missing.length) throw new Error(`Thiếu clip: ${missing.join(", ")} — chạy npm run render`);
const list = path.join(out, "concat.txt");
fs.writeFileSync(list, clips.map((c) => `file '${c}'`).join("\n") + "\n");

const final = path.join(out, "murphy-law.mp4");
await run("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0", "-i", list,
  "-i", path.join(out, "audio-mix.wav"),
  "-i", path.join(out, "murphy-law.vi.srt"),
  "-i", path.join(out, "murphy-law.en.srt"),
  "-map", "0:v", "-map", "1:a", "-map", "2", "-map", "3",
  "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-c:s", "mov_text",
  "-metadata:s:s:0", "language=vie", "-metadata:s:s:1", "language=eng",
  "-movflags", "+faststart",
  final,
]);
const d = probeDuration(final);
const mb = fs.statSync(final).size / 1e6;
console.log(`✔ ${path.relative(process.cwd(), final)}  ${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}  ${mb.toFixed(1)} MB`);
console.log("  + output/murphy-law.vi.srt, output/murphy-law.en.srt");
