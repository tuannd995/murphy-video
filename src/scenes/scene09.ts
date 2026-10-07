// Scene 9 — Kết luận: bình yên, câu chốt, cú "glitch" hài, fade to black.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust, fadeBlack, glitch } from "../components/fx.js";
import { at, check } from "../components/icons.js";
import { panel, pill, pop, quote, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, prog, shake } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene09: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const gl = cap(4) - 0.2;
  const sh = shake(t, gl, 0.6, 16);
  shotLayer(ctx, t, s, {
    cams: { "s09-calm": { zoomFrom: 1.12, zoomTo: 1.0, fx0: 0.62, fx1: 0.55, ease: (x) => 1 - Math.pow(1 - x, 2) } },
    offset: () => sh,
  });
  dust(ctx, t, 0.55);

  const qa = appear(t, cap(1), cap(3) + 0.2);
  if (qa > 0) {
    ctx.save(); ctx.globalAlpha = qa;
    panel(ctx, 90, 170, 860, 300, { fill: "rgba(24,32,44,0.6)" });
    quote(ctx, ["Nếu điều gì có thể sai,", "hãy chuẩn bị cho nó."], 130, 260, t, cap(1) + 0.3, { size: 70, color: PALETTE.paper, stagger: 0.9 });
    text(ctx, "If it can go wrong, prepare for it.", 132, 430, { size: 34, family: FONT.med, color: "#f2d38a", alpha: appear(t, cap(1) + 1.6), shadow: true });
    ctx.restore();
  }
  if (t > cap(2) && t < cap(3) + 0.3) {
    ["Bình tĩnh", "Kế hoạch", "Plan B"].forEach((l, i) => {
      const sc = pop(t, cap(2) + 0.3 + i * 0.6);
      pill(ctx, l, 230 + i * 270, 560, { size: 34, fill: PALETTE.teal, scale: sc });
      at(ctx, { x: 120 + i * 270, y: 560, size: 50, scale: sc }, (z) => check(ctx, z));
    });
  }
  if (t > cap(3) + 0.3 && t < gl) {
    panel(ctx, 90, 220, 760, 200, { fill: "rgba(24,32,44,0.6)", alpha: appear(t, cap(3) + 0.3) });
    text(ctx, "Video này hoàn hảo.", 130, 300, { size: 64, family: FONT.xbold, color: PALETTE.paper, alpha: appear(t, cap(3) + 0.3), shadow: true });
    text(ctx, "Không thể nào lỗi được.", 130, 380, { size: 44, family: FONT.semi, color: PALETTE.paper, alpha: appear(t, cap(3) + 1.0), shadow: true });
  }

  // cú glitch + màn kết
  const g = 1 - Math.abs(prog(t, gl, 0.7) * 2 - 1);
  if (t > gl && t < gl + 0.7) glitch(ctx, t, g * 1.2);
  const end = prog(t, gl + 0.45, 0.25);
  if (end > 0) {
    fadeBlack(ctx, 0.88 * end);
    const sc = 0.9 + 0.1 * pop(t, gl + 0.5, 0.5);
    ctx.save(); ctx.translate(960, 420); ctx.scale(sc, sc);
    text(ctx, "…hãy nhớ Murphy.", 0, 0, { size: 84, family: FONT.xbold, align: "center", color: PALETTE.paper, alpha: end });
    text(ctx, "MURPHY'S LAW", 0, 90, { size: 40, family: FONT.bold, align: "center", color: PALETTE.ochre, alpha: end });
    ctx.restore();
    if (t > gl + 1.6 && Math.floor(t * 3) % 5 === 0) glitch(ctx, t, 0.3); // dư chấn nhỏ
  }
  // fade to black dài ở cuối video
  fadeBlack(ctx, prog(t, s.scene.duration - 1.6, 1.4));
};
