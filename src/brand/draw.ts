// Phần vẽ dùng chung cho bộ nhận diện: bóng đèn, ánh sáng, lấp lánh, chữ tên kênh có hiệu ứng.
import { FONT, font, type Ctx } from "../components/canvas.js";

export const BRAND = { ink: "#151515", paper: "#f6eedc", red: "#e0362c", yellow: "#ffd23f", yellowSoft: "#fff1a8", orange: "#ff7a45" };

/** tia sáng toả ra từ một điểm (nét mực ngắn, đầu tròn) */
export function burst(x: Ctx, cx: number, cy: number, r0: number, r1: number, n = 9, color = BRAND.ink, width = 8, start = 0, span = Math.PI * 2) {
  x.save(); x.strokeStyle = color; x.lineWidth = width; x.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const a = start + (n === 1 ? 0 : (i / (span >= Math.PI * 2 ? n : n - 1)) * span);
    const long = i % 2 === 0 ? 1 : 0.7;
    x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * (r0 + (r1 - r0) * long), cy + Math.sin(a) * (r0 + (r1 - r0) * long)); x.stroke();
  }
  x.restore();
}

/** ngôi sao 4 cánh lấp lánh */
export function sparkle(x: Ctx, cx: number, cy: number, r: number, fill = BRAND.yellow, outline = true, rot = 0) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.lineJoin = "round";
  x.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 === 0 ? r : r * 0.28;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    i === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
  }
  x.closePath();
  if (outline) { x.strokeStyle = BRAND.ink; x.lineWidth = Math.max(4, r * 0.22); x.stroke(); }
  x.fillStyle = fill; x.fill(); x.restore();
}

/** bóng đèn "ý tưởng": thuỷ tinh vàng, đuôi đèn có ren, dây tóc, vệt sáng; glow là quầng sáng phía sau */
export function bulb(x: Ctx, cx: number, cy: number, size: number, opts: { glow?: boolean; rays?: boolean; rot?: number } = {}) {
  const { glow = true, rays = true, rot = 0 } = opts;
  const r = size * 0.5;
  x.save(); x.translate(cx, cy); x.rotate(rot); x.lineJoin = "round"; x.lineCap = "round";
  if (glow) {
    const g = x.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.6);
    g.addColorStop(0, "rgba(255,226,102,0.75)"); g.addColorStop(0.45, "rgba(255,226,102,0.28)"); g.addColorStop(1, "rgba(255,226,102,0)");
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 2.6, 0, Math.PI * 2); x.fill();
  }
  if (rays) burst(x, 0, 0, r * 1.38, r * 1.9, 9, BRAND.ink, Math.max(5, size * 0.055), -Math.PI * 0.95, Math.PI * 0.9);
  // đuôi đèn
  const bw = r * 0.78, by = r * 0.78;
  x.fillStyle = "#cfc7b4"; x.strokeStyle = BRAND.ink; x.lineWidth = Math.max(5, size * 0.06);
  x.beginPath(); x.roundRect(-bw / 2, by, bw, r * 0.62, r * 0.14); x.fill(); x.stroke();
  x.lineWidth = Math.max(3, size * 0.035);
  for (const k of [0.2, 0.42]) { x.beginPath(); x.moveTo(-bw / 2 + 2, by + r * k * 1.1); x.lineTo(bw / 2 - 2, by + r * k * 1.1); x.stroke(); }
  // bầu thuỷ tinh (tròn, thon xuống cổ)
  x.beginPath(); x.moveTo(-bw * 0.46, by + 2);
  x.bezierCurveTo(-bw * 0.7, by - r * 0.35, -r, r * 0.25, -r, -r * 0.1);
  x.arc(0, -r * 0.1, r, Math.PI, 0, false);
  x.bezierCurveTo(r, r * 0.25, bw * 0.7, by - r * 0.35, bw * 0.46, by + 2);
  x.closePath();
  const gl = x.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
  gl.addColorStop(0, "#fffbd6"); gl.addColorStop(0.55, BRAND.yellowSoft); gl.addColorStop(1, BRAND.yellow);
  x.fillStyle = gl; x.fill(); x.lineWidth = Math.max(6, size * 0.07); x.strokeStyle = BRAND.ink; x.stroke();
  // dây tóc
  x.strokeStyle = BRAND.ink; x.lineWidth = Math.max(3.5, size * 0.04);
  x.beginPath(); x.moveTo(-r * 0.2, by - 2); x.lineTo(-r * 0.2, r * 0.18);
  x.quadraticCurveTo(-r * 0.3, -r * 0.1, -r * 0.1, -r * 0.1); x.quadraticCurveTo(0, -r * 0.3, r * 0.1, -r * 0.1);
  x.quadraticCurveTo(r * 0.3, -r * 0.1, r * 0.2, r * 0.18); x.lineTo(r * 0.2, by - 2); x.stroke();
  // vệt sáng
  x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = Math.max(4, size * 0.05);
  x.beginPath(); x.arc(0, -r * 0.1, r * 0.76, Math.PI * 1.12, Math.PI * 1.42); x.stroke();
  x.restore();
}

export interface WordmarkOpts {
  align?: "center" | "left";
  /** biên độ nhún của từng chữ (theo tỉ lệ cỡ chữ) */
  bounce?: number;
  /** độ nghiêng cả cụm (rad) */
  rot?: number;
  /** độ dày khối nổi phía sau */
  extrude?: number;
  /** cỡ viền */
  outline?: number;
  /** "hot": gradient vàng → đỏ (từ khoá/tên kênh); "white": trắng viền mực (chữ thường) */
  fill?: "hot" | "white";
}

/**
 * Chữ tên kênh: từng chữ nhún nhảy so le, gradient vàng → cam → đỏ, viền mực dày, khối nổi đổ bóng, vệt sáng trên đỉnh chữ.
 * Dùng Bangers (đủ dấu tiếng Việt, chỉ chữ in hoa).
 */
export function wordmark(x: Ctx, text: string, cx: number, baseY: number, size: number, o: WordmarkOpts = {}) {
  const { align = "center", bounce = 0.05, rot = -0.03, extrude = 0.07, outline = 0.2, fill = "hot" } = o;
  x.save(); x.translate(cx, baseY); x.rotate(rot);
  x.font = font(size, FONT.display); x.textBaseline = "alphabetic"; x.lineJoin = "round";
  const gap = size * 0.02;
  const ws = [...text].map((c) => x.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let px = align === "center" ? -total / 2 : 0;
  const glyphs = [...text].map((c, i) => {
    const gx = px + ws[i] / 2; px += ws[i] + gap;
    const dy = Math.sin(i * 1.5) * size * bounce, r = (i % 2 ? 1 : -1) * 0.045 + Math.sin(i) * 0.02;
    return { c, gx, dy, r };
  });
  const draw = (fn: (c: string) => void, extra?: (g: { gx: number; dy: number; r: number }) => void) => {
    for (const g of glyphs) { if (g.c === " ") continue; x.save(); x.translate(g.gx, g.dy); x.rotate(g.r); extra?.(g); x.textAlign = "center"; fn(g.c); x.restore(); }
  };
  // 1) khối nổi: lặp viền mực dịch xuống phải
  const steps = Math.max(2, Math.round(size * extrude));
  x.strokeStyle = BRAND.ink; x.lineWidth = size * outline;
  for (let s = steps; s >= 1; s--) draw((c) => x.strokeText(c, s * 0.9, s * 1.0));
  // 2) viền mực
  draw((c) => x.strokeText(c, 0, 0));
  // 3) tô gradient (toạ độ cục bộ của từng chữ)
  draw((c) => {
    const g = x.createLinearGradient(0, -size * 0.82, 0, size * 0.04);
    if (fill === "white") { g.addColorStop(0, "#ffffff"); g.addColorStop(0.6, "#fbf6ea"); g.addColorStop(1, "#e4dac2"); }
    else { g.addColorStop(0, "#fff2a0"); g.addColorStop(0.3, BRAND.yellow); g.addColorStop(0.58, BRAND.orange); g.addColorStop(1, "#d9281f"); }
    x.fillStyle = g; x.fillText(c, 0, 0);
  });
  // 4) vệt sáng mỏng trên đỉnh chữ
  draw((c) => { x.strokeStyle = "rgba(255,255,255,0.55)"; x.lineWidth = size * 0.035; x.lineCap = "round"; x.beginPath(); x.moveTo(-ws[0] * 0.28, -size * 0.7); x.lineTo(ws[0] * 0.08, -size * 0.74); x.stroke(); });
  x.restore();
  return total;
}

/** nhãn bo tròn (Baloo) */
export function chip(x: Ctx, label: string, px: number, py: number, size: number, fill = BRAND.ink, color = BRAND.paper) {
  x.font = font(size, FONT.round); const w = x.measureText(label).width + size * 1.1, h = size * 1.6;
  x.fillStyle = fill; x.beginPath(); x.roundRect(px, py, w, h, h * 0.3); x.fill();
  x.fillStyle = color; x.textAlign = "left"; x.textBaseline = "middle"; x.fillText(label, px + size * 0.55, py + h * 0.54); x.textBaseline = "alphabetic";
  return w;
}
