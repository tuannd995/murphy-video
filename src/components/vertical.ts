// Bố cục dọc 9:16 (TikTok/Shorts/Reels): khung 16:9 ở giữa, nền là chính khung đó phóng to + tối,
// tiêu đề phía trên, phụ đề to phía dưới, lời kêu gọi ở cuối video.
import type { Canvas } from "@napi-rs/canvas";
import { appear, easeOutBack, prog } from "../utils/anim.js";
import { FONT, H, W, font, type Ctx } from "./canvas.js";
import { drawSubtitle, type SubtitleLayout } from "./subtitles.js";
import { pill, wrap } from "./ui.js";
import type { Storyboard, TimedScene } from "../script/timeline.js";

export const VW = 1080, VH = 1920;
const FRAME_Y = 600, FRAME_H = Math.round((VW / W) * H); // 608
const SUB: SubtitleLayout = { frameW: VW, bottom: 1640, viSize: 54, enSize: 32, maxW: 980, maxLines: 3 };

export function drawVertical(ctx: Ctx, frame: Canvas, t: number, sb: Storyboard, scene: TimedScene) {
  // nền: khung phóng to phủ kín + tối
  const cover = VH / H;
  ctx.drawImage(frame, (VW - W * cover) / 2, 0, W * cover, VH);
  ctx.fillStyle = "rgba(14,18,26,0.72)";
  ctx.fillRect(0, 0, VW, VH);
  // khung chính
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40;
  ctx.drawImage(frame, 0, FRAME_Y, VW, FRAME_H);
  ctx.restore();

  // tiêu đề (cố định suốt video)
  pill(ctx, "NÃO PHẲNG", VW / 2, 170, { size: 30, fill: "#e0362c" });
  ctx.font = font(64, FONT.xbold);
  const lines = wrap(ctx, sb.title, 940).slice(0, 3);
  ctx.textAlign = "center"; ctx.fillStyle = "#ffffff";
  lines.forEach((l, i) => ctx.fillText(l, VW / 2, 290 + i * 78));
  ctx.textAlign = "left";

  // phụ đề to
  drawSubtitle(ctx, t, scene.captions, SUB);

  // lời kêu gọi cuối video
  const sceneEnd = scene.start + scene.duration;
  const isLast = Math.abs(sceneEnd - sb.total_duration) < 0.01;
  if (isLast && sb.cta) {
    const ctaStart = scene.duration - 3.5;
    const a = appear(t, ctaStart);
    if (a > 0) pill(ctx, sb.cta, VW / 2, 1760, { size: 40, fill: "#e0362c", scale: easeOutBack(prog(t, ctaStart, 0.5)), alpha: a });
  }
}
