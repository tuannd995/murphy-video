// Render 1 scene → output/scenes/<id>.mp4 (frame canvas → pipe rawvideo → FFmpeg).
//   tsx scripts/render-scene.ts scene-04
//   tsx scripts/render-scene.ts scene-04 --still=12.5     # xuất 1 frame PNG để xem nhanh
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { PATHS, VIDEO } from "../src/config/index.js";
import { H, W, registerFonts } from "../src/components/canvas.js";
import { drawFrame, loadSceneCtx } from "../src/components/frame.js";
import type { Storyboard } from "../src/script/timeline.js";

const id = process.argv[2];
const still = process.argv.find((a) => a.startsWith("--still="))?.slice(8);
const sb: Storyboard = JSON.parse(fs.readFileSync(PATHS.storyboard, "utf8"));
const idx = sb.scenes.findIndex((s) => s.id === id);
if (idx < 0) throw new Error(`Không thấy scene ${id}`);
const scene = sb.scenes[idx];

registerFonts();
const canvas = createCanvas(sb.width, sb.height);
const ctx = canvas.getContext("2d");
const sx = sb.width / W, sy = sb.height / H;
const sctx = await loadSceneCtx(scene);

const paint = (t: number) => {
  ctx.setTransform(sx, 0, 0, sy, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  drawFrame(ctx, sctx, t, idx === 0);
};

if (still !== undefined) {
  const times = still.split(",").map(Number);
  fs.mkdirSync(path.join(PATHS.output, "stills"), { recursive: true });
  for (const t of times) {
    paint(t);
    const f = path.join(PATHS.output, "stills", `${id}_${t.toFixed(1)}s.png`);
    fs.writeFileSync(f, canvas.toBuffer("image/png"));
    console.log(f);
  }
  process.exit(0);
}

fs.mkdirSync(PATHS.sceneClips, { recursive: true });
const out = path.join(PATHS.sceneClips, `${id}.mp4`);
const frames = Math.round(scene.duration * sb.fps);
const ff = spawn("ffmpeg", [
  "-y", "-v", "error",
  "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${sb.width}x${sb.height}`, "-r", String(sb.fps), "-i", "-",
  "-c:v", "libx264", "-preset", VIDEO.preset, "-crf", String(VIDEO.crf), "-pix_fmt", "yuv420p", "-r", String(sb.fps),
  out,
], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise<void>((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exit ${c}`)))));

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  paint(f / sb.fps);
  const data = canvas.data();
  if (!ff.stdin.write(Buffer.from(data))) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % (sb.fps * 5) === 0) process.stdout.write(`\r[${id}] ${f}/${frames}`);
}
ff.stdin.end();
await done;
console.log(`\r[${id}] ${frames} frames → ${path.relative(PATHS.output, out)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
