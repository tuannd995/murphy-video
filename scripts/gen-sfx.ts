// Tạo SFX + 2 track nhạc nền bằng tổng hợp âm thanh local ($0).
import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../src/config/index.js";
import { SR, SFX, renderMusic, renderSfx } from "../src/audio/synth.js";
import { writeWav } from "../src/utils/media.js";

const force = process.argv.includes("--force");
fs.mkdirSync(PATHS.sfx, { recursive: true });
fs.mkdirSync(PATHS.music, { recursive: true });

for (const id of Object.keys(SFX)) {
  const f = path.join(PATHS.sfx, `${id}.wav`);
  if (!force && fs.existsSync(f)) continue;
  writeWav(f, [renderSfx(id)], SR);
}
console.log(`SFX: ${Object.keys(SFX).join(", ")} → assets/sfx/`);

for (const mood of ["curious", "warm"] as const) {
  const f = path.join(PATHS.music, `${mood}.wav`);
  if (!force && fs.existsSync(f)) continue;
  writeWav(f, renderMusic(mood), SR);
}
console.log("Music: curious.wav, warm.wav → assets/music/");
