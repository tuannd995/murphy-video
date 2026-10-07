// Scene 2 — Murphy's Law là gì: câu phát biểu gõ chữ, "không phải định luật vật lý", icon thất bại xuất hiện tuần tự.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust } from "../components/fx.js";
import { at, battery, bug, key, plane, rainCloud, trafficLight } from "../components/icons.js";
import { panel, pill, pop, text, typewriter } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, easeOutCubic, prog, shake } from "../utils/anim.js";
import { keys, shotLayer } from "./common.js";

export const scene02: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  // nhân vật "nhìn trái / phải": pan ngang nhẹ theo mốc thời gian
  const look = keys(t, [[0, 0], [cap(0) + 1, 26], [cap(1) + 1.5, 26], [cap(1) + 2.6, -26], [cap(3), -26], [cap(3) + 1, 0], [cap(6), 0], [cap(6) + 1, 22]]);
  const err = shake(t, cap(3) + 2.2, 0.4, 7);
  shotLayer(ctx, t, s, {
    cams: { "s02-thinking": { zoomFrom: 1.0, zoomTo: 1.07, fx0: 0.55, fx1: 0.6, fy0: 0.5, fy1: 0.48 } },
    offset: () => ({ x: look + err.x, y: err.y }),
  });
  dust(ctx, t, 0.25, "255,255,255");

  // câu phát biểu kinh điển
  const qa = appear(t, cap(1) - 0.2, cap(3) - 0.1);
  if (qa > 0) {
    panel(ctx, 110, 150, 900, 360, { alpha: qa, fill: "rgba(24,32,44,0.88)" });
    const l1 = "Anything that can go wrong,";
    const full = l1 + " will go wrong.";
    const typed = typewriter(full, t, cap(1), 26);
    text(ctx, typed.slice(0, l1.length), 160, 270, { size: 58, family: FONT.xbold, color: PALETTE.paper, alpha: qa });
    if (typed.length > l1.length) text(ctx, typed.slice(l1.length + 1), 160, 350, { size: 58, family: FONT.xbold, color: PALETTE.ochre, alpha: qa });
    text(ctx, "— Murphy's Law", 160, 445, { size: 32, family: FONT.semi, color: "rgba(244,239,230,0.7)", alpha: qa * appear(t, cap(1) + 1.6) });
  }

  // Edward Murphy, cuối thập niên 1940
  const ea = appear(t, cap(2) + 0.2, cap(3) - 0.1);
  if (ea > 0) {
    pill(ctx, "Edward A. Murphy Jr. · ~1949", 560, 600, { size: 34, fill: PALETTE.teal, scale: pop(t, cap(2) + 0.2), alpha: ea });
    const px = -100 + easeOutCubic(prog(t, cap(2) + 0.2, 3.5)) * 1300;
    at(ctx, { x: px, y: 110 + Math.sin(t * 2) * 8, size: 120, alpha: ea }, (sz) => plane(ctx, sz, PALETTE.paper));
  }

  // "định luật vật lý?" → gạch chéo
  const fa = appear(t, cap(3) + 0.1, cap(5) - 0.1);
  if (fa > 0) {
    panel(ctx, 160, 200, 700, 300, { alpha: fa });
    text(ctx, "F = m · a", 510, 340, { size: 96, family: FONT.xbold, color: PALETTE.ink, align: "center", alpha: fa });
    text(ctx, "định luật vật lý?", 510, 430, { size: 40, family: FONT.semi, color: PALETTE.teal, align: "center", alpha: fa });
    const strike = easeOutCubic(prog(t, cap(3) + 2.1, 0.35));
    if (strike > 0) {
      ctx.save();
      ctx.globalAlpha = fa;
      ctx.strokeStyle = PALETTE.red; ctx.lineWidth = 16; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(230, 450); ctx.lineTo(230 + 560 * strike, 450 - 230 * strike); ctx.stroke();
      ctx.restore();
    }
    if (t > cap(4)) pill(ctx, "Không có phương trình nào", 510, 560, { size: 32, fill: PALETTE.red, scale: pop(t, cap(4) + 0.2), alpha: fa });
  }

  // icon thất bại pop-in tuần tự (khớp SFX pop)
  const ia = appear(t, cap(5), s.scene.duration + 1);
  const times = [cap(5) + 0.2, cap(5) + 0.9, cap(5) + 1.6, cap(6) + 0.4, cap(6) + 1.1];
  const pos: [number, number][] = [[230, 260], [470, 190], [710, 260], [350, 470], [610, 470]];
  const draws = [
    (sz: number) => battery(ctx, sz, 0.02, Math.floor(t * 3) % 2 === 0),
    (sz: number) => rainCloud(ctx, sz),
    (sz: number) => trafficLight(ctx, sz, "red"),
    (sz: number) => bug(ctx, sz),
    (sz: number) => key(ctx, sz),
  ];
  draws.forEach((d, i) => {
    const bob = Math.sin(t * 1.6 + i) * 6;
    at(ctx, { x: pos[i][0], y: pos[i][1] + bob, size: 150, scale: pop(t, times[i]), alpha: ia }, d);
  });
  if (t > cap(5)) {
    const labels = ["rủi ro", "xác suất", "chuẩn bị"];
    labels.forEach((l, i) => pill(ctx, l, 230 + i * 240, 640, { size: 30, fill: PALETTE.ink, scale: pop(t, cap(5) + 0.5 + i * 0.6) }));
  }
};
