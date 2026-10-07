// Subtitle song ngữ: tiếng Việt lớn (tối đa 2 dòng) + tiếng Anh nhỏ bên dưới, căn giữa đáy khung.
import type { TimedCaption } from "../script/timeline.js";
import { clamp } from "../utils/anim.js";
import { roundRect } from "./backdrop.js";
import { FONT, H, W, font, type Ctx } from "./canvas.js";
import { wrap } from "./ui.js";

const VI_SIZE = 46, EN_SIZE = 30, MAX_W = 1480, PAD_X = 34, PAD_Y = 20;

/** tách câu dài thành các đoạn ≤ 2 dòng, chia thời gian theo độ dài */
function pages(ctx: Ctx, s: string, size: number, family: string): string[][] {
  ctx.font = font(size, family);
  const lines = wrap(ctx, s, MAX_W);
  const out: string[][] = [];
  for (let i = 0; i < lines.length; i += 2) out.push(lines.slice(i, i + 2));
  return out;
}

export function drawSubtitle(ctx: Ctx, t: number, captions: TimedCaption[]) {
  const idx = captions.findIndex((c, i) => t >= c.start - 0.05 && t < (captions[i + 1]?.start ?? c.end + 0.6) - 0.08 && t < c.end + 0.6);
  if (idx < 0) return;
  const c = captions[idx];
  const viPages = pages(ctx, c.vi, VI_SIZE, FONT.bold);
  const enPages = pages(ctx, c.en, EN_SIZE, FONT.med);
  const dur = c.end - c.start;
  const p = clamp((t - c.start) / Math.max(dur, 0.1), 0, 0.999);
  const vi = viPages[Math.floor(p * viPages.length)];
  const en = enPages[Math.floor(p * enPages.length)];

  const alpha = clamp((t - c.start + 0.05) / 0.18) * clamp(((captions[idx + 1]?.start ?? c.end + 0.6) - 0.08 - t) / 0.15);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font(VI_SIZE, FONT.bold);
  const wVi = Math.max(...vi.map((l) => ctx.measureText(l).width));
  ctx.font = font(EN_SIZE, FONT.med);
  const wEn = Math.max(...en.map((l) => ctx.measureText(l).width));
  const boxW = Math.max(wVi, wEn) + PAD_X * 2;
  const boxH = PAD_Y * 2 + vi.length * VI_SIZE * 1.22 + 10 + en.length * EN_SIZE * 1.25;
  const bx = (W - boxW) / 2, by = H - 56 - boxH;
  ctx.fillStyle = "rgba(14,18,26,0.62)";
  roundRect(ctx, bx, by, boxW, boxH, 18); ctx.fill();

  ctx.textAlign = "center"; ctx.textBaseline = "top";
  let y = by + PAD_Y;
  ctx.font = font(VI_SIZE, FONT.bold);
  ctx.fillStyle = "#ffffff";
  for (const l of vi) { ctx.fillText(l, W / 2, y); y += VI_SIZE * 1.22; }
  y += 10;
  ctx.font = font(EN_SIZE, FONT.med);
  ctx.fillStyle = "#f2d38a";
  for (const l of en) { ctx.fillText(l, W / 2, y); y += EN_SIZE * 1.25; }
  ctx.restore();
}
