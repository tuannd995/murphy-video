// Demo nhân vật dạng bộ tư thế (sprite) + chuyển động bằng code → output/sprite-demo.mp4
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { FONT, H, W, font, registerFonts } from "../src/components/canvas.js";
import { mouthEnvelope } from "../src/character/lipsync.js";
import { drawSprite, loadSprites } from "../src/character/sprites.js";
import { PATHS } from "../src/config/index.js";
import { run } from "../src/utils/media.js";

const FPS = 30;
registerFonts();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");
const hero = await loadSprites(process.argv[2] ?? "hero");

const voice = path.join(PATHS.voice, "scene-00_00.mp3");
const env = fs.existsSync(voice) ? mouthEnvelope(voice, FPS) : [];
const seq: [string, number][] = [
  ["stand", 1.5], ["talk", 3.0], ["think", 1.6], ["point", 1.5], ["shock", 1.6], ["happy", 1.6], ["sad", 1.5],
  ["angry", 1.5], ["facepalm", 1.5], ["shrug", 1.5], ["thumbsup", 1.5], ["walk", 3.0], ["run", 2.2],
];
const total = seq.reduce((s, [, d]) => s + d, 0);
const talkStart = 1.5 + 0.2;

function room() {
  ctx.fillStyle = "#f6eedc"; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#151515"; ctx.lineCap = "round";
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, 880); ctx.lineTo(1880, 872); ctx.stroke();
  ctx.lineWidth = 3; ctx.globalAlpha = 0.45;
  ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(400, 250); ctx.lineTo(400, 880); ctx.moveTo(1880, 110); ctx.lineTo(1520, 240); ctx.lineTo(1520, 872);
  ctx.rect(1580, 330, 200, 150); ctx.moveTo(1680, 330); ctx.lineTo(1680, 480); ctx.stroke();
  ctx.globalAlpha = 1;
}

function frame(t: number) {
  room();
  let acc = 0, i = 0;
  while (i < seq.length - 1 && t >= acc + seq[i][1]) { acc += seq[i][1]; i++; }
  const [name, dur] = seq[i];
  const local = t - acc;
  let x = 960, flip = false;
  const fi = Math.floor((t - talkStart) * FPS);
  const talk = name === "talk" && fi >= 0 && fi < env.length ? env[fi] : 0;
  if (name === "walk") x = 560 + (local / dur) * 800;
  if (name === "run") { x = 1500 - (local / dur) * 1300; flip = true; }
  drawSprite(ctx, hero, {
    pose: name === "talk" || name === "walk" || name === "run" ? "stand" : name,
    poseStart: acc, t, talk, walking: name === "walk", running: name === "run",
  }, { x, y: 876, height: 600, flip });
  ctx.fillStyle = "#151515"; ctx.font = font(44, FONT.xbold); ctx.textAlign = "left";
  ctx.fillText(`pose: ${name}`, 80, 90);
  ctx.font = font(28, FONT.semi); ctx.fillStyle = "#e0362c";
  ctx.fillText("Bộ tư thế (AI vẽ 1 lần) + chuyển động bằng code", 80, 135);
}

const out = path.join(PATHS.output, "sprite-demo.mp4");
const silent = out.replace(".mp4", ".video.mp4");
const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", silent], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise<void>((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
for (let f = 0; f < Math.round(total * FPS); f++) {
  frame(f / FPS);
  if (!ff.stdin.write(Buffer.from(canvas.data()))) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
await done;
if (env.length) {
  const ms = Math.round(talkStart * 1000);
  await run("ffmpeg", ["-y", "-v", "error", "-i", silent, "-i", voice, "-filter_complex", `[1]adelay=${ms}|${ms},apad[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-shortest", out]);
  fs.rmSync(silent);
} else fs.renameSync(silent, out);
console.log(`→ ${path.relative(process.cwd(), out)} (${total.toFixed(1)}s)`);
