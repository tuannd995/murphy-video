import { drawShot, type Camera } from "../components/backdrop.js";
import { H, W, type Ctx, type SceneCtx } from "../components/canvas.js";
import { clamp, easeInOutCubic } from "../utils/anim.js";

export interface ShotOpts {
  /** camera cho từng shot id; thời gian camera tính trong shot */
  cams: Record<string, Partial<Camera>>;
  transition?: "fade" | "wipe";
  transDur?: number;
  /** dịch toàn khung (shake/nhìn trái phải), tính theo thời gian scene */
  offset?: (t: number) => { x: number; y: number };
}

/** Layer ảnh: chọn shot theo thời gian, chuyển cảnh mượt giữa các shot */
export function shotLayer(ctx: Ctx, t: number, s: SceneCtx, o: ShotOpts) {
  const shots = s.scene.shots;
  const td = o.transDur ?? 0.5;
  const off = o.offset?.(t) ?? { x: 0, y: 0 };
  const draw = (k: number, alpha: number) => {
    const sh = shots[k];
    const local = t - sh.start;
    const cam: Camera = { dur: sh.end - sh.start, ...(o.cams[sh.id] ?? {}) } as Camera;
    cam.dx = (cam.dx ?? 0) + off.x;
    cam.dy = (cam.dy ?? 0) + off.y;
    drawShot(ctx, s.images.get(sh.id) ?? null, sh.id, local, cam, alpha);
  };
  let k = shots.findIndex((sh) => t >= sh.start && t < sh.end);
  if (k < 0) k = t < shots[0].start ? 0 : shots.length - 1;
  const prev = k - 1;
  const intoShot = t - shots[k].start;
  if (prev >= 0 && intoShot < td) {
    const p = easeInOutCubic(clamp(intoShot / td));
    draw(prev, 1);
    if (o.transition === "wipe") {
      ctx.save();
      ctx.beginPath();
      // cạnh chéo quét từ trái sang phải
      const slant = H * 0.35, edge = p * (W + slant);
      ctx.moveTo(0, 0); ctx.lineTo(edge, 0); ctx.lineTo(edge - slant, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.clip();
      draw(k, 1);
      ctx.restore();
    } else draw(k, p);
  } else draw(k, 1);
}

/** tiện ích: tween trả về giá trị theo nhiều mốc [time, value] (easeInOutCubic giữa các mốc) */
export function keys(t: number, frames: [number, number][], ease = easeInOutCubic) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    const [t0, v0] = frames[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * ease(clamp((t - t0) / Math.max(1e-6, t1 - t0)));
  }
  return frames[frames.length - 1][1];
}
