// Ghép các scene clip + audio mix → output[/<định dạng>]/murphy-law[-<định dạng>].mp4, kèm subtitle .srt Việt & Anh (soft-sub).
//   npm run final [-- --type=tiktok]
import fs from "node:fs";
import path from "node:path";
import { formatPaths, parseFormatArgs } from "../src/config/formats.js";
import type { Storyboard } from "../src/script/timeline.js";
import { fmtTime, probeDuration, run } from "../src/utils/media.js";

const paths = formatPaths(parseFormatArgs());
const sb: Storyboard = JSON.parse(fs.readFileSync(paths.storyboard, "utf8"));
const out = paths.out;
const name = `murphy-law${paths.suffix}`;

// subtitles
for (const lang of ["vi", "en"] as const) {
  let n = 0;
  const body = sb.scenes
    .flatMap((s) => s.captions.filter((c) => !c.skip).map((c) => `${++n}\n${fmtTime(s.start + c.start)} --> ${fmtTime(s.start + c.end + 0.2)}\n${c[lang]}\n`))
    .join("\n");
  fs.writeFileSync(path.join(out, `${name}.${lang}.srt`), body);
}

const clips = sb.scenes.map((s) => path.join(paths.sceneClips, `${s.id}.mp4`));
const missing = clips.filter((c) => !fs.existsSync(c));
if (missing.length) throw new Error(`Thiếu clip: ${missing.join(", ")} — chạy npm run render`);
const list = path.join(out, "concat.txt");
fs.writeFileSync(list, clips.map((c) => `file '${c}'`).join("\n") + "\n");

const final = path.join(out, `${name}.mp4`);
await run("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0", "-i", list,
  "-i", path.join(out, "audio-mix.wav"),
  "-i", path.join(out, `${name}.vi.srt`),
  "-i", path.join(out, `${name}.en.srt`),
  "-map", "0:v", "-map", "1:a", "-map", "2", "-map", "3",
  "-c:v", "copy", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-c:s", "mov_text",
  "-metadata:s:s:0", "language=vie", "-metadata:s:s:1", "language=eng",
  "-movflags", "+faststart",
  final,
]);
const d = probeDuration(final);
const mb = fs.statSync(final).size / 1e6;
console.log(`✔ ${path.relative(process.cwd(), final)}  ${Math.floor(d / 60)}:${String(Math.round(d % 60)).padStart(2, "0")}  ${mb.toFixed(1)} MB`);
console.log(`  + ${path.relative(process.cwd(), path.join(out, name))}.vi.srt / .en.srt`);
