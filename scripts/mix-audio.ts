// Trộn voice-over + nhạc nền (tự duck khi có giọng) + SFX theo timeline → output[/<định dạng>]/audio-mix.wav
//   npm run mix [-- --type=tiktok]
import fs from "node:fs";
import path from "node:path";
import { AUDIO, PATHS } from "../src/config/index.js";
import { formatPaths, parseFormatArgs } from "../src/config/formats.js";
import type { Storyboard } from "../src/script/timeline.js";
import { dbToGain, decodeMono, writeWav } from "../src/utils/media.js";

const SR = AUDIO.sampleRate;
const paths = formatPaths(parseFormatArgs());
const sb: Storyboard = JSON.parse(fs.readFileSync(paths.storyboard, "utf8"));
const N = Math.ceil(sb.total_duration * SR);
const L = new Float32Array(N), R = new Float32Array(N);

const cache = new Map<string, Float32Array>();
const load = (f: string) => {
  if (!cache.has(f)) cache.set(f, decodeMono(f, SR));
  return cache.get(f)!;
};
const place = (src: Float32Array, at: number, gain: number, pan = 0) => {
  const o = Math.round(at * SR);
  const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < src.length && o + i < N; i++) if (o + i >= 0) { L[o + i] += src[i] * gl; R[o + i] += src[i] * gr; }
};

// 1) voice + envelope ducking
const voiceOn = new Float32Array(N);
let voices = 0;
for (const s of sb.scenes)
  for (const c of s.captions) {
    if (c.skip) continue;
    if (c.voice) { place(load(path.join(PATHS.voice, c.voice)), s.start + c.start, dbToGain(AUDIO.voiceGainDb)); voices++; }
    const a = Math.round((s.start + c.start) * SR), b = Math.min(N, Math.round((s.start + c.end) * SR));
    for (let i = a; i < b; i++) voiceOn[i] = 1;
  }

// 2) nhạc nền: lặp track theo mood của từng scene, crossfade 1.5s khi đổi mood
const music = { curious: load(path.join(PATHS.music, "curious.wav")), warm: load(path.join(PATHS.music, "warm.wav")) };
const xf = 1.5 * SR;
const moodAt = (i: number) => {
  const t = i / SR;
  return (sb.scenes.find((s) => t >= s.start && t < s.start + s.duration) ?? sb.scenes[sb.scenes.length - 1]).music;
};
const switchIdx = sb.scenes.findIndex((s, k) => k > 0 && s.music !== sb.scenes[k - 1].music);
const switchAt = switchIdx > 0 ? Math.round(sb.scenes[switchIdx].start * SR) : Infinity;
const base = dbToGain(AUDIO.musicGainDb), duck = dbToGain(AUDIO.musicDuckDb);
let env = 1;
const att = 1 - Math.exp(-1 / (0.12 * SR)), rel = 1 - Math.exp(-1 / (0.6 * SR));
for (let i = 0; i < N; i++) {
  const target = voiceOn[i] ? duck : 1;
  env += (target - env) * (target < env ? att : rel);
  let m: number;
  if (Math.abs(i - switchAt) < xf / 2) {
    const p = (i - (switchAt - xf / 2)) / xf;
    const a = music[sb.scenes[switchIdx - 1].music], b = music[sb.scenes[switchIdx].music];
    m = a[i % a.length] * (1 - p) + b[(i - switchAt + b.length * 10) % b.length] * p;
  } else {
    const trk = music[moodAt(i)];
    const off = i >= switchAt ? i - switchAt : i;
    m = trk[off % trk.length];
  }
  const fade = Math.min(1, i / SR / 1.5, (N - i) / SR / 3);
  const v = m * base * env * fade;
  L[i] += v; R[i] += v;
}

// 3) SFX
let sfxCount = 0;
for (const s of sb.scenes)
  for (const cue of s.sfx) {
    const f = path.join(PATHS.sfx, `${cue.id}.wav`);
    if (!fs.existsSync(f)) { console.warn(`thiếu SFX ${cue.id}`); continue; }
    place(load(f), s.start + cue.time, dbToGain(AUDIO.sfxGainDb + (cue.gainDb ?? 0)), (sfxCount % 3 - 1) * 0.15);
    sfxCount++;
  }

// 4) soft limiter
for (const ch of [L, R]) for (let i = 0; i < N; i++) { const x = ch[i]; ch[i] = Math.abs(x) < 0.8 ? x : Math.sign(x) * (0.8 + 0.2 * Math.tanh((Math.abs(x) - 0.8) / 0.2)); }

fs.mkdirSync(paths.out, { recursive: true });
const out = path.join(paths.out, "audio-mix.wav");
writeWav(out, [L, R], SR);
console.log(`Audio mix: ${sb.total_duration.toFixed(1)}s | voice ${voices} câu | SFX ${sfxCount} | → ${path.relative(process.cwd(), out)}`);
