// Scene 3 — Bánh mì phết bơ: bánh trượt khỏi mép bàn, xoay nửa vòng, úp bơ, nảy; quỹ đạo + nhãn giải thích.
import { roundRect } from "../components/backdrop.js";
import type { Ctx, SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust } from "../components/fx.js";
import { at, brain, bread } from "../components/icons.js";
import { panel, pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, clamp, easeInOutCubic, easeOutBounce, prog, shake } from "../utils/anim.js";
import { shotLayer } from "./common.js";

/** trạng thái lát bánh tại thời điểm u (giây kể từ lúc bắt đầu trượt), trong hệ toạ độ panel */
function breadState(u: number) {
  const edgeX = 250, tableY = 150, floorY = 520;
  if (u < 0) return { x: 150, y: tableY, rot: 0, squash: 1, landed: false };
  if (u < 0.5) { const p = easeInOutCubic(u / 0.5); return { x: 150 + p * 110, y: tableY, rot: p * 0.25, squash: 1, landed: false }; }
  const fall = 0.85;
  if (u < 0.5 + fall) {
    const p = (u - 0.5) / fall;
    return { x: edgeX + 10 + p * 120, y: tableY + (floorY - tableY) * p * p, rot: 0.25 + p * (Math.PI - 0.25), squash: 1, landed: false };
  }
  const b = clamp((u - 0.5 - fall) / 0.6);
  const bounce = (1 - easeOutBounce(b)) * 40;
  return { x: edgeX + 130, y: floorY - bounce, rot: Math.PI, squash: 1 - 0.25 * Math.max(0, 1 - b * 4), landed: true };
}

function breadPanel(ctx: Ctx, t: number, start: number, alpha: number, showPath: boolean, slow: number, cam: number) {
  const ox = 1050, oy = 110, w = 760, h = 640;
  panel(ctx, ox, oy, w, h, { alpha, fill: "rgba(244,239,230,0.95)" });
  ctx.save();
  ctx.globalAlpha *= alpha;
  roundRect(ctx, ox, oy, w, h, 28); ctx.clip();
  // camera theo bánh: tilt xuống khi bánh rơi
  ctx.translate(ox + 40, oy + 40 - cam * 60);
  // bàn + sàn
  ctx.fillStyle = "#c79a64"; ctx.fillRect(-40, 170, 300, 26);
  ctx.fillStyle = "#a77b4b"; ctx.fillRect(200, 196, 24, 360);
  ctx.fillStyle = "#d9c7a7"; ctx.fillRect(-40, 548, 900, 200);
  ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 2;
  for (let x = -40; x < 860; x += 90) { ctx.beginPath(); ctx.moveTo(x, 548); ctx.lineTo(x - 40, 760); ctx.stroke(); }

  if (showPath) {
    ctx.save();
    ctx.setLineDash([12, 12]); ctx.strokeStyle = PALETTE.teal; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let u = 0.5; u <= 1.35; u += 0.02) { const st = breadState(u); u === 0.5 ? ctx.moveTo(st.x, st.y) : ctx.lineTo(st.x, st.y); }
    ctx.stroke();
    ctx.restore();
    // thước đo độ cao
    ctx.strokeStyle = PALETTE.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(520, 160); ctx.lineTo(520, 540); ctx.moveTo(500, 160); ctx.lineTo(540, 160); ctx.moveTo(500, 540); ctx.lineTo(540, 540); ctx.stroke();
    text(ctx, "~75 cm", 545, 360, { size: 36, family: FONT.bold, color: PALETTE.ink });
  }

  const u = (t - start) * slow;
  const st = breadState(u);
  if (st.landed) {
    // vệt bơ
    ctx.fillStyle = "rgba(255,216,74,0.8)";
    ctx.beginPath(); ctx.ellipse(st.x, 556, 90, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save();
  ctx.translate(st.x, st.y);
  ctx.rotate(st.rot);
  ctx.scale(1 / Math.sqrt(st.squash), st.squash);
  bread(ctx, 180);
  ctx.restore();
  ctx.restore();
}

export const scene03: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const impact = cap(1) + 1.4;
  const sh = shake(t, impact, 0.45, 10);
  shotLayer(ctx, t, s, {
    cams: { "s03-kitchen": { zoomFrom: 1.0, zoomTo: 1.07, fx0: 0.45, fx1: 0.35, fy0: 0.5, fy1: 0.55 } },
    offset: () => sh,
  });
  dust(ctx, t, 0.25);

  // lần rơi 1 (thật) → lần 2 phát lại chậm, có quỹ đạo
  const replay = t >= cap(3) + 0.3;
  const pa = appear(t, cap(0) + 0.3, cap(5) - 0.2);
  if (pa > 0) {
    const start = replay ? cap(3) + 0.9 : impact - 1.35;
    const slow = replay ? 0.55 : 1;
    const camTilt = clamp(((t - start) * slow - 0.5) / 0.85);
    breadPanel(ctx, t, start, pa, replay, slow, replay ? 0 : easeInOutCubic(camTilt));
  }
  if (t > cap(2) && t < cap(3) + 0.3) pill(ctx, "Vũ trụ trêu bạn?", 1430, 820 - 40, { size: 36, fill: PALETTE.coral, scale: pop(t, cap(2) + 0.1) });
  if (t > cap(4) && t < cap(5) - 0.2) {
    pill(ctx, "≈ ½ vòng trước khi chạm đất", 1430, 70 + 20, { size: 32, fill: PALETTE.teal, scale: pop(t, cap(4) + 0.6) });
  }

  // tâm lý: nhớ lần úp bơ, quên lần may mắn
  const ma = appear(t, cap(5) - 0.1, s.scene.duration + 1);
  if (ma > 0) {
    at(ctx, { x: 1180, y: 300, size: 170, scale: pop(t, cap(5)) }, (sz) => brain(ctx, sz));
    const big = 1 + 0.08 * Math.sin(t * 3);
    pill(ctx, "Úp bơ → nhớ mãi", 1480, 250, { size: 44 * big, fill: PALETTE.red, scale: pop(t, cap(5) + 0.5) });
    const fade = 1 - 0.75 * prog(t, cap(5) + 2.2, 1.5);
    pill(ctx, "Ngửa bơ → quên ngay", 1480, 380, { size: 30, fill: PALETTE.tealSoft, color: PALETTE.ink, scale: pop(t, cap(5) + 1.3) * (0.7 + 0.3 * fade), alpha: fade });
  }
};
