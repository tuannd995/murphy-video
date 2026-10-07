// Layer hiệu ứng: mưa, bụi nắng, vignette, grain, flash, glitch, fade.
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import { rng } from "../utils/anim.js";
import { H, W, type Ctx } from "./canvas.js";

const RAIN = (() => {
  const r = rng(42);
  return Array.from({ length: 420 }, () => ({ x: r() * W * 1.3, y: r() * H, len: 18 + r() * 34, sp: 1300 + r() * 900, z: 0.4 + r() * 0.6 }));
})();

/** mưa chéo; intensity 0..1 */
export function rain(ctx: Ctx, t: number, intensity: number) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  const n = Math.floor(RAIN.length * intensity);
  for (let i = 0; i < n; i++) {
    const d = RAIN[i];
    const y = (d.y + t * d.sp * d.z) % (H + 80) - 40;
    const x = ((d.x - t * 260 * d.z) % (W * 1.3) + W * 1.3) % (W * 1.3) - W * 0.15;
    ctx.strokeStyle = `rgba(220,232,245,${0.22 + 0.35 * d.z})`;
    ctx.lineWidth = 1 + 1.6 * d.z;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - d.len * 0.22, y + d.len * d.z);
    ctx.stroke();
  }
  // trời tối hơn khi mưa
  ctx.fillStyle = `rgba(30,45,70,${0.18 * intensity})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

const DUST = (() => {
  const r = rng(7);
  return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * H, r: 1.5 + r() * 4, sp: 8 + r() * 22, ph: r() * 6.28 }));
})();

/** bụi/hạt sáng lơ lửng */
export function dust(ctx: Ctx, t: number, alpha = 0.5, color = "255,236,200") {
  ctx.save();
  for (const d of DUST) {
    const y = ((d.y - t * d.sp) % H + H) % H;
    const x = d.x + Math.sin(t * 0.6 + d.ph) * 18;
    const a = alpha * (0.4 + 0.6 * Math.sin(t * 1.3 + d.ph) ** 2);
    ctx.fillStyle = `rgba(${color},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

let vignetteCanvas: Canvas | null = null;
export function vignette(ctx: Ctx, strength = 0.42) {
  if (!vignetteCanvas) {
    vignetteCanvas = createCanvas(W, H);
    const c = vignetteCanvas.getContext("2d");
    const g = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(10,12,20,1)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  ctx.save();
  ctx.globalAlpha = strength;
  ctx.drawImage(vignetteCanvas, 0, 0);
  ctx.restore();
}

let grainCanvas: Canvas | null = null;
/** grain nhẹ cho cảm giác "texture" */
export function grain(ctx: Ctx, t: number, alpha = 0.04) {
  if (!grainCanvas) {
    grainCanvas = createCanvas(512, 512);
    const c = grainCanvas.getContext("2d");
    const img = c.createImageData(512, 512);
    const r = rng(99);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "overlay";
  // đổi pattern 6 lần/giây (không phải mỗi frame) để giữ texture mà file vẫn nhẹ
  const step = Math.floor(t * 6);
  const ox = -((step * 197) % 512), oy = -((step * 331) % 512);
  for (let x = ox; x < W; x += 512) for (let y = oy; y < H; y += 512) ctx.drawImage(grainCanvas, x, y);
  ctx.restore();
}

export function flash(ctx: Ctx, amount: number, color = "255,255,255") {
  if (amount <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(${color},${Math.min(1, amount)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export const fadeBlack = (ctx: Ctx, amount: number) => flash(ctx, amount, "0,0,0");

/** glitch: dịch ngang các dải + lệch kênh màu */
export function glitch(ctx: Ctx, t: number, amount: number) {
  if (amount <= 0) return;
  const canvas = ctx.canvas as unknown as Canvas;
  const snap = createCanvas(canvas.width, canvas.height);
  snap.getContext("2d").drawImage(canvas, 0, 0);
  const sx = canvas.width / W;
  const r = rng(Math.floor(t * 24) + 1);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 14; i++) {
    const y = r() * canvas.height, h = (8 + r() * 70) * sx, dx = (r() - 0.5) * 120 * amount * sx;
    ctx.drawImage(snap, 0, y, canvas.width, h, dx, y, canvas.width, h);
  }
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.35 * amount;
  ctx.drawImage(snap, 10 * amount * sx, 0);
  ctx.fillStyle = "rgba(255,0,60,0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
