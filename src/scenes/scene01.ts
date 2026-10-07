// Scene 1 — Hook: buổi sáng hoàn hảo → mưa, xe không nổ, mất chìa khóa → giới thiệu Murphy's Law.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust, rain } from "../components/fx.js";
import { at, check, clock, exclaim, key } from "../components/icons.js";
import { panel, pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, easeInCubic, prog, shake, tween } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene01: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const crank = cap(4) + 2.2;
  const sh = shake(t, crank, 0.7, 12);
  const sh2 = shake(t, cap(5) + 0.9, 0.4, 8, 3);

  shotLayer(ctx, t, s, {
    cams: {
      "s01a-morning": { zoomFrom: 1.0, zoomTo: 1.08, fx0: 0.5, fx1: 0.4, fy0: 0.5, fy1: 0.45 },
      "s01b-rain-scooter": { zoomFrom: 1.04, zoomTo: 1.14, fx0: 0.5, fx1: 0.42, fy0: 0.55, fy1: 0.5 },
    },
    offset: () => ({ x: sh.x + sh2.x, y: sh.y + sh2.y }),
  });

  // nắng sớm
  if (t < cap(4)) dust(ctx, t, 0.35 * (1 - prog(t, cap(4) - 0.6, 0.6)));

  // đồng hồ chạy (6:55 → 7:05)
  const clockA = appear(t, cap(0) - 0.2, cap(3) + 0.8);
  at(ctx, { x: 1700, y: 190, size: 190, alpha: clockA, scale: 0.6 + 0.4 * pop(t, cap(0) - 0.2) }, (sz) => clock(ctx, sz, tween(t, 0, cap(3), 6.92, 7.08)));

  // checklist chuẩn bị
  const listA = appear(t, cap(2) - 0.1, cap(3) + 0.9);
  if (listA > 0) {
    const slide = (1 - listA) * 80;
    panel(ctx, 1240 + slide, 330, 560, 330, { alpha: listA });
    const items = ["Quần áo đã là", "Điện thoại 100%", "Báo thức 6:30"];
    items.forEach((label, i) => {
      const tk = cap(2) + 0.4 + i * 1.1;
      const y = 410 + i * 92;
      at(ctx, { x: 1300 + slide, y, size: 56, alpha: listA, scale: 0.3 + 0.7 * pop(t, tk) }, (sz) => check(ctx, sz, prog(t, tk, 0.35)));
      text(ctx, label, 1350 + slide, y + 14, { size: 38, family: FONT.semi, color: PALETTE.ink, alpha: listA });
    });
  }

  // mưa bắt đầu
  rain(ctx, t, easeInCubic(prog(t, cap(4) + 0.3, 2.5)) * 0.9);

  // "!" khi xe không nổ máy
  at(ctx, { x: 760, y: 250, size: 180, scale: pop(t, crank + 0.15) * (1 - prog(t, cap(6), 0.4)) }, (sz) => exclaim(ctx, sz));

  // chìa khóa biến mất
  const kStart = cap(5) - 0.1;
  const vanish = prog(t, cap(5) + 0.9, 0.35);
  at(ctx, { x: 1450, y: 300, size: 150, scale: pop(t, kStart) * (1 - vanish), rot: vanish * 1.5, alpha: 1 - vanish }, (sz) => key(ctx, sz));
  if (t > cap(5) + 1.0 && t < cap(6)) pill(ctx, "???", 1450, 300, { size: 44, fill: PALETTE.coral, scale: pop(t, cap(5) + 1.0) });

  // câu hỏi → tiêu đề
  const titleT = cap(7) + 1.9;
  const ta = appear(t, titleT, s.scene.duration + 1, 0.5);
  if (ta > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(14,18,26,${0.55 * ta})`;
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.restore();
    const sc = 0.85 + 0.15 * pop(t, titleT, 0.6);
    ctx.save();
    ctx.translate(960, 420);
    ctx.scale(sc, sc);
    text(ctx, "MURPHY'S LAW", 0, 0, { size: 140, family: FONT.xbold, align: "center", alpha: ta, shadow: true, color: PALETTE.paper });
    text(ctx, "Nghịch lý Murphy", 0, 90, { size: 60, family: FONT.semi, align: "center", alpha: ta, color: PALETTE.ochre });
    ctx.restore();
  }
};
