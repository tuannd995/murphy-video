import type { SfxCue } from "./types.js";

export interface TimedCaption {
  vi: string;
  en: string;
  start: number; // giây, tính từ đầu scene
  end: number;
  voice: string | null;
  /** câu bị lược trong bản rút gọn (thời lượng 0, không phụ đề, không voice) */
  skip?: boolean;
}

export interface TimedShot {
  id: string;
  image: string | null;
  start: number;
  end: number;
}

export interface TimedScene {
  id: string;
  title: string;
  start: number; // giây, tính từ đầu video
  duration: number;
  music: "curious" | "warm";
  captions: TimedCaption[];
  shots: TimedShot[];
  sfx: (SfxCue & { time: number })[]; // time tính từ đầu scene
}

export interface Storyboard {
  type: string;
  title: string;
  vertical: boolean;
  cta?: string;
  width: number;
  height: number;
  fps: number;
  total_duration: number;
  voice_ready: boolean;
  images_ready: number;
  images_total: number;
  scenes: TimedScene[];
}
