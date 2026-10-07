// Scene 8 — Murphy như nguyên tắc quản lý rủi ro: hỗn loạn → checklist chuẩn bị.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust } from "../components/fx.js";
import { at, backupCloud, battery, bug, check, flask, key, plane, powerBank, rainCloud, trafficLight, umbrella } from "../components/icons.js";
import { panel, pill, pop, text } from "../components/ui.js";
import { roundRect } from "../components/backdrop.js";
import { PALETTE } from "../config/style.js";
import { appear, easeInCubic, easeInOutCubic, prog } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene08: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  shotLayer(ctx, t, s, { cams: { "s08-prepared": { zoomFrom: 1.0, zoomTo: 1.07, fx0: 0.62, fx1: 0.66 } } });
  dust(ctx, t, 0.3);

  // hỗn loạn: icon xoay quanh, rồi bị "hút" vào checklist
  const suck = easeInCubic(prog(t, cap(1) + 0.4, 0.9));
  const chaosA = appear(t, 0.2) * (1 - suck);
  if (chaosA > 0.01) {
    const icons = [
      (z: number) => bug(ctx, z), (z: number) => rainCloud(ctx, z), (z: number) => trafficLight(ctx, z * 0.8, "red"),
      (z: number) => battery(ctx, z * 0.9, 0.02), (z: number) => key(ctx, z),
    ];
    icons.forEach((d, i) => {
      const a = t * 0.9 + (i / icons.length) * Math.PI * 2;
      const cx = 520 + Math.cos(a) * 300, cy = 420 + Math.sin(a) * 200;
      const x = cx + (520 - cx) * suck, y = cy + (420 - cy) * suck;
      at(ctx, { x, y, size: 130, rot: Math.sin(t * 2 + i) * 0.3, alpha: chaosA, scale: (1 - suck) * pop(t, 0.2 + i * 0.15) }, d);
    });
  }

  // checklist
  const pa = appear(t, cap(1) + 0.9, s.scene.duration + 1);
  if (pa <= 0) return;
  panel(ctx, 100, 90, 860, 660, { alpha: pa });
  text(ctx, "CHUẨN BỊ CHO MURPHY", 150, 165, { size: 40, family: FONT.xbold, color: PALETTE.teal, alpha: pa });
  text(ctx, "Prepare for what can go wrong", 150, 210, { size: 26, family: FONT.med, color: "rgba(29,36,48,0.6)", alpha: pa });

  const rows: [number, string, string, (z: number) => void][] = [
    [cap(2) + 0.5, "Sao lưu dữ liệu", "Back up your data", (z) => backupCloud(ctx, z)],
    [cap(3) + 0.5, "Test trước khi deploy", "Test before you deploy", (z) => flask(ctx, z)],
    [cap(4) + 0.4, "Mang sạc dự phòng", "Carry a power bank", (z) => powerBank(ctx, z)],
    [cap(4) + 1.6, "Đến sân bay sớm", "Get to the airport early", (z) => plane(ctx, z, PALETTE.teal)],
  ];
  rows.forEach(([tk, vi, en, icon], i) => {
    const y = 290 + i * 100;
    const ra = appear(t, tk - 0.5, Infinity, 0.3) * pa;
    const slide = (1 - ra) * 60;
    at(ctx, { x: 190 + slide, y, size: 74, alpha: ra }, icon);
    text(ctx, vi, 250 + slide, y + 2, { size: 36, family: FONT.bold, color: PALETTE.ink, alpha: ra });
    text(ctx, en, 250 + slide, y + 36, { size: 24, family: FONT.med, color: "rgba(29,36,48,0.55)", alpha: ra });
    at(ctx, { x: 880, y: y + 8, size: 60, scale: pop(t, tk), alpha: pa }, (z) => check(ctx, z, prog(t, tk, 0.3)));
  });

  // thẻ Plan B lật ra
  const flip = easeInOutCubic(prog(t, cap(4) + 2.7, 0.6));
  if (flip > 0) {
    ctx.save();
    ctx.translate(530, 700);
    ctx.scale(Math.max(0.02, Math.abs(Math.cos(flip * Math.PI))), 1); // lật thẻ: mặt sau → mặt trước
    ctx.globalAlpha = pa;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 20;
    ctx.fillStyle = flip > 0.5 ? PALETTE.ochre : PALETTE.ink;
    roundRect(ctx, -170, -45, 340, 90, 18); ctx.fill();
    ctx.shadowColor = "transparent";
    if (flip > 0.5) text(ctx, "PLAN B ✓", 0, 14, { size: 42, family: FONT.xbold, color: PALETTE.ink, align: "center" });
    ctx.restore();
  }
  at(ctx, { x: 1780, y: 160, size: 120, scale: pop(t, cap(4) + 0.9) * (1 - prog(t, cap(5), 0.3)) }, (z) => umbrella(ctx, z, 1, PALETTE.teal));

  if (t > cap(5)) {
    ["Kỹ sư", "Phi công", "Bác sĩ"].forEach((l, i) => pill(ctx, l, 1240 + i * 220, 140, { size: 34, fill: PALETTE.teal, scale: pop(t, cap(5) + 0.2 + i * 0.5) }));
  }
};
