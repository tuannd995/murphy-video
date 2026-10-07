// Scene 5 — Khi code: terminal xanh "works locally" → deploy production → lỗi đỏ dồn dập → bài học Murphy.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { flash, glitch } from "../components/fx.js";
import { at, check, database, warning } from "../components/icons.js";
import { panel, pill, pop, quote, terminal, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, prog, shake } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene05: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  const deploy = cap(2) + 0.6;
  const errs = [cap(3) + 0.1, cap(3) + 1.6, cap(4) + 0.1, cap(4) + 1.8];
  const shk = errs.map((e, i) => shake(t, e, 0.35, 7, i)).reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });

  shotLayer(ctx, t, s, {
    cams: {
      "s05a-dev-confident": { zoomFrom: 1.0, zoomTo: 1.06, fx0: 0.62, fx1: 0.66 },
      "s05b-dev-shocked": { zoomFrom: 1.06, zoomTo: 1.14, fx0: 0.66, fx1: 0.7, fy0: 0.48, fy1: 0.44 },
    },
    offset: () => shk,
  });

  // production: nhịp đỏ cảnh báo
  if (t > deploy && t < cap(5)) {
    const pulse = 0.08 + 0.06 * Math.sin(t * 6);
    flash(ctx, pulse * Math.min(1, (t - deploy) * 2), "214,69,61");
  }

  // câu thần chú
  if (t < cap(1) + 0.2) pill(ctx, "“Ở máy em thì chạy mà!”", 520, 180, { size: 44, fill: PALETTE.green, scale: pop(t, cap(0) + 2.4), alpha: 1 - prog(t, cap(1), 0.2) });

  // terminal
  const ta = appear(t, cap(1) - 0.2, cap(5) - 0.1);
  if (ta > 0) {
    const prod = t > deploy;
    const lines = prod
      ? [
          { text: "$ git push && deploy --prod", at: deploy - 0.2, color: "#d7dde8" },
          { text: "✗ Error: Missing ENV DATABASE_URL", at: errs[0], color: "#ff6b5e" },
          { text: "✗ GET /api/orders → timeout (30s)", at: errs[1], color: "#ff6b5e" },
          { text: "✗ lib@2.1.0 ≠ lib@2.0.3 (local)", at: errs[2], color: "#ff6b5e" },
          { text: "✗ ECONNREFUSED: database:5432", at: errs[3], color: "#ff6b5e" },
        ]
      : [
          { text: "$ npm install", at: cap(1), type: true },
          { text: "✓ added 812 packages", at: cap(1) + 0.7, color: "#5fd38d" },
          { text: "$ npm run build", at: cap(1) + 1.1, type: true },
          { text: "✓ build passed", at: cap(1) + 1.9, color: "#5fd38d" },
          { text: "$ npm test", at: cap(1) + 2.2, type: true },
          { text: "✓ 128 tests passed", at: cap(1) + 2.8, color: "#5fd38d" },
        ];
    terminal(ctx, 90, 110, 900, 520, t, lines, { title: prod ? "production" : "localhost", alpha: ta, tint: prod ? "rgba(40,16,20,0.95)" : undefined });

    if (!prod) {
      // badge WORKS LOCALLY
      const b = pop(t, cap(1) + 3.0);
      if (b > 0) {
        pill(ctx, "WORKS LOCALLY", 540, 690, { size: 40, fill: PALETTE.green, scale: b, alpha: ta });
        at(ctx, { x: 330, y: 690, size: 70, scale: b, alpha: ta }, (sz) => check(ctx, sz));
      }
      // icon .env + database ổn định
      at(ctx, { x: 1060, y: 200, size: 110, alpha: ta, scale: pop(t, cap(1) + 0.5) }, (sz) => {
        panel(ctx, -sz / 2, -sz * 0.35, sz, sz * 0.7, { fill: PALETTE.ochre, radius: 14 });
        text(ctx, ".env", 0, sz * 0.1, { size: sz * 0.3, family: FONT.monoBold, color: PALETTE.ink, align: "center" });
      });
    } else {
      // .env biến mất
      const gone = prog(t, errs[0], 0.5);
      at(ctx, { x: 1060, y: 200 + gone * 40, size: 110, alpha: 1 - gone, scale: 1 - gone * 0.6, rot: gone * 0.8 }, (sz) => {
        panel(ctx, -sz / 2, -sz * 0.35, sz, sz * 0.7, { fill: PALETTE.ochre, radius: 14 });
        text(ctx, ".env", 0, sz * 0.1, { size: sz * 0.3, family: FONT.monoBold, color: PALETTE.ink, align: "center" });
      });
      at(ctx, { x: 1060, y: 360, size: 120, alpha: ta, scale: pop(t, errs[3]) }, (sz) => database(ctx, sz, "#ff8a7a"));
      errs.forEach((e, i) => at(ctx, { x: 940, y: 210 + i * 46 + 50, size: 40, scale: pop(t, e) * ta }, (sz) => warning(ctx, sz)));
    }
  }

  // glitch khi deploy
  const g = 1 - Math.abs(prog(t, deploy - 0.25, 0.5) * 2 - 1);
  if (t > deploy - 0.25 && t < deploy + 0.25) glitch(ctx, t, g);

  // bài học
  const la = appear(t, cap(5) + 0.1, s.scene.duration + 1);
  if (la > 0) {
    panel(ctx, 90, 150, 1000, 420, { alpha: la * 0.92, fill: "rgba(24,32,44,0.9)" });
    text(ctx, "MURPHY KHÔNG NÓI:", 140, 230, { size: 34, family: FONT.bold, color: "rgba(244,239,230,0.7)", alpha: la });
    text(ctx, "“Code chắc chắn sẽ lỗi.”", 140, 300, { size: 52, family: FONT.xbold, color: PALETTE.paper, alpha: la });
    const strike = prog(t, cap(5) + 1.6, 0.4);
    if (strike > 0) { ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = PALETTE.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(140, 284); ctx.lineTo(140 + 620 * strike, 284); ctx.stroke(); ctx.restore(); }
    quote(ctx, ["Lỗi có thể xảy ra + không chuẩn bị", "= sẽ xảy ra, đúng lúc sếp đang xem."], 140, 400, t, cap(6) + 0.2, { size: 44, color: PALETTE.ochre, stagger: 1.6 });
  }
};
