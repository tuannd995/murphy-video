// Scene 4 — USB: cắm sai → xoay → vẫn sai → khựng lại → xoay → vào (đúng hướng ban đầu).
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { at, check, cross, usbPlug, usbPort } from "../components/icons.js";
import { panel, pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, easeInOutCubic, easeOutBack, prog, shake } from "../utils/anim.js";
import { keys, shotLayer } from "./common.js";

export const scene04: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const fail1 = cap(2) + 0.9, fail2 = cap(3) + 1.0, ok = cap(4) + 2.0;
  const e1 = shake(t, fail1, 0.4, 8), e2 = shake(t, fail2, 0.45, 10, 2);
  // dramatic pause: camera đẩy vào trước lần cắm cuối
  const pauseZoom = keys(t, [[cap(4) + 0.8, 0], [ok - 0.2, 1], [ok + 0.6, 0]]);
  shotLayer(ctx, t, s, {
    cams: { "s04-desk-usb": { zoomFrom: 1.0, zoomTo: 1.06, fx0: 0.6, fx1: 0.65, fy0: 0.5, fy1: 0.5 } },
    offset: () => ({ x: e1.x + e2.x, y: e1.y + e2.y }),
  });

  // vùng tối nhẹ khi khựng lại
  if (pauseZoom > 0) { ctx.save(); ctx.fillStyle = `rgba(10,12,20,${0.3 * pauseZoom})`; ctx.fillRect(0, 0, 1920, 1080); ctx.restore(); }

  // panel cận cảnh USB
  const pa = appear(t, cap(0) + 0.6, s.scene.duration + 1);
  if (pa <= 0) return;
  const zoom = 1 + 0.08 * pauseZoom;
  ctx.save();
  ctx.translate(560, 420);
  ctx.scale(zoom, zoom);
  ctx.translate(-560, -420);
  panel(ctx, 110, 140, 900, 560, { alpha: pa, fill: "rgba(24,32,44,0.9)" });
  ctx.globalAlpha = pa;

  const portX = 760, y = 470;
  at(ctx, { x: portX, y, size: 220 }, (sz) => usbPort(ctx, sz));

  // vị trí đầu cắm theo các mốc: tiến vào / bật ra / xoay / ...
  const approach = (t0: number) => keys(t, [[t0, 0], [t0 + 0.75, 1]]);
  let px = 360, flip = 0;
  // lần 1
  const a1 = approach(cap(2));
  px = 360 + a1 * 270;
  if (t > fail1) px = 630 - easeOutBack(prog(t, fail1, 0.4)) * 270;
  // xoay lần 1 (mặt sau)
  flip = easeInOutCubic(prog(t, cap(3) + 0.1, 0.55));
  // lần 2
  if (t > cap(3) + 0.25) px = 360 + approach(cap(3) + 0.25) * 270;
  if (t > fail2) px = 630 - easeOutBack(prog(t, fail2, 0.4)) * 270;
  // xoay lại → mặt ban đầu
  if (t > cap(4) + 0.2) flip = 1 - easeInOutCubic(prog(t, cap(4) + 0.2, 0.6));
  // lần 3: chậm rãi... rồi vào hẳn
  if (t > cap(4) + 1.0) px = 360 + keys(t, [[cap(4) + 1.0, 0], [ok - 0.3, 0.9], [ok, 1.12]]) * 270;
  at(ctx, { x: px - 110, y, size: 300 }, (sz) => usbPlug(ctx, sz, flip));

  // dấu X / ✓
  at(ctx, { x: 860, y: 300, size: 110, scale: pop(t, fail1 + 0.05) * (1 - prog(t, cap(3), 0.3)) }, (sz) => cross(ctx, sz));
  at(ctx, { x: 860, y: 300, size: 110, scale: pop(t, fail2 + 0.05) * (1 - prog(t, cap(4), 0.3)) }, (sz) => cross(ctx, sz));
  at(ctx, { x: 860, y: 300, size: 120, scale: pop(t, ok) }, (sz) => check(ctx, sz, prog(t, ok, 0.4)));

  // đếm số lần thử
  const tries = t > ok ? 3 : t > cap(4) + 1.0 ? 3 : t > cap(3) + 0.25 ? 2 : t > cap(2) ? 1 : 0;
  if (tries > 0) text(ctx, `Lần thử: ${tries}`, 160, 650, { size: 34, family: FONT.semi, color: "rgba(244,239,230,0.75)" });

  // 50%
  if (t > cap(1) + 0.3) {
    const ga = appear(t, cap(1) + 0.3);
    const cx = 260, cy = 270, r = 70;
    ctx.save();
    ctx.globalAlpha *= ga;
    ctx.lineWidth = 22; ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = PALETTE.ochre; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * easeInOutCubic(prog(t, cap(1) + 0.3, 1))); ctx.stroke();
    ctx.restore();
    text(ctx, "50%", cx, cy + 14, { size: 42, family: FONT.xbold, align: "center", alpha: ga });
  }
  ctx.restore();

  // kết luận hài
  if (t > cap(5)) {
    pill(ctx, "Toán học: 50%", 270, 755, { size: 36, fill: PALETTE.teal, scale: pop(t, cap(5) + 0.2) });
    pill(ctx, "Cuộc đời: còn lâu nhé", 790, 755, { size: 36, fill: PALETTE.coral, scale: pop(t, cap(5) + 1.6) });
  }
};
