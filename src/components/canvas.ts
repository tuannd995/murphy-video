import path from "node:path";
import { GlobalFonts, type Image, type SKRSContext2D } from "@napi-rs/canvas";
import { PATHS } from "../config/index.js";
import type { TimedScene } from "../script/timeline.js";

export type Ctx = SKRSContext2D;

/** Mọi scene vẽ trong hệ toạ độ logic 1920×1080, render.ts scale sang kích thước output */
export const W = 1920;
export const H = 1080;

export const FONT = {
  bold: "InterBold",
  xbold: "InterXB",
  semi: "InterSemi",
  med: "InterMed",
  mono: "DejaMono",
  monoBold: "DejaMonoB",
  /** font tiêu đề kiểu truyện tranh (Bangers), chỉ chữ in hoa, đủ dấu tiếng Việt */
  display: "Bangers",
  /** font tròn vui cho nhãn nhỏ (Baloo 2) */
  round: "Baloo2",
};

let fontsReady = false;
export function registerFonts() {
  if (fontsReady) return;
  const f = (file: string, alias: string) => GlobalFonts.registerFromPath(path.join(PATHS.fonts, file), alias);
  f("Inter-Bold.otf", FONT.bold);
  f("Inter-ExtraBold.otf", FONT.xbold);
  f("Inter-SemiBold.otf", FONT.semi);
  f("Inter-Medium.otf", FONT.med);
  f("DejaVuSansMono.ttf", FONT.mono);
  f("DejaVuSansMono-Bold.ttf", FONT.monoBold);
  f("Bangers-Regular.ttf", FONT.display);
  f("Baloo2.ttf", FONT.round);
  fontsReady = true;
}

export const font = (size: number, family = FONT.bold) => `${size}px ${family}`;

export interface SceneCtx {
  scene: TimedScene;
  images: Map<string, Image | null>;
  /** thời điểm bắt đầu câu thoại i (giây trong scene) */
  cap: (i: number) => number;
  capEnd: (i: number) => number;
}

export type SceneRenderer = (ctx: Ctx, t: number, s: SceneCtx) => void;
