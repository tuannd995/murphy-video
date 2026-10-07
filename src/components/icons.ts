// Icon vector vẽ bằng canvas, toạ độ quanh (0,0), kích thước ~ size. Không cần tạo ảnh AI cho icon.
import { PALETTE } from "../config/style.js";
import { roundRect } from "./backdrop.js";
import { FONT, font, type Ctx } from "./canvas.js";

const TAU = Math.PI * 2;

export interface IconOpts {
  x: number; y: number; size?: number; rot?: number; alpha?: number; scale?: number;
}

/** đặt gốc toạ độ + scale cho icon, gọi draw rồi restore */
export function at(ctx: Ctx, o: IconOpts, draw: (s: number) => void) {
  if ((o.alpha ?? 1) <= 0.001 || (o.scale ?? 1) <= 0.001) return;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot ?? 0);
  const sc = o.scale ?? 1;
  ctx.scale(sc, sc);
  ctx.globalAlpha *= o.alpha ?? 1;
  draw(o.size ?? 100);
  ctx.restore();
}

/** đĩa tròn nền cho icon (badge) */
export function badge(ctx: Ctx, s: number, fill: string, stroke = "rgba(0,0,0,0.12)") {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = s * 0.18;
  ctx.shadowOffsetY = s * 0.06;
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = stroke; ctx.lineWidth = s * 0.03;
  ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, TAU); ctx.stroke();
}

export function clock(ctx: Ctx, s: number, hours: number) {
  badge(ctx, s, PALETTE.paper);
  ctx.strokeStyle = PALETTE.ink; ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.lineWidth = s * 0.025;
    ctx.beginPath(); ctx.moveTo(Math.sin(a) * s * 0.38, -Math.cos(a) * s * 0.38); ctx.lineTo(Math.sin(a) * s * 0.43, -Math.cos(a) * s * 0.43); ctx.stroke();
  }
  const hA = (hours / 12) * TAU, mA = (hours % 1) * TAU;
  ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(hA) * s * 0.22, -Math.cos(hA) * s * 0.22); ctx.stroke();
  ctx.lineWidth = s * 0.04; ctx.strokeStyle = PALETTE.coral; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(mA) * s * 0.34, -Math.cos(mA) * s * 0.34); ctx.stroke();
  ctx.fillStyle = PALETTE.ink; ctx.beginPath(); ctx.arc(0, 0, s * 0.04, 0, TAU); ctx.fill();
}

export function check(ctx: Ctx, s: number, progress = 1, color = PALETTE.green) {
  badge(ctx, s, color, "rgba(255,255,255,0.3)");
  ctx.strokeStyle = "#fff"; ctx.lineWidth = s * 0.12; ctx.lineCap = "round"; ctx.lineJoin = "round";
  const pts: [number, number][] = [[-0.22, 0.02], [-0.06, 0.18], [0.24, -0.16]];
  ctx.beginPath(); ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
  const p1 = Math.min(1, progress * 2), p2 = Math.max(0, progress * 2 - 1);
  ctx.lineTo((pts[0][0] + (pts[1][0] - pts[0][0]) * p1) * s, (pts[0][1] + (pts[1][1] - pts[0][1]) * p1) * s);
  if (p2 > 0) ctx.lineTo((pts[1][0] + (pts[2][0] - pts[1][0]) * p2) * s, (pts[1][1] + (pts[2][1] - pts[1][1]) * p2) * s);
  ctx.stroke();
}

export function cross(ctx: Ctx, s: number) {
  badge(ctx, s, PALETTE.red, "rgba(255,255,255,0.3)");
  ctx.strokeStyle = "#fff"; ctx.lineWidth = s * 0.12; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-s * 0.17, -s * 0.17); ctx.lineTo(s * 0.17, s * 0.17); ctx.moveTo(s * 0.17, -s * 0.17); ctx.lineTo(-s * 0.17, s * 0.17); ctx.stroke();
}

export function warning(ctx: Ctx, s: number, color = PALETTE.ochre) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = s * 0.15; ctx.shadowOffsetY = s * 0.05;
  ctx.fillStyle = color; ctx.lineJoin = "round"; ctx.strokeStyle = color; ctx.lineWidth = s * 0.12;
  ctx.beginPath(); ctx.moveTo(0, -s * 0.42); ctx.lineTo(s * 0.46, s * 0.36); ctx.lineTo(-s * 0.46, s * 0.36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = PALETTE.ink; ctx.font = font(s * 0.5, FONT.xbold); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("!", 0, s * 0.05);
}

export function exclaim(ctx: Ctx, s: number) {
  ctx.fillStyle = PALETTE.coral; ctx.strokeStyle = "#fff"; ctx.lineWidth = s * 0.06;
  ctx.font = font(s, FONT.xbold); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.strokeText("!", 0, 0); ctx.fillText("!", 0, 0);
}

export function wifi(ctx: Ctx, s: number, bars: number, color = PALETTE.paper) {
  badge(ctx, s, PALETTE.teal);
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const on = bars > i;
    ctx.strokeStyle = on ? color : "rgba(255,255,255,0.18)";
    ctx.lineWidth = s * 0.07;
    const r = s * (0.13 + i * 0.1);
    ctx.beginPath(); ctx.arc(0, s * 0.16, r, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
  }
  ctx.fillStyle = bars > 0 ? color : "rgba(255,255,255,0.18)";
  ctx.beginPath(); ctx.arc(0, s * 0.16, s * 0.045, 0, TAU); ctx.fill();
}

export function battery(ctx: Ctx, s: number, level: number, blink = false) {
  const w = s, h = s * 0.48;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = s * 0.12;
  ctx.fillStyle = PALETTE.night; roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = PALETTE.paper; ctx.lineWidth = s * 0.04; roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.2); ctx.stroke();
  ctx.fillStyle = PALETTE.paper; roundRect(ctx, w / 2 + s * 0.01, -h * 0.2, s * 0.06, h * 0.4, s * 0.02); ctx.fill();
  const c = level > 0.5 ? PALETTE.green : level > 0.2 ? PALETTE.ochre : PALETTE.red;
  if (!blink) {
    ctx.fillStyle = c;
    roundRect(ctx, -w / 2 + s * 0.06, -h / 2 + s * 0.06, Math.max(s * 0.02, (w - s * 0.12) * level), h - s * 0.12, h * 0.12); ctx.fill();
  }
  ctx.fillStyle = "#fff"; ctx.font = font(s * 0.22, FONT.xbold); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`${Math.max(1, Math.round(level * 100))}%`, 0, h * 0.85 + s * 0.05);
}

export function trafficLight(ctx: Ctx, s: number, state: "green" | "yellow" | "red") {
  const w = s * 0.42, h = s * 1.1;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = s * 0.15;
  ctx.fillStyle = "#2a2f38"; roundRect(ctx, -w / 2, -h / 2, w, h, w * 0.3); ctx.fill(); ctx.restore();
  const lights: [string, string][] = [["red", "#ff4d3d"], ["yellow", "#ffc23d"], ["green", "#38d47a"]];
  lights.forEach(([k, col], i) => {
    const y = -h / 2 + h * (0.2 + i * 0.3);
    const on = k === state;
    ctx.save();
    if (on) { ctx.shadowColor = col; ctx.shadowBlur = s * 0.35; }
    ctx.fillStyle = on ? col : "rgba(255,255,255,0.1)";
    ctx.beginPath(); ctx.arc(0, y, w * 0.32, 0, TAU); ctx.fill();
    ctx.restore();
  });
}

export function umbrella(ctx: Ctx, s: number, open = 1, color = PALETTE.coral) {
  ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = s * 0.04; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -s * 0.3); ctx.lineTo(0, s * 0.38); ctx.arc(-s * 0.08, s * 0.38, s * 0.08, 0, Math.PI); ctx.stroke();
  const r = s * 0.45 * (0.3 + 0.7 * open);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-r, -s * 0.2);
  ctx.quadraticCurveTo(0, -s * 0.2 - r * 1.1, r, -s * 0.2);
  for (let i = 3; i >= 0; i--) ctx.quadraticCurveTo(-r + (r / 2) * (i + 0.5), -s * 0.27, -r + (r / 2) * i, -s * 0.2);
  ctx.closePath(); ctx.fill();
}

export function sun(ctx: Ctx, s: number, t: number) {
  ctx.save(); ctx.rotate(t * 0.4);
  ctx.strokeStyle = PALETTE.ochre; ctx.lineWidth = s * 0.06; ctx.lineCap = "round";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32); ctx.lineTo(Math.cos(a) * s * 0.46, Math.sin(a) * s * 0.46); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#f6c453"; ctx.beginPath(); ctx.arc(0, 0, s * 0.24, 0, TAU); ctx.fill();
}

export function cloud(ctx: Ctx, s: number, color = "#e8edf2") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(-s * 0.2, s * 0.05, s * 0.18, 0, TAU);
  ctx.arc(s * 0.02, -s * 0.06, s * 0.24, 0, TAU);
  ctx.arc(s * 0.24, s * 0.06, s * 0.16, 0, TAU);
  ctx.fill();
  roundRect(ctx, -s * 0.38, s * 0.02, s * 0.76, s * 0.2, s * 0.1); ctx.fill();
}

export function bread(ctx: Ctx, s: number) {
  // lát bánh nhìn nghiêng-phẳng: crust + ruột; mặt bơ ở phía "trên" (y âm)
  const w = s, h = s * 0.18;
  ctx.fillStyle = "#b8743a"; roundRect(ctx, -w / 2, -h / 2, w, h, h * 0.45); ctx.fill();
  ctx.fillStyle = "#f3d9a4"; roundRect(ctx, -w / 2 + s * 0.04, -h / 2 + s * 0.03, w - s * 0.08, h - s * 0.06, h * 0.3); ctx.fill();
  ctx.fillStyle = "#ffd84a"; // lớp bơ
  roundRect(ctx, -w / 2 + s * 0.05, -h / 2 - s * 0.035, w - s * 0.1, s * 0.06, s * 0.03); ctx.fill();
  ctx.fillStyle = "#fff3a8"; roundRect(ctx, -w * 0.2, -h / 2 - s * 0.03, w * 0.2, s * 0.02, s * 0.01); ctx.fill();
}

export function usbPlug(ctx: Ctx, s: number, flipped = 0) {
  // nhìn từ trên, đầu cắm hướng sang phải. flipped: 0..1 (xoay 180° quanh trục dọc thân → co theo cos)
  const sy = Math.cos(flipped * Math.PI);
  ctx.save();
  ctx.scale(1, Math.abs(sy) < 0.04 ? 0.04 : Math.abs(sy));
  ctx.fillStyle = "#3d4656"; roundRect(ctx, -s * 0.5, -s * 0.16, s * 0.6, s * 0.32, s * 0.06); ctx.fill();
  ctx.fillStyle = "#c9ced6"; ctx.fillRect(s * 0.1, -s * 0.12, s * 0.38, s * 0.24);
  // mặt có lỗ: chỉ thấy khi sy > 0
  ctx.fillStyle = sy > 0 ? "#3d4656" : "#aab1bc";
  if (sy > 0) { ctx.fillRect(s * 0.2, -s * 0.07, s * 0.07, s * 0.05); ctx.fillRect(s * 0.33, -s * 0.07, s * 0.07, s * 0.05); }
  else { ctx.fillRect(s * 0.14, -s * 0.02, s * 0.3, s * 0.04); }
  ctx.fillStyle = PALETTE.paper; ctx.font = font(s * 0.12, FONT.xbold); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (sy > 0) ctx.fillText("USB", -s * 0.2, 0);
  ctx.restore();
}

export function usbPort(ctx: Ctx, s: number) {
  ctx.fillStyle = "#a9b0bb"; roundRect(ctx, -s * 0.05, -s * 0.36, s * 0.7, s * 0.72, s * 0.08); ctx.fill();
  ctx.fillStyle = "#1c2028"; ctx.fillRect(0, -s * 0.15, s * 0.45, s * 0.3);
  ctx.fillStyle = "#5c6573"; ctx.fillRect(0, -s * 0.15, s * 0.45, s * 0.12);
}

export function bug(ctx: Ctx, s: number) {
  badge(ctx, s, PALETTE.red);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff"; ctx.lineWidth = s * 0.04; ctx.lineCap = "round";
  ctx.beginPath(); ctx.ellipse(0, s * 0.04, s * 0.13, s * 0.18, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -s * 0.15, s * 0.07, 0, TAU); ctx.fill();
  for (const y of [-0.04, 0.05, 0.14]) {
    ctx.beginPath(); ctx.moveTo(-s * 0.12, y * s); ctx.lineTo(-s * 0.24, (y - 0.04) * s); ctx.moveTo(s * 0.12, y * s); ctx.lineTo(s * 0.24, (y - 0.04) * s); ctx.stroke();
  }
}

export function key(ctx: Ctx, s: number) {
  badge(ctx, s, PALETTE.ochre);
  ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = s * 0.07; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-s * 0.12, 0, s * 0.1, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.02, 0); ctx.lineTo(s * 0.24, 0); ctx.moveTo(s * 0.16, 0); ctx.lineTo(s * 0.16, s * 0.08); ctx.moveTo(s * 0.23, 0); ctx.lineTo(s * 0.23, s * 0.08); ctx.stroke();
}

export function rainCloud(ctx: Ctx, s: number) {
  badge(ctx, s, "#5b7da0");
  cloud(ctx, s * 0.7);
  ctx.strokeStyle = "#cfe3ff"; ctx.lineWidth = s * 0.04; ctx.lineCap = "round";
  for (const x of [-0.12, 0, 0.12]) { ctx.beginPath(); ctx.moveTo(x * s, s * 0.17); ctx.lineTo((x - 0.04) * s, s * 0.3); ctx.stroke(); }
}

export function emojiBadge(ctx: Ctx, s: number, fill: string, label: string, color = "#fff") {
  badge(ctx, s, fill);
  ctx.fillStyle = color; ctx.font = font(s * 0.34, FONT.xbold); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, 0, s * 0.02);
}

export function database(ctx: Ctx, s: number, color = PALETTE.tealSoft) {
  ctx.fillStyle = color; ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = s * 0.03;
  const w = s * 0.5, h = s * 0.62;
  ctx.beginPath(); ctx.ellipse(0, h / 2 - s * 0.05, w / 2, s * 0.09, 0, 0, Math.PI); ctx.lineTo(-w / 2, -h / 2 + s * 0.05); ctx.ellipse(0, -h / 2 + s * 0.05, w / 2, s * 0.09, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const y of [-0.05, 0.12]) { ctx.beginPath(); ctx.ellipse(0, y * s, w / 2, s * 0.09, 0, 0, Math.PI); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -h / 2 + s * 0.05, w / 2, s * 0.09, 0, 0, TAU); ctx.stroke();
}

export function powerBank(ctx: Ctx, s: number) {
  ctx.fillStyle = "#3a4a5e"; roundRect(ctx, -s * 0.22, -s * 0.36, s * 0.44, s * 0.72, s * 0.08); ctx.fill();
  ctx.fillStyle = PALETTE.green; for (let i = 0; i < 4; i++) { ctx.fillRect(-s * 0.1, s * 0.2 - i * s * 0.12, s * 0.2, s * 0.08); }
  ctx.fillStyle = PALETTE.ochre; ctx.beginPath(); ctx.moveTo(s * 0.03, -s * 0.3); ctx.lineTo(-s * 0.08, -s * 0.16); ctx.lineTo(0, -s * 0.16); ctx.lineTo(-s * 0.04, -s * 0.05); ctx.lineTo(s * 0.08, -s * 0.2); ctx.lineTo(0, -s * 0.2); ctx.closePath(); ctx.fill();
}

export function backupCloud(ctx: Ctx, s: number) {
  cloud(ctx, s * 0.9, "#dbe8f5");
  ctx.strokeStyle = PALETTE.teal; ctx.lineWidth = s * 0.06; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(0, s * 0.16); ctx.lineTo(0, -s * 0.06); ctx.moveTo(-s * 0.08, s * 0.02); ctx.lineTo(0, -s * 0.07); ctx.lineTo(s * 0.08, s * 0.02); ctx.stroke();
}

export function flask(ctx: Ctx, s: number) {
  ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = s * 0.04; ctx.lineJoin = "round";
  ctx.fillStyle = "#e9f3f1";
  ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.34); ctx.lineTo(-s * 0.08, -s * 0.08); ctx.lineTo(-s * 0.28, s * 0.3); ctx.lineTo(s * 0.28, s * 0.3); ctx.lineTo(s * 0.08, -s * 0.08); ctx.lineTo(s * 0.08, -s * 0.34); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PALETTE.green; ctx.beginPath(); ctx.moveTo(-s * 0.17, s * 0.1); ctx.lineTo(s * 0.17, s * 0.1); ctx.lineTo(s * 0.26, s * 0.28); ctx.lineTo(-s * 0.26, s * 0.28); ctx.closePath(); ctx.fill();
}

export function brain(ctx: Ctx, s: number) {
  badge(ctx, s, "#f0b7c0");
  ctx.strokeStyle = "#a1505f"; ctx.lineWidth = s * 0.035; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -s * 0.28); ctx.lineTo(0, s * 0.28); ctx.stroke();
  for (const sgn of [-1, 1]) for (const y of [-0.14, 0.02, 0.17]) {
    ctx.beginPath(); ctx.arc(sgn * s * 0.12, y * s, s * 0.08, sgn > 0 ? -Math.PI / 2 : Math.PI / 2, sgn > 0 ? Math.PI / 2 : Math.PI * 1.5); ctx.stroke();
  }
}

export function plane(ctx: Ctx, s: number, color = "#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(s * 0.32, 0); ctx.lineTo(-s * 0.26, -s * 0.05); ctx.lineTo(-s * 0.34, -s * 0.16); ctx.lineTo(-s * 0.38, -s * 0.16); ctx.lineTo(-s * 0.32, 0);
  ctx.lineTo(-s * 0.38, s * 0.16); ctx.lineTo(-s * 0.34, s * 0.16); ctx.lineTo(-s * 0.26, s * 0.05); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(s * 0.02, 0); ctx.lineTo(-s * 0.12, -s * 0.3); ctx.lineTo(-s * 0.04, -s * 0.3); ctx.lineTo(s * 0.12, 0); ctx.lineTo(-s * 0.04, s * 0.3); ctx.lineTo(-s * 0.12, s * 0.3); ctx.closePath(); ctx.fill();
}
