// UI overlay: panel, chữ, terminal, nhãn, bong bóng, checklist.
import { PALETTE } from "../config/style.js";
import { appear, clamp, easeOutBack, prog } from "../utils/anim.js";
import { roundRect } from "./backdrop.js";
import { FONT, font, type Ctx } from "./canvas.js";

export function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function panel(ctx: Ctx, x: number, y: number, w: number, h: number, opts: { fill?: string; radius?: number; alpha?: number; stroke?: string } = {}) {
  ctx.save();
  ctx.globalAlpha *= opts.alpha ?? 1;
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = opts.fill ?? "rgba(244,239,230,0.94)";
  roundRect(ctx, x, y, w, h, opts.radius ?? 28); ctx.fill();
  ctx.restore();
  if (opts.stroke) {
    ctx.save(); ctx.globalAlpha *= opts.alpha ?? 1; ctx.strokeStyle = opts.stroke; ctx.lineWidth = 3; roundRect(ctx, x, y, w, h, opts.radius ?? 28); ctx.stroke(); ctx.restore();
  }
}

/** pop-in với easeOutBack: trả về scale 0..~1.1..1 */
export const pop = (t: number, start: number, dur = 0.45) => (t < start ? 0 : easeOutBack(prog(t, start, dur)));

/** chữ gõ từng ký tự */
export function typewriter(text: string, t: number, start: number, cps = 28) {
  const n = Math.floor(clamp((t - start) * cps, 0, text.length));
  return text.slice(0, n);
}

export function text(ctx: Ctx, s: string, x: number, y: number, o: { size?: number; family?: string; color?: string; align?: CanvasTextAlign; alpha?: number; shadow?: boolean; stroke?: string; baseline?: CanvasTextBaseline } = {}) {
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.font = font(o.size ?? 48, o.family ?? FONT.bold);
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = o.baseline ?? "alphabetic";
  if (o.shadow) { ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = (o.size ?? 48) * 0.14; ctx.lineJoin = "round"; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color ?? "#fff";
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** nhãn dạng pill */
export function pill(ctx: Ctx, label: string, x: number, y: number, o: { size?: number; fill?: string; color?: string; scale?: number; alpha?: number; align?: "left" | "center" } = {}) {
  const size = o.size ?? 34, sc = o.scale ?? 1;
  if (sc <= 0.001 || (o.alpha ?? 1) <= 0.001) return;
  ctx.save();
  ctx.font = font(size, FONT.bold);
  const w = ctx.measureText(label).width + size * 1.2, h = size * 1.7;
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.globalAlpha *= o.alpha ?? 1;
  const x0 = o.align === "left" ? 0 : -w / 2;
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = o.fill ?? PALETTE.ink; roundRect(ctx, x0, -h / 2, w, h, h / 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = o.color ?? "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, x0 + w / 2, size * 0.05);
  ctx.restore();
}

export interface TermLine { text: string; at: number; color?: string; type?: boolean }

/** cửa sổ terminal; dòng có type=true gõ từng ký tự */
export function terminal(ctx: Ctx, x: number, y: number, w: number, h: number, t: number, lines: TermLine[], o: { title?: string; alpha?: number; tint?: string } = {}) {
  panel(ctx, x, y, w, h, { fill: o.tint ?? "rgba(22,27,36,0.95)", radius: 22, alpha: o.alpha });
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 34 + i * 30, y + 32, 9, 0, Math.PI * 2); ctx.fill(); });
  if (o.title) text(ctx, o.title, x + w / 2, y + 41, { size: 24, family: FONT.semi, color: "rgba(255,255,255,0.55)", align: "center" });
  ctx.font = font(30, FONT.mono);
  let ly = y + 100;
  for (const l of lines) {
    if (t < l.at) break;
    const s = l.type ? typewriter(l.text, t, l.at, 32) : l.text;
    ctx.fillStyle = l.color ?? "#d7dde8";
    ctx.fillText(s, x + 34, ly);
    ly += 46;
  }
  // con trỏ nhấp nháy
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = "rgba(215,221,232,0.8)"; ctx.fillRect(x + 34, ly - 28, 16, 32); }
  ctx.restore();
}

/** bong bóng ký ức / suy nghĩ */
export function bubble(ctx: Ctx, x: number, y: number, r: number, fill: string, alpha = 1) {
  if (r <= 0.5 || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = r * 0.3; ctx.shadowOffsetY = r * 0.08;
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.25, r * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** tiêu đề lớn có nền mờ, dùng cho câu trích dẫn */
export function quote(ctx: Ctx, lines: string[], x: number, y: number, t: number, start: number, o: { size?: number; color?: string; align?: CanvasTextAlign; stagger?: number } = {}) {
  const size = o.size ?? 64;
  lines.forEach((ln, i) => {
    const a = appear(t, start + i * (o.stagger ?? 0.35));
    const dy = (1 - a) * 30;
    text(ctx, ln, x, y + i * size * 1.25 + dy, { size, color: o.color ?? "#fff", align: o.align ?? "left", alpha: a, shadow: true, family: FONT.xbold });
  });
}
