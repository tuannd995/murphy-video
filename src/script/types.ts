import type { PromptParts } from "../config/style.js";

export interface Caption {
  vi: string;
  en: string;
}

/** SFX gắn với câu thoại: phát tại lúc câu thứ `caption` bắt đầu + `offset` giây */
export interface SfxCue {
  id: string;
  caption?: number;
  offset?: number;
  gainDb?: number;
}

export interface Shot {
  id: string; // = tên file ảnh assets/images/<id>.png
  /** câu thoại bắt đầu hiển thị shot này */
  fromCaption: number;
  /** bỏ trống = dùng lại ảnh của shot cùng id ở scene khác (không tạo ảnh mới) */
  prompt?: PromptParts;
}

export interface SceneDef {
  id: string;
  title: string;
  targetDuration: number;
  captions: Caption[];
  visual_summary: string;
  shots: Shot[];
  animation: string;
  sfx: SfxCue[];
  music: "curious" | "warm";
}

/** Định dạng data/script.json */
export interface ScriptScene {
  id: string;
  title: string;
  duration: number;
  voice_vi: string;
  subtitle_vi: string;
  subtitle_en: string;
  captions: Caption[];
  visual_summary: string;
  image_prompt: string;
  shots: { id: string; fromCaption: number; image_prompt: string }[];
  animation: string;
  sfx: SfxCue[];
  music: "curious" | "warm";
}

export interface ScriptFile {
  title_vi: string;
  title_en: string;
  word_count_vi: number;
  character_reference_prompt: string;
  scenes: ScriptScene[];
}
