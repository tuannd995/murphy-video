// Render các scene song song → output/scenes/*.mp4
//   npm run render                       # tất cả
//   npm run render -- --only=scene-03,scene-04
import os from "node:os";
import fs from "node:fs";
import { PATHS } from "../src/config/index.js";
import type { Storyboard } from "../src/script/timeline.js";
import { run } from "../src/utils/media.js";

const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const sb: Storyboard = JSON.parse(fs.readFileSync(PATHS.storyboard, "utf8"));
const queue = sb.scenes.map((s) => s.id).filter((id) => !only || only.includes(id));
const jobs = Math.max(1, Math.min(Number(process.env.RENDER_JOBS ?? os.cpus().length), queue.length));

console.log(`Render ${queue.length} scene (${jobs} tiến trình song song), ${sb.width}x${sb.height}@${sb.fps}`);
const t0 = Date.now();
await Promise.all(
  Array.from({ length: jobs }, async () => {
    for (let id = queue.shift(); id; id = queue.shift()) await run("npx", ["tsx", "scripts/render-scene.ts", id]);
  }),
);
console.log(`Render xong sau ${((Date.now() - t0) / 1000).toFixed(0)}s`);
