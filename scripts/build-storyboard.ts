// Ghép script + độ dài voice thực tế → storyboard (timeline tuyệt đối cho render & mix).
// Nếu chưa có voice/ảnh vẫn chạy được (ước lượng thời lượng + ảnh placeholder) để test flow.
//   npm run storyboard                                   # YouTube đầy đủ (ưu tiên 8–10 phút) → data/storyboard.json
//   npm run storyboard -- --type=tiktok                  # bản tóm tắt dọc 9:16 → data/storyboard.tiktok-summary.json
//   npm run storyboard -- --type=shorts --scenes=scene-04
//   npm run storyboard -- --type=youtube --summary       # bản tóm tắt ngang
import fs from "node:fs";
import path from "node:path";
import { PATHS, TIMING, VIDEO } from "../src/config/index.js";
import { formatPaths, parseFormatArgs } from "../src/config/formats.js";
import { voiceFile } from "../src/audio/voice.js";
import type { Storyboard, TimedCaption, TimedScene } from "../src/script/timeline.js";
import type { ScriptFile } from "../src/script/types.js";
import { probeDuration } from "../src/utils/media.js";

const fa = parseFormatArgs();
const { format } = fa;
const paths = formatPaths(fa);
const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));

// chọn scene
const INTRO_OUTRO = new Set(script.scenes.filter((s) => /intro|outro/i.test(s.title)).map((s) => s.id));
let chosen = script.scenes;
if (fa.scenes) {
  const missing = fa.scenes.filter((id) => !script.scenes.some((s) => s.id === id));
  if (missing.length) throw new Error(`Không thấy scene: ${missing.join(", ")}`);
  chosen = script.scenes.filter((s) => fa.scenes!.includes(s.id));
} else if (!format.introOutro) {
  chosen = script.scenes.filter((s) => !INTRO_OUTRO.has(s.id));
}
if (format.vertical && !fa.scenes && !fa.summary) console.warn("⚠ Bản dọc không tóm tắt sẽ rất dài. Nên dùng --summary hoặc --scenes=…");

function build(extraGap: number) {
  let voiceCount = 0, captionCount = 0, imagesReady = 0, imagesTotal = 0;
  let cursor = 0;
  const gap = TIMING.captionGap + extraGap;

  const scenes: TimedScene[] = chosen.map((s) => {
    const keep = fa.summary && s.summary ? new Set(s.summary) : null;
    let t = TIMING.sceneLeadIn;
    const captions = s.captions.map((c, i): TimedCaption => {
      if (keep && !keep.has(i)) {
        // câu bị lược: thời lượng 0 để animation theo cap(i) vẫn có mốc
        return { vi: c.vi, en: c.en, start: +t.toFixed(3), end: +t.toFixed(3), voice: null, skip: true };
      }
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
      const start = k === 0 ? 0 : Math.max(0, captions[sh.fromCaption].start - 0.15);
      const next = s.shots[k + 1];
      const end = next ? Math.max(start, captions[next.fromCaption].start - 0.15) : duration;
      return { id: sh.id, image: exists ? `${sh.id}.png` : null, start: +start.toFixed(3), end: +end.toFixed(3) };
    });

    // SFX gắn với câu bị lược thì bỏ
    const sfx = s.sfx
      .filter((cue) => cue.caption === undefined || !captions[cue.caption].skip)
      .map((cue) => ({ ...cue, time: +Math.max(0, (cue.caption !== undefined ? captions[cue.caption].start : 0) + (cue.offset ?? 0)).toFixed(3) }));

    const scene: TimedScene = { id: s.id, title: s.title, start: +cursor.toFixed(3), duration, music: s.music, captions, shots, sfx };
    cursor += duration;
    return scene;
  });

  const sb: Storyboard = {
    type: fa.type,
    title: script.title_vi,
    vertical: format.vertical,
    cta: format.cta,
    width: format.width,
    height: format.height,
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
const [idealMin, idealMax] = format.ideal;
if (format.stretch && sb.total_duration < idealMin) {
  const extra = Math.min(TIMING.maxExtraGap, (idealMin - sb.total_duration) / captionCount);
  ({ sb, voiceCount, captionCount } = build(extra));
  console.log(`(giãn thêm ${extra.toFixed(2)}s giữa các câu để tiến gần độ dài mục tiêu)`);
}
fs.mkdirSync(path.dirname(paths.storyboard), { recursive: true });
fs.writeFileSync(paths.storyboard, JSON.stringify(sb, null, 2) + "\n");

const mmss = (x: number) => `${Math.floor(x / 60)}:${String(Math.round(x % 60)).padStart(2, "0")}`;
console.log(`${path.relative(process.cwd(), paths.storyboard)} — ${format.label}${fa.summary ? ", tóm tắt" : ""}`);
console.log(`tổng ${mmss(sb.total_duration)} (mục tiêu ${mmss(idealMin)}–${mmss(idealMax)}) | voice ${voiceCount}/${captionCount} | ảnh ${sb.images_ready}/${sb.images_total}`);
for (const s of sb.scenes) console.log(`  ${s.id}  ${mmss(s.start)}  ${s.duration.toFixed(1)}s  ${s.title}`);
if (sb.total_duration < idealMin)
  console.warn(fa.type === "youtube"
    ? `⚠ Ngắn hơn 8 phút. YouTube ưu tiên 8–10 phút (mid-roll): thêm 1–3 khối nội dung vào kịch bản.`
    : `⚠ Ngắn hơn mức lý tưởng ${mmss(idealMin)} cho ${format.label}. ${format.note}`);
if (sb.total_duration > (format.hardMax ?? Infinity)) console.warn(`⚠ Vượt giới hạn ${mmss(format.hardMax!)} của ${format.label}.`);
else if (sb.total_duration > idealMax) console.warn(`⚠ Dài hơn mức lý tưởng ${mmss(idealMax)} cho ${format.label}.`);
