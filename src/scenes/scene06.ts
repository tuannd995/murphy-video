// Scene 6 — Montage đời sống: đèn đỏ, Wi-Fi mất, ô & nắng, mưa khi quên ô, pin 1%.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { rain } from "../components/fx.js";
import { at, battery, clock, cross, exclaim, rainCloud, sun, trafficLight, umbrella, wifi } from "../components/icons.js";
import { pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, easeInCubic, prog, shake, tween } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene06: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const sh = shake(t, cap(5) + 2.6, 0.5, 9);
  shotLayer(ctx, t, s, {
    transition: "wipe",
    transDur: 0.45,
    cams: {
      "s06a-traffic": { zoomFrom: 1.0, zoomTo: 1.1, fx0: 0.55, fx1: 0.62 },
      "s06b-umbrella-sun": { zoomFrom: 1.08, zoomTo: 1.0, fy0: 0.45, fy1: 0.5 },
      "s06c-phone-battery": { zoomFrom: 1.0, zoomTo: 1.1, fx0: 0.6, fx1: 0.66 },
    },
    offset: () => sh,
  });

  if (t < cap(1)) pill(ctx, "Murphy ở khắp nơi", 960, 140, { size: 46, fill: PALETTE.ink, scale: pop(t, cap(0) + 0.6) });

  // đèn giao thông + đồng hồ trễ giờ
  const la = appear(t, cap(1) - 0.1, cap(2) - 0.1, 0.25);
  if (la > 0) {
    const state = t > cap(1) + 1.2 ? "red" : t > cap(1) + 0.6 ? "yellow" : "green";
    at(ctx, { x: 300, y: 380, size: 380, alpha: la, scale: pop(t, cap(1) - 0.1, 0.35) }, (sz) => trafficLight(ctx, sz, state));
    at(ctx, { x: 560, y: 250, size: 170, alpha: la, scale: pop(t, cap(1) + 0.3) }, (sz) => clock(ctx, sz, tween(t, cap(1), 3, 7.9, 8.25)));
    if (t > cap(1) + 1.3) pill(ctx, "MUỘN!", 560, 400, { size: 40, fill: PALETTE.red, scale: pop(t, cap(1) + 1.3) });
  }

  // Wi-Fi rớt từng vạch
  const wa = appear(t, cap(2) - 0.1, cap(3) - 0.1, 0.25);
  if (wa > 0) {
    ctx.save(); ctx.fillStyle = `rgba(14,18,26,${0.45 * wa})`; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
    const bars = Math.max(0, 3 - Math.floor(Math.max(0, t - cap(2) - 0.3) / 0.4));
    at(ctx, { x: 960, y: 420, size: 300, alpha: wa, scale: pop(t, cap(2) - 0.1, 0.35) }, (sz) => wifi(ctx, sz, bars));
    if (bars === 0) at(ctx, { x: 1100, y: 300, size: 160, scale: pop(t, cap(2) + 1.6) }, (sz) => exclaim(ctx, sz));
    if (t > cap(2) + 1.6) text(ctx, "No Internet", 960, 640, { size: 44, family: FONT.bold, align: "center", alpha: wa, shadow: true });
  }

  // nắng + mang ô
  if (t > cap(3) - 0.2 && t < cap(4)) {
    at(ctx, { x: 260, y: 220, size: 260, scale: pop(t, cap(3)) }, (sz) => sun(ctx, sz, t));
    at(ctx, { x: 1650, y: 330, size: 220, scale: pop(t, cap(3) + 0.6) }, (sz) => umbrella(ctx, sz, 0.55));
    pill(ctx, "Mang ô ✓", 1650, 500, { size: 36, fill: PALETTE.teal, scale: pop(t, cap(3) + 0.8) });
  }
  // quên ô → mưa
  const ra = easeInCubic(prog(t, cap(4) + 0.2, 1.2)) * (1 - prog(t, cap(5) - 0.2, 0.4));
  if (ra > 0) {
    rain(ctx, t, ra);
    at(ctx, { x: 260, y: 220, size: 240, scale: pop(t, cap(4) + 0.2), alpha: ra }, (sz) => rainCloud(ctx, sz));
    at(ctx, { x: 1650, y: 330, size: 200, alpha: ra }, (sz) => umbrella(ctx, sz, 1, "rgba(224,113,90,0.35)"));
    at(ctx, { x: 1650, y: 330, size: 140, scale: pop(t, cap(4) + 0.7) * ra }, (sz) => cross(ctx, sz));
    pill(ctx, "Quên ô", 1650, 500, { size: 36, fill: PALETTE.red, scale: pop(t, cap(4) + 0.8), alpha: ra });
  }

  // pin tụt về 1%
  if (t > cap(5) - 0.2) {
    const lvl = tween(t, cap(5) + 0.4, 1.8, 1, 0.01, easeInCubic);
    const blink = lvl < 0.02 && Math.floor(t * 4) % 2 === 0;
    at(ctx, { x: 420, y: 400, size: 360, scale: pop(t, cap(5)) }, (sz) => battery(ctx, sz, lvl, blink));
    if (t > cap(5) + 2.6) pill(ctx, "Cuộc gọi quan trọng...", 420, 640, { size: 36, fill: PALETTE.red, scale: pop(t, cap(5) + 2.6) });
  }
};
