// Ghép script + độ dài voice thực tế → data/storyboard.json (timeline tuyệt đối cho render & mix).
// Nếu chưa có voice/ảnh vẫn chạy được (ước lượng thời lượng + ảnh placeholder) để test flow.
import fs from "node:fs";
import path from "node:path";
import { PATHS, TIMING, VIDEO } from "../src/config/index.js";
import { voiceFile } from "../src/audio/voice.js";
import type { Storyboard, TimedScene } from "../src/script/timeline.js";
import type { ScriptFile } from "../src/script/types.js";
import { probeDuration } from "../src/utils/media.js";

const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));

function build(extraGap: number) {
let voiceCount = 0, captionCount = 0, imagesReady = 0, imagesTotal = 0;
let cursor = 0;
const gap = TIMING.captionGap + extraGap;

const scenes: TimedScene[] = script.scenes.map((s) => {
  let t = TIMING.sceneLeadIn;
  const captions = s.captions.map((c, i) => {
    captionCount++;
    const vf = voiceFile(s.id, i);
    const hasVoice = fs.existsSync(vf) && fs.statSync(vf).size > 1000;
    if (hasVoice) voiceCount++;
    const dur = hasVoice ? probeDuration(vf) : c.vi.length / TIMING.charsPerSecond;
    const cap = { vi: c.vi, en: c.en, start: +t.toFixed(3), end: +(t + dur).toFixed(3), voice: hasVoice ? path.relative(PATHS.voice, vf) : null };
    t += dur + gap + (c.vi.trimEnd().endsWith("...") ? TIMING.pauseAfterEllipsis : 0);
    return cap;
  });
  // làm tròn theo frame để video và audio không lệch nhau
  const duration = Math.round((t - gap + TIMING.sceneTail) * VIDEO.fps) / VIDEO.fps;

  const shots = s.shots.map((sh, k) => {
    imagesTotal++;
    const img = path.join(PATHS.images, `${sh.id}.png`);
    const exists = fs.existsSync(img);
    if (exists) imagesReady++;
    const start = k === 0 ? 0 : captions[sh.fromCaption].start - 0.15;
    const next = s.shots[k + 1];
    const end = next ? captions[next.fromCaption].start - 0.15 : duration;
    return { id: sh.id, image: exists ? `${sh.id}.png` : null, start: +start.toFixed(3), end: +end.toFixed(3) };
  });

  const sfx = s.sfx.map((cue) => ({
    ...cue,
    time: +Math.max(0, (cue.caption !== undefined ? captions[cue.caption].start : 0) + (cue.offset ?? 0)).toFixed(3),
  }));

  const scene: TimedScene = { id: s.id, title: s.title, start: +cursor.toFixed(3), duration, music: s.music, captions, shots, sfx };
  cursor += duration;
  return scene;
});

const sb: Storyboard = {
  width: VIDEO.width,
  height: VIDEO.height,
  fps: VIDEO.fps,
  total_duration: +cursor.toFixed(3),
  voice_ready: voiceCount === captionCount,
  images_ready: imagesReady,
  images_total: imagesTotal,
  scenes,
};
return { sb, voiceCount, captionCount };
}

let { sb, voiceCount, captionCount } = build(0);
if (sb.total_duration < TIMING.minTotal) {
  const extra = Math.min(TIMING.maxExtraGap, (TIMING.minTotal - sb.total_duration) / captionCount);
  ({ sb, voiceCount, captionCount } = build(extra));
  console.log(`(giãn thêm ${extra.toFixed(2)}s giữa các câu để đạt độ dài mục tiêu)`);
}
const scenes = sb.scenes;
fs.writeFileSync(PATHS.storyboard, JSON.stringify(sb, null, 2) + "\n");

const mmss = (x: number) => `${Math.floor(x / 60)}:${String(Math.round(x % 60)).padStart(2, "0")}`;
console.log(`data/storyboard.json: tổng ${mmss(sb.total_duration)} | voice ${voiceCount}/${captionCount} | ảnh ${sb.images_ready}/${sb.images_total}`);
for (const s of scenes) console.log(`  ${s.id}  ${mmss(s.start)}  ${s.duration.toFixed(1)}s  ${s.title}`);
