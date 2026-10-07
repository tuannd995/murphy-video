// Scene 10 — Outro kênh: "video vẫn chạy", like, "vô dụng = thương hiệu", nút đăng ký bị glitch, end card.
import { roundRect } from "../components/backdrop.js";
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust, fadeBlack, glitch } from "../components/fx.js";
import { at, brain, check } from "../components/icons.js";
import { pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, easeOutCubic, prog, rng, shake } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene10: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const bug = cap(3) + 2.9;
  const sh = shake(t, bug, 0.5, 10);
  shotLayer(ctx, t, s, { cams: { "s09-calm": { zoomFrom: 1.0, zoomTo: 1.08, fx0: 0.55, fx1: 0.62 } }, offset: () => sh });
  dust(ctx, t, 0.45);

  // "Ơ... video vẫn chạy kìa"
  if (t < cap(1)) pill(ctx, "Murphy: đang nghỉ phép", 520, 200, { size: 40, fill: PALETTE.teal, scale: pop(t, cap(0) + 2.0) });

  // nút like + tim bay
  const la = appear(t, cap(1) + 2.2, cap(3) - 0.2);
  if (la > 0) {
    const sc = pop(t, cap(1) + 2.4, 0.5);
    ctx.save(); ctx.globalAlpha = la; ctx.translate(420, 330); ctx.scale(sc, sc);
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 24;
    ctx.fillStyle = PALETTE.paper; roundRect(ctx, -170, -60, 340, 120, 60); ctx.fill();
    ctx.shadowColor = "transparent";
    text(ctx, "LIKE", 30, 18, { size: 54, family: FONT.xbold, color: PALETTE.ink, align: "center" });
    // ngón cái vector đơn giản
    ctx.fillStyle = PALETTE.coral; roundRect(ctx, -130, -10, 30, 50, 6); ctx.fill(); roundRect(ctx, -96, -24, 52, 64, 14); ctx.fill(); roundRect(ctx, -84, -52, 22, 40, 10); ctx.fill();
    ctx.restore();
    const r = rng(3);
    for (let i = 0; i < 6; i++) {
      const st = cap(1) + 2.5 + i * 0.15, p = prog(t, st, 1.6);
      if (p <= 0 || p >= 1) continue;
      const x = 420 + (r() - 0.5) * 200 + Math.sin(p * 6 + i) * 20, y = 280 - easeOutCubic(p) * 240;
      ctx.save(); ctx.globalAlpha = la * (1 - p); ctx.fillStyle = PALETTE.coral;
      ctx.beginPath(); ctx.arc(x - 9, y, 11, 0, Math.PI * 2); ctx.arc(x + 9, y, 11, 0, Math.PI * 2); ctx.moveTo(x - 20, y + 4); ctx.lineTo(x, y + 26); ctx.lineTo(x + 20, y + 4); ctx.fill();
      ctx.restore();
    }
  }
  // "vô dụng = thương hiệu"
  if (t > cap(2) + 1.9 && t < cap(3) + 0.2) {
    const sc = pop(t, cap(2) + 2.0);
    pill(ctx, "Vô dụng", 360, 520, { size: 40, fill: PALETTE.ink, scale: sc });
    at(ctx, { x: 520, y: 520, size: 60, scale: sc }, (z) => check(ctx, z));
    text(ctx, "(thương hiệu đã đăng ký)", 420, 600, { size: 28, family: FONT.med, color: PALETTE.paper, align: "center", alpha: sc > 0 ? 1 : 0, shadow: true });
  }

  // nút ĐĂNG KÝ — đúng chữ "bị lỗi" thì glitch rồi tự hồi
  const sa = appear(t, cap(3) + 0.3, cap(4) + 0.4);
  if (sa > 0) {
    const sc = pop(t, cap(3) + 0.5, 0.5);
    const broken = t > bug && t < bug + 1.0;
    ctx.save(); ctx.globalAlpha = sa; ctx.translate(560 + (broken ? sh.x * 2 : 0), 420); ctx.scale(sc, sc); ctx.rotate(broken ? 0.08 * Math.sin(t * 40) : 0);
    ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 24;
    ctx.fillStyle = broken ? "#7a7f88" : "#e0362c"; roundRect(ctx, -240, -62, 480, 124, 22); ctx.fill();
    ctx.shadowColor = "transparent";
    text(ctx, broken ? "ĐĂNG...LỖI" : "ĐĂNG KÝ", 0, 20, { size: 58, family: FONT.xbold, color: "#fff", align: "center" });
    ctx.restore();
  }
  if (t > bug && t < bug + 0.6) glitch(ctx, t, 1 - prog(t, bug, 0.6));

  // end card
  const ea = appear(t, cap(4) + 0.3, s.scene.duration + 1, 0.5);
  if (ea > 0) {
    fadeBlack(ctx, 0.55 * ea);
    at(ctx, { x: 960, y: 330, size: 180, scale: pop(t, cap(4) + 0.3), alpha: ea }, (z) => { ctx.scale(1.4, 0.55); brain(ctx, z); });
    text(ctx, "NÃO PHẲNG", 960, 520, { size: 120, family: FONT.xbold, align: "center", color: PALETTE.paper, alpha: ea, shadow: true });
    text(ctx, "Hẹn gặp lại trong một kiến thức nguội ngắt khác", 960, 590, { size: 36, family: FONT.semi, align: "center", color: PALETTE.ochre, alpha: ea * appear(t, cap(4) + 1.2) });
  }
  fadeBlack(ctx, prog(t, s.scene.duration - 1.6, 1.4));
};
