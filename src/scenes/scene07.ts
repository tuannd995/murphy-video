// Scene 7 — Vì sao ta thấy Murphy đúng: bong bóng ký ức; chuyện xui phình to, chuyện suôn sẻ mờ dần.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust } from "../components/fx.js";
import { at, bug, check, plane, rainCloud, sun, trafficLight, usbPlug } from "../components/icons.js";
import { bubble, pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, clamp, easeOutBack, easeOutCubic, prog } from "../utils/anim.js";
import { shotLayer } from "./common.js";

interface Mem { x: number; y: number; r: number; bad: boolean; at: number; draw: (s: number) => void }

export const scene07: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  shotLayer(ctx, t, s, {
    cams: { "s07-memory": { zoomFrom: 1.0, zoomTo: 1.1, fy0: 0.6, fy1: 0.45 } },
  });
  dust(ctx, t, 0.3);

  const headX = 960, headY = 760;
  const mems: Mem[] = [
    { x: 520, y: 300, r: 110, bad: true, at: cap(1) + 0.3, draw: (z) => rainCloud(ctx, z) },
    { x: 960, y: 210, r: 130, bad: true, at: cap(2) + 0.2, draw: (z) => { plane(ctx, z * 0.9, "#ffffff"); text(ctx, "LỠ CHUYẾN", 0, z * 0.42, { size: z * 0.13, family: FONT.xbold, align: "center", color: "#fff" }); } },
    { x: 1400, y: 300, r: 100, bad: true, at: cap(4) + 0.5, draw: (z) => trafficLight(ctx, z * 0.8, "red") },
    { x: 700, y: 520, r: 90, bad: true, at: cap(6) + 0.3, draw: (z) => usbPlug(ctx, z * 0.8, 1) },
    { x: 1240, y: 520, r: 90, bad: true, at: cap(6) + 0.8, draw: (z) => bug(ctx, z * 0.9) },
  ];
  // chuyện bình thường: nhỏ, nhạt
  const goods: Mem[] = Array.from({ length: 9 }, (_, i) => ({
    x: 300 + (i % 5) * 330 + (i > 4 ? 160 : 0),
    y: 150 + Math.floor(i / 5) * 470 + (i % 2) * 40,
    r: 52,
    bad: false,
    at: cap(2) + 1.2 + i * 0.12,
    draw: (z: number) => (i % 3 === 0 ? sun(ctx, z, t) : i % 3 === 1 ? check(ctx, z) : plane(ctx, z, PALETTE.teal)),
  }));

  const growBad = 1 + 0.25 * easeOutCubic(prog(t, cap(4), 1.5)) + 0.15 * easeOutCubic(prog(t, cap(6), 1.2));
  const fadeGood = 1 - 0.6 * prog(t, cap(3), 2) - 0.4 * prog(t, cap(7), 1.5);
  const shrinkGood = 1 - 0.4 * prog(t, cap(4), 2);
  const spotlight = prog(t, cap(4), 0.8);

  for (const m of goods) {
    const p = clamp((t - m.at) / 1.2);
    if (p <= 0) continue;
    const x = headX + (m.x - headX) * easeOutCubic(p) + Math.sin(t + m.x) * 10;
    const y = headY + (m.y - headY) * easeOutCubic(p) + Math.cos(t * 0.8 + m.y) * 8 - prog(t, cap(7), 3) * 120;
    const r = m.r * easeOutBack(Math.min(1, p * 1.4)) * shrinkGood;
    bubble(ctx, x, y, r, "rgba(220,235,232,0.85)", fadeGood * 0.9);
    at(ctx, { x, y, size: r * 1.1, alpha: fadeGood * 0.9 }, m.draw);
  }
  for (const m of mems) {
    const p = clamp((t - m.at) / 1.0);
    if (p <= 0) continue;
    const x = headX + (m.x - headX) * easeOutCubic(p) + Math.sin(t * 0.9 + m.x) * 12;
    const y = headY + (m.y - headY) * easeOutCubic(p) + Math.sin(t * 1.2 + m.y) * 10;
    const r = m.r * easeOutBack(Math.min(1, p * 1.3)) * growBad;
    if (spotlight > 0) {
      ctx.save(); ctx.strokeStyle = `rgba(255,216,74,${0.8 * spotlight})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x, y, r + 12, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    bubble(ctx, x, y, r, "rgba(214,69,61,0.92)");
    at(ctx, { x, y, size: r * 1.15 }, m.draw);
  }

  // nhãn 3 thiên kiến
  const tags: [number, string, string][] = [
    [cap(3) + 0.3, "Thiên kiến tiêu cực", "Negativity bias"],
    [cap(5) + 0.1, "Thiên kiến xác nhận", "Confirmation bias"],
    [cap(6) + 0.2, "Dễ nhớ = tưởng là thường xuyên", "Availability heuristic"],
  ];
  const ta = appear(t, cap(3), s.scene.duration + 1);
  tags.forEach(([at0, vi, en], i) => {
    const sc = pop(t, at0);
    if (sc <= 0) return;
    const y = 600 + i * 0; // xếp ngang ở dải giữa
    const x = 340 + i * 620;
    pill(ctx, vi, x, y + 40, { size: 32, fill: PALETTE.ink, scale: sc, alpha: ta });
    text(ctx, en, x, y + 110, { size: 26, family: FONT.med, color: "#f2d38a", align: "center", alpha: ta * sc, shadow: true });
  });
};
