// Scene 0 — Intro kênh "Não Phẳng": bộ não rơi xuống bị ép bẹp, logo, tagline hài, thẻ chủ đề.
import type { SceneRenderer } from "../components/canvas.js";
import { FONT } from "../components/canvas.js";
import { dust } from "../components/fx.js";
import { at, brain, check, cross } from "../components/icons.js";
import { panel, pill, pop, text } from "../components/ui.js";
import { PALETTE } from "../config/style.js";
import { appear, clamp, easeInCubic, easeOutBack, prog } from "../utils/anim.js";
import { shotLayer } from "./common.js";

export const scene00: SceneRenderer = (ctx, t, s) => {
  const { cap } = s;
  shotLayer(ctx, t, s, { cams: { "s02-thinking": { zoomFrom: 1.12, zoomTo: 1.04, fx0: 0.6 } } });
  // nền tối để logo nổi
  ctx.save(); ctx.fillStyle = "rgba(18,24,34,0.62)"; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
  dust(ctx, t, 0.3);

  // bộ não rơi xuống rồi bị ép phẳng (khớp SFX thud ở cap0 + 1.6)
  const hit = cap(0) + 1.6;
  const fall = easeInCubic(prog(t, hit - 0.7, 0.7));
  const flatY = 1 - (t < hit ? 0 : 0.55 * clamp((t - hit) / 0.12));
  const wobble = t > hit ? Math.sin((t - hit) * 18) * Math.exp(-(t - hit) * 5) * 0.08 : 0;
  ctx.save();
  ctx.translate(960, -200 + fall * 520);
  ctx.scale(1 + (1 - flatY) * 0.9 + wobble, flatY - wobble);
  at(ctx, { x: 0, y: 0, size: 260, alpha: t < hit - 0.7 ? 0 : 1 }, (z) => brain(ctx, z));
  ctx.restore();

  // logo
  const la = appear(t, hit - 0.05);
  const ls = 0.8 + 0.2 * easeOutBack(prog(t, hit - 0.05, 0.5));
  ctx.save(); ctx.translate(960, 530); ctx.scale(ls, ls);
  text(ctx, "NÃO PHẲNG", 0, 0, { size: 150, family: FONT.xbold, align: "center", color: PALETTE.paper, alpha: la, shadow: true });
  text(ctx, "kiến thức nguội ngắt · hâm nóng mỗi tuần", 0, 70, { size: 38, family: FONT.semi, align: "center", color: PALETTE.ochre, alpha: la * appear(t, cap(1)) });
  ctx.restore();

  // tagline: không giàu hơn ✗, không đẹp trai hơn ✗, cứu cuộc nhậu ✓
  const items: [number, string, boolean][] = [
    [cap(2) + 0.9, "Giàu hơn", false],
    [cap(2) + 2.4, "Đẹp trai hơn", false],
    [cap(3) + 2.4, "Cứu cuộc nhậu", true],
  ];
  const ta = appear(t, cap(2) + 0.5, cap(4) + 0.2);
  items.forEach(([tk, label, ok], i) => {
    const sc = pop(t, tk);
    if (sc <= 0) return;
    const x = 560 + i * 400, y = 720;
    pill(ctx, label, x + 30, y, { size: 38, fill: ok ? PALETTE.green : "rgba(244,239,230,0.95)", color: ok ? "#fff" : PALETTE.ink, scale: sc, alpha: ta });
    at(ctx, { x: x - 110, y, size: 64, scale: sc, alpha: ta }, (z) => (ok ? check(ctx, z) : cross(ctx, z)));
  });

  // thẻ chủ đề hôm nay
  const ca = appear(t, cap(4) + 0.1, s.scene.duration + 1);
  if (ca > 0) {
    const slide = (1 - easeOutBack(prog(t, cap(4) + 0.1, 0.6))) * 500;
    panel(ctx, 560 + slide, 650, 800, 150, { fill: PALETTE.coral, alpha: ca, radius: 24 });
    text(ctx, "HÔM NAY", 610 + slide, 705, { size: 30, family: FONT.bold, color: "rgba(255,255,255,0.8)", alpha: ca });
    text(ctx, "Nghịch lý Murphy", 610 + slide, 770, { size: 62, family: FONT.xbold, color: "#fff", alpha: ca });
  }
};
