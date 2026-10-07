// Subtitle song ngữ: tiếng Việt lớn (tối đa 2 dòng) + tiếng Anh nhỏ bên dưới.
// Mặc định căn giữa đáy khung 16:9; bản dọc 9:16 truyền layout riêng (chữ to hơn, nằm giữa màn hình).
import type { TimedCaption } from "../script/timeline.js";
import { clamp } from "../utils/anim.js";
import { roundRect } from "./backdrop.js";
import { FONT, H, W, font, type Ctx } from "./canvas.js";
import { wrap } from "./ui.js";

export interface SubtitleLayout {
  frameW: number;
  /** đáy của hộp phụ đề (px) */
  bottom: number;
  viSize: number;
  enSize: number;
  maxW: number;
  /** số dòng tiếng Việt tối đa mỗi trang */
  maxLines?: number;
}

export const LANDSCAPE: SubtitleLayout = { frameW: W, bottom: H - 56, viSize: 46, enSize: 30, maxW: 1480 };
const PAD_X = 34, PAD_Y = 20;

/** tách câu dài thành các đoạn ≤ 2 dòng, chia thời gian theo độ dài */
function pages(ctx: Ctx, s: string, size: number, family: string, maxW: number, per = 2): string[][] {
  ctx.font = font(size, family);
  const lines = wrap(ctx, s, maxW);
  const out: string[][] = [];
  for (let i = 0; i < lines.length; i += per) out.push(lines.slice(i, i + per));
  return out;
}

export function drawSubtitle(ctx: Ctx, t: number, all: TimedCaption[], L: SubtitleLayout = LANDSCAPE) {
  const captions = all.filter((c) => !c.skip);
  const idx = captions.findIndex((c, i) => t >= c.start - 0.05 && t < (captions[i + 1]?.start ?? c.end + 0.6) - 0.08 && t < c.end + 0.6);
  if (idx < 0) return;
  const c = captions[idx];
  const viPages = pages(ctx, c.vi, L.viSize, FONT.bold, L.maxW, L.maxLines);
  const enPages = pages(ctx, c.en, L.enSize, FONT.med, L.maxW, L.maxLines);
  const dur = c.end - c.start;
  const p = clamp((t - c.start) / Math.max(dur, 0.1), 0, 0.999);
  const vi = viPages[Math.floor(p * viPages.length)];
  const en = enPages[Math.floor(p * enPages.length)];

  const alpha = clamp((t - c.start + 0.05) / 0.18) * clamp(((captions[idx + 1]?.start ?? c.end + 0.6) - 0.08 - t) / 0.15);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font(L.viSize, FONT.bold);
  const wVi = Math.max(...vi.map((l) => ctx.measureText(l).width));
  ctx.font = font(L.enSize, FONT.med);
  const wEn = Math.max(...en.map((l) => ctx.measureText(l).width));
  const boxW = Math.max(wVi, wEn) + PAD_X * 2;
  const boxH = PAD_Y * 2 + vi.length * L.viSize * 1.22 + 10 + en.length * L.enSize * 1.25;
  const bx = (L.frameW - boxW) / 2, by = L.bottom - boxH;
  ctx.fillStyle = "rgba(14,18,26,0.62)";
  roundRect(ctx, bx, by, boxW, boxH, 18); ctx.fill();

  ctx.textAlign = "center"; ctx.textBaseline = "top";
  let y = by + PAD_Y;
  ctx.font = font(L.viSize, FONT.bold);
  ctx.fillStyle = "#ffffff";
  for (const l of vi) { ctx.fillText(l, L.frameW / 2, y); y += L.viSize * 1.22; }
  y += 10;
  ctx.font = font(L.enSize, FONT.med);
  ctx.fillStyle = "#f2d38a";
  for (const l of en) { ctx.fillText(l, L.frameW / 2, y); y += L.enSize * 1.25; }
  ctx.restore();
}
