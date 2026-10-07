// Demo nhân vật vẽ bằng canvas: các tư thế, biểu cảm, đi bộ, nhép miệng → output/character-demo.mp4
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { FONT, H, W, font, registerFonts } from "../src/components/canvas.js";
import { HERO_LOOK, POSES, blendPose, drawDoodle, type Pose } from "../src/character/doodle.js";
import { mouthEnvelope } from "../src/character/lipsync.js";
import { PATHS } from "../src/config/index.js";
import { run } from "../src/utils/media.js";

const FPS = 30;
registerFonts();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const seq: [string, number][] = [
  ["stand", 1.6], ["think", 1.8], ["shock", 1.8], ["happy", 1.8], ["point", 1.6],
  ["facepalm", 1.6], ["shrug", 1.5], ["angry", 1.5], ["walk", 2.4], ["talk", 3.0],
];
const voice = path.join(PATHS.voice, "scene-00_00.mp3");
const hasVoice = fs.existsSync(voice);
const env = hasVoice ? mouthEnvelope(voice, FPS) : [];
const total = seq.reduce((s, [, d]) => s + d, 0);
const talkStart = total - 3.0 + 0.3;

const poseAt = (name: string): Pose => POSES[name === "walk" || name === "talk" ? "stand" : name];

function frame(t: number) {
  ctx.fillStyle = "#f6eedc";
  ctx.fillRect(0, 0, W, H);
  // sàn + góc phòng vẽ tay
  ctx.strokeStyle = "#151515"; ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(60, 860); ctx.lineTo(1860, 852); ctx.stroke();
  ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(60, 120); ctx.lineTo(420, 260); ctx.lineTo(420, 860); ctx.moveTo(1860, 110); ctx.lineTo(1500, 250); ctx.lineTo(1500, 852); ctx.stroke();
  ctx.globalAlpha = 1;

  // xác định tư thế hiện tại + chuyển tiếp 0.45s
  let acc = 0, i = 0;
  while (i < seq.length - 1 && t >= acc + seq[i][1]) { acc += seq[i][1]; i++; }
  const [name] = seq[i];
  const local = t - acc;
  const prev = i > 0 ? poseAt(seq[i - 1][0]) : poseAt("stand");
  const pose = blendPose(prev, poseAt(name), local / 0.45);

  let x = 960, walk: number | undefined, flip = false;
  if (name === "walk") {
    walk = local * 1.6;
    x = 960 - 260 + (local / seq[i][1]) * 520;
  }
  if (name === "talk") x = 960;
  const fi = Math.floor((t - talkStart) * FPS);
  const talk = name === "talk" && fi >= 0 && fi < env.length ? env[fi] : 0;
  const talkPose: Pose = name === "talk" ? { ...pose, eyes: "dot", brows: "up", mouth: "smile", rHand: { x: 150, y: -330 }, rBend: 1 } : pose;

  drawDoodle(ctx, { pose: talkPose, t, walk, talk }, { x, y: 858, scale: 1.05, look: HERO_LOOK, flip });

  // nhãn
  ctx.fillStyle = "#151515"; ctx.font = font(44, FONT.xbold); ctx.textAlign = "left";
  ctx.fillText(`pose: ${name}`, 80, 90);
  ctx.font = font(28, FONT.semi); ctx.fillStyle = "#e0362c";
  ctx.fillText("Nhân vật vẽ bằng canvas · không dùng ảnh AI", 80, 135);
}

const out = path.join(PATHS.output, "character-demo.mp4");
const silent = path.join(PATHS.output, "character-demo.video.mp4");
fs.mkdirSync(PATHS.output, { recursive: true });
const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", silent], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise<void>((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
const N = Math.round(total * FPS);
for (let f = 0; f < N; f++) {
  frame(f / FPS);
  if (!ff.stdin.write(Buffer.from(canvas.data()))) await new Promise((r) => ff.stdin.once("drain", r));
  if (f === Math.round(5.6 * FPS)) fs.writeFileSync(path.join(PATHS.output, "character-demo-still.png"), canvas.toBuffer("image/png"));
}
ff.stdin.end();
await done;
if (hasVoice) {
  await run("ffmpeg", ["-y", "-v", "error", "-i", silent, "-i", voice, "-filter_complex", `[1]adelay=${Math.round(talkStart * 1000)}|${Math.round(talkStart * 1000)},apad[a]`,
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-shortest", out]);
  fs.rmSync(silent);
} else fs.renameSync(silent, out);
console.log(`→ ${path.relative(process.cwd(), out)} (${total.toFixed(1)}s)`);
