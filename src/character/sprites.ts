// Bộ tư thế dạng ảnh (sprite) cho nhân vật: tách nền xanh, cắt sát, và vẽ với chuyển động bằng code.
import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage, type Image } from "@napi-rs/canvas";
import type { Ctx } from "../components/canvas.js";
import { ROOT } from "../config/index.js";
import { clamp, easeOutBack } from "../utils/anim.js";

export interface CharacterDef {
  id: string;
  name: string;
  description: string;
  reference: string;
  heightPx: number;
  poses: { id: string; prompt: string; height?: number }[];
  variants: { id: string; base: string; edit: string }[];
}

export const charDir = (id: string) => path.join(ROOT, "characters", id);
export const loadDef = (id: string): CharacterDef => JSON.parse(fs.readFileSync(path.join(charDir(id), `${id}.json`), "utf8"));

/**
 * Tách nền trơn (xanh lá hoặc màu bất kỳ): lấy màu nền ở viền ảnh, loang từ mép vào trong qua các điểm gần màu nền,
 * làm mềm + khử màu nền ở viền, rồi cắt sát theo nhân vật. Trả về PNG trong suốt.
 * Chỉ xoá vùng nối liền với mép ảnh nên mảng màu bên trong nhân vật không bị ăn mất.
 */
export async function keyBackground(input: Buffer, tolerance = 62): Promise<Buffer> {
  const img = await loadImage(input);
  const W = img.width, H = img.height;
  const c = createCanvas(W, H);
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, H);
  const p = d.data;
  // màu nền = trung vị các điểm viền
  const border: number[][] = [];
  for (let i = 0; i < W; i += 4) border.push([i, 0], [i, H - 1]);
  for (let j = 0; j < H; j += 4) border.push([0, j], [W - 1, j]);
  const med = (k: number) => border.map(([i, j]) => p[(j * W + i) * 4 + k]).sort((a, b) => a - b)[border.length >> 1];
  const bg = [med(0), med(1), med(2)];
  const dist = (o: number) => Math.hypot(p[o] - bg[0], p[o + 1] - bg[1], p[o + 2] - bg[2]);

  // loang từ mép
  const removed = new Uint8Array(W * H);
  const stack: number[] = [];
  for (const [i, j] of border) stack.push(j * W + i);
  for (let i = 0; i < W; i++) stack.push(i, (H - 1) * W + i);
  for (let j = 0; j < H; j++) stack.push(j * W, j * W + W - 1);
  while (stack.length) {
    const k = stack.pop()!;
    if (removed[k] || dist(k * 4) > tolerance) continue;
    removed[k] = 1;
    const i = k % W, j = (k / W) | 0;
    if (i > 0) stack.push(k - 1); if (i < W - 1) stack.push(k + 1);
    if (j > 0) stack.push(k - W); if (j < H - 1) stack.push(k + W);
  }
  // nền bị kẹp bên trong (vd. khoảng trống giữa tay và hông): điểm rất gần màu nền thì xoá luôn
  for (let k = 0; k < W * H; k++) if (!removed[k] && dist(k * 4) < tolerance * 0.5) removed[k] = 1;
  // viền mềm: điểm còn lại sát vùng đã xoá → alpha theo khoảng cách màu, khử màu nền
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let k = 0; k < W * H; k++) {
    const o = k * 4;
    if (removed[k]) { p[o + 3] = 0; continue; }
    const i = k % W, j = (k / W) | 0;
    const edge = (i > 0 && removed[k - 1]) || (i < W - 1 && removed[k + 1]) || (j > 0 && removed[k - W]) || (j < H - 1 && removed[k + W]);
    if (edge) {
      const a = clamp((dist(o) - tolerance * 0.5) / (tolerance * 1.2));
      if (a < 1 && a > 0.02) for (let ch = 0; ch < 3; ch++) p[o + ch] = clamp((p[o + ch] - bg[ch] * (1 - a)) / a, 0, 255);
      p[o + 3] = Math.round(255 * a);
    }
    if (p[o + 3] > 24) { if (i < minX) minX = i; if (i > maxX) maxX = i; if (j < minY) minY = j; if (j > maxY) maxY = j; }
  }
  x.putImageData(d, 0, 0);
  const pad = 6;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const out = createCanvas(maxX - minX + 1, maxY - minY + 1);
  out.getContext("2d").drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toBuffer("image/png");
}

export interface SpriteChar {
  def: CharacterDef;
  img: Map<string, Image>;
  height: Map<string, number>;
}

export async function loadSprites(id: string): Promise<SpriteChar> {
  const def = loadDef(id);
  const img = new Map<string, Image>();
  const height = new Map<string, number>();
  const dir = path.join(charDir(id), "poses");
  for (const p of [...def.poses, ...def.variants.map((v) => ({ id: v.id, height: def.poses.find((x) => x.id === v.base)?.height }))]) {
    const f = path.join(dir, `${p.id}.png`);
    if (fs.existsSync(f)) {
      img.set(p.id, await loadImage(fs.readFileSync(f)));
      height.set(p.id, (p as { height?: number }).height ?? 1);
    }
  }
  return { def, img, height };
}

export interface SpriteState {
  pose: string;
  /** thời điểm bắt đầu tư thế hiện tại (để nảy khi đổi tư thế) */
  poseStart: number;
  t: number;
  /** 0..1 độ mở miệng (chỉ áp dụng cho tư thế "stand") */
  talk?: number;
  /** đang đi/chạy: luân phiên khung */
  walking?: boolean;
  running?: boolean;
}

export interface SpriteDraw { x: number; y: number; height: number; flip?: boolean; shadow?: boolean }

/** Vẽ nhân vật dạng sprite: đổi khung + nảy khi đổi tư thế, thở, nét rung, nhép miệng, chớp mắt, đi bộ */
export function drawSprite(ctx: Ctx, ch: SpriteChar, st: SpriteState, o: SpriteDraw) {
  let id = st.pose;
  const t = st.t;
  if (st.walking) id = Math.floor(t * 6) % 2 === 0 ? "walk-a" : "walk-b";
  if (st.running) id = "run";
  if (id === "stand") {
    if ((st.talk ?? 0) > 0.28 && ch.img.has("stand-talk")) id = "stand-talk";
    else if ((t % 3.6) / 3.6 > 0.965 && ch.img.has("stand-blink")) id = "stand-blink";
  }
  const im = ch.img.get(id) ?? ch.img.get("stand");
  if (!im) return;

  const since = t - st.poseStart;
  const pop = since < 0.35 ? 0.9 + 0.1 * easeOutBack(clamp(since / 0.35)) : 1;
  const breathe = 1 + 0.012 * Math.sin(t * 2.4);
  const boil = Math.floor(t * 8);
  const jr = Math.sin(boil * 12.9898) * 0.006;
  const jx = Math.sin(boil * 78.233) * 1.2;
  const bob = st.walking ? -Math.abs(Math.sin(t * Math.PI * 6)) * 10 : st.running ? -Math.abs(Math.sin(t * Math.PI * 9)) * 16 : 0;

  const hFactor = ch.height.get(st.pose) ?? 1;
  const scale = (o.height * hFactor) / im.height;
  const w = im.width * scale, h = im.height * scale;

  ctx.save();
  if (o.shadow !== false) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath(); ctx.ellipse(o.x, o.y + 4, w * 0.32, 14, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.translate(o.x + jx, o.y + bob);
  ctx.rotate(jr);
  ctx.scale((o.flip ? -1 : 1) * pop, pop * breathe);
  ctx.drawImage(im, -w / 2, -h, w, h);
  ctx.restore();
}
