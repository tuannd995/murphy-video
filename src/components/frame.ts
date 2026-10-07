// Ghép 1 frame: scene layers → grain/vignette → subtitle → fade ở mép scene.
import fs from "node:fs";
import path from "node:path";
import { loadImage, type Image } from "@napi-rs/canvas";
import { PATHS, TIMING } from "../config/index.js";
import type { TimedScene } from "../script/timeline.js";
import { SCENE_RENDERERS } from "../scenes/index.js";
import { prog } from "../utils/anim.js";
import type { Ctx, SceneCtx } from "./canvas.js";
import { fadeBlack, grain, vignette } from "./fx.js";
import { drawSubtitle } from "./subtitles.js";

export async function loadSceneCtx(scene: TimedScene): Promise<SceneCtx> {
  const images = new Map<string, Image | null>();
  for (const sh of scene.shots) {
    const f = path.join(PATHS.images, `${sh.id}.png`);
    images.set(sh.id, fs.existsSync(f) ? await loadImage(fs.readFileSync(f)) : null);
  }
  return {
    scene,
    images,
    cap: (i) => scene.captions[i].start,
    capEnd: (i) => scene.captions[i].end,
  };
}

export function drawFrame(ctx: Ctx, s: SceneCtx, t: number, isFirst: boolean) {
  const render = SCENE_RENDERERS[s.scene.id];
  if (!render) throw new Error(`Chưa có renderer cho ${s.scene.id}`);
  ctx.save();
  render(ctx, t, s);
  ctx.restore();
  vignette(ctx, 0.38);
  grain(ctx, t, 0.04);
  drawSubtitle(ctx, t, s.scene.captions);
  // dip-to-black giữa các scene
  const fin = isFirst ? 0.9 : TIMING.fade;
  fadeBlack(ctx, 1 - prog(t, 0, fin));
  fadeBlack(ctx, prog(t, s.scene.duration - TIMING.fade, TIMING.fade));
}
