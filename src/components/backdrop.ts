// Layer 1–2: ảnh key visual + chuyển động camera (zoom/pan/handheld) + "thở" nhẹ cho nhân vật.
import type { Image } from "@napi-rs/canvas";
import { PALETTE } from "../config/style.js";
import { easeInOutCubic, prog } from "../utils/anim.js";
import { FONT, H, W, font, type Ctx } from "./canvas.js";

export interface Camera {
  /** thời gian của camera move (giây, tính trong shot) */
  dur: number;
  zoomFrom?: number;
  zoomTo?: number;
  /** điểm focus (0..1 theo ảnh) lúc đầu / cuối */
  fx0?: number; fy0?: number;
  fx1?: number; fy1?: number;
  /** dịch thêm (px) – dùng cho shake/look left-right */
  dx?: number; dy?: number;
  /** biên độ handheld drift */
  drift?: number;
  ease?: (t: number) => number;
}

/** Vẽ ảnh phủ kín khung với Ken Burns. Nếu chưa có ảnh → placeholder có nhân vật phác. */
export function drawShot(ctx: Ctx, img: Image | null, label: string, t: number, cam: Camera, alpha = 1) {
  const p = (cam.ease ?? easeInOutCubic)(prog(t, 0, cam.dur));
  const zoom = (cam.zoomFrom ?? 1) + ((cam.zoomTo ?? 1.08) - (cam.zoomFrom ?? 1)) * p;
  const fx = (cam.fx0 ?? 0.5) + ((cam.fx1 ?? cam.fx0 ?? 0.5) - (cam.fx0 ?? 0.5)) * p;
  const fy = (cam.fy0 ?? 0.5) + ((cam.fy1 ?? cam.fy0 ?? 0.5) - (cam.fy0 ?? 0.5)) * p;
  const drift = cam.drift ?? 4;
  const hx = Math.sin(t * 0.7) * drift + Math.sin(t * 1.9) * drift * 0.3 + (cam.dx ?? 0);
  const hy = Math.cos(t * 0.5) * drift * 0.6 + (cam.dy ?? 0);

  ctx.save();
  ctx.globalAlpha = alpha;
  const iw = img ? img.width : W, ih = img ? img.height : H;
  const cover = Math.max(W / iw, H / ih) * zoom * 1.02; // +2% để drift không lộ mép
  const dw = iw * cover, dh = ih * cover;
  // đưa điểm focus về giữa khung, kẹp để không lộ mép
  let x = W / 2 - fx * dw + hx;
  let y = H / 2 - fy * dh + hy;
  x = Math.min(0, Math.max(W - dw, x));
  y = Math.min(0, Math.max(H - dh, y));

  // "thở": kéo giãn dọc rất nhẹ, neo ở đáy khung → nhân vật như đang thở/nhún
  const breathe = 1 + 0.0045 * Math.sin(t * 1.7);
  ctx.translate(0, H);
  ctx.scale(1, breathe);
  ctx.translate(0, -H);

  if (img) ctx.drawImage(img, x, y, dw, dh);
  else drawPlaceholder(ctx, label, x, y, dw, dh, t);
  ctx.restore();
}

function drawPlaceholder(ctx: Ctx, label: string, x: number, y: number, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#c9dcd8");
  g.addColorStop(0.62, "#efe4cf");
  g.addColorStop(0.63, "#d8c7a6");
  g.addColorStop(1, "#b9a27c");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  // nhân vật phác (đầu tròn, áo xanh nhạt, quần tối, giày trắng)
  const cx = x + w * 0.62, base = y + h * 0.86, s = h / 1080;
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.ellipse(cx, base, 120 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2f2f2"; ctx.fillRect(cx - 52 * s, base - 22 * s, 44 * s, 20 * s); ctx.fillRect(cx + 8 * s, base - 22 * s, 44 * s, 20 * s);
  ctx.fillStyle = "#2b3245"; ctx.fillRect(cx - 46 * s, base - 260 * s, 40 * s, 240 * s); ctx.fillRect(cx + 6 * s, base - 260 * s, 40 * s, 240 * s);
  ctx.fillStyle = PALETTE.sky; roundRect(ctx, cx - 70 * s, base - 500 * s, 140 * s, 260 * s, 30 * s); ctx.fill();
  ctx.fillStyle = "#e8c4a0"; ctx.beginPath(); ctx.arc(cx, base - 570 * s, 62 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1b1b1f"; ctx.beginPath(); ctx.arc(cx, base - 590 * s, 64 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.fillStyle = "#1b1b1f";
  const blink = Math.sin(t * 2.3) > 0.97 ? 0.2 : 1;
  ctx.beginPath(); ctx.ellipse(cx - 22 * s, base - 568 * s, 6 * s, 8 * s * blink, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 22 * s, base - 568 * s, 6 * s, 8 * s * blink, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(29,36,48,0.35)";
  ctx.font = font(30, FONT.semi);
  ctx.textAlign = "left";
  ctx.fillText(`PLACEHOLDER · ${label}`, x + 40, y + 60);
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
