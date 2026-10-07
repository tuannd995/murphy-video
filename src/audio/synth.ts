// Tổng hợp SFX + nhạc nền hoàn toàn local (không cần API, không bản quyền).
import { rng } from "../utils/anim.js";

export const SR = 48000;
type Buf = Float32Array;

const buf = (sec: number) => new Float32Array(Math.ceil(sec * SR));
const TAU = Math.PI * 2;

function noise(seed = 7) {
  const r = rng(seed);
  return () => r() * 2 - 1;
}

/** one-pole lowpass, cutoff có thể thay đổi theo mẫu */
function lowpass(x: Buf, cutoff: (i: number) => number): Buf {
  const y = new Float32Array(x.length);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    const a = 1 - Math.exp((-TAU * cutoff(i)) / SR);
    s += a * (x[i] - s);
    y[i] = s;
  }
  return y;
}

function bandNoise(sec: number, lo: (t: number) => number, hi: (t: number) => number, seed = 3): Buf {
  const n = noise(seed), x = buf(sec);
  for (let i = 0; i < x.length; i++) x[i] = n();
  const a = lowpass(x, (i) => hi(i / SR));
  const b = lowpass(a, (i) => lo(i / SR));
  return a.map((v, i) => v - b[i]);
}

function env(x: Buf, f: (t: number) => number): Buf {
  for (let i = 0; i < x.length; i++) x[i] *= f(i / SR);
  return x;
}

function mixInto(dst: Buf, src: Buf, at: number, gain = 1) {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * gain;
}

function normalize(x: Buf, peak = 0.89): Buf {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < x.length; i++) x[i] *= peak / m;
  return x;
}

function tone(sec: number, freq: (t: number) => number, shape: (ph: number) => number = Math.sin, amp: (t: number) => number = () => 1): Buf {
  const x = buf(sec);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    ph += (TAU * freq(t)) / SR;
    x[i] = shape(ph) * amp(t);
  }
  return x;
}

const tri = (ph: number) => (2 / Math.PI) * Math.asin(Math.sin(ph));
const softSquare = (ph: number) => Math.tanh(3 * Math.sin(ph));
const adsr = (a: number, d: number, s: number, r: number, len: number) => (t: number) =>
  t < a ? t / a : t < a + d ? 1 - (1 - s) * ((t - a) / d) : t < len - r ? s : Math.max(0, s * ((len - t) / r));

function pluck(freq: number, sec: number, seed: number, damp = 0.996): Buf {
  const n = Math.max(2, Math.round(SR / freq));
  const r = noise(seed);
  const ring = new Float32Array(n).map(() => r());
  const x = buf(sec);
  let idx = 0;
  for (let i = 0; i < x.length; i++) {
    const nxt = (idx + 1) % n;
    const v = damp * 0.5 * (ring[idx] + ring[nxt]);
    x[i] = ring[idx];
    ring[idx] = v;
    idx = nxt;
  }
  return lowpass(x, () => 3200);
}

// ---------- SFX ----------
export const SFX: Record<string, () => Buf> = {
  whoosh: () => env(bandNoise(0.6, (t) => 300 + 2400 * Math.sin((Math.PI * t) / 0.6), (t) => 900 + 5000 * Math.sin((Math.PI * t) / 0.6)), (t) => Math.pow(Math.sin((Math.PI * t) / 0.6), 2)),
  pop: () => tone(0.12, (t) => 900 * Math.exp(-t * 25) + 220, Math.sin, (t) => Math.exp(-t * 32)),
  ding: () => {
    const a = tone(1.2, () => 1318.5, Math.sin, (t) => Math.exp(-t * 4.5));
    const b = tone(1.2, () => 2637, Math.sin, (t) => 0.35 * Math.exp(-t * 7));
    return a.map((v, i) => v + b[i]);
  },
  thud: () => {
    const body = tone(0.45, (t) => 95 * Math.exp(-t * 4) + 40, Math.sin, (t) => Math.exp(-t * 9));
    const hit = env(lowpass(bandNoise(0.12, () => 60, () => 1500, 9), () => 1200), (t) => Math.exp(-t * 40));
    mixInto(body, hit, 0, 0.8);
    return body;
  },
  click: () => {
    const x = env(bandNoise(0.03, () => 1500, () => 9000, 4), (t) => Math.exp(-t * 300));
    mixInto(x, tone(0.03, () => 2400, Math.sin, (t) => 0.5 * Math.exp(-t * 200)), 0);
    return x;
  },
  error: () => {
    const x = buf(0.42);
    mixInto(x, tone(0.16, () => 233, softSquare, adsr(0.005, 0.05, 0.7, 0.04, 0.16)), 0, 0.6);
    mixInto(x, tone(0.2, () => 196, softSquare, adsr(0.005, 0.05, 0.7, 0.06, 0.2)), 0.19, 0.6);
    return lowpass(x, () => 2200);
  },
  success: () => {
    const x = buf(1.0);
    [523.25, 659.25, 783.99].forEach((f, k) => mixInto(x, tone(0.7, () => f, tri, (t) => Math.exp(-t * 5)), k * 0.09, 0.6));
    return x;
  },
  crank: () => {
    // động cơ đề không nổ: 4 nhịp "rừ" + hụt hơi
    const x = buf(2.0);
    for (let k = 0; k < 5; k++) {
      const s = env(lowpass(bandNoise(0.26, () => 70, () => 900, 20 + k), () => 700), (t) => Math.sin((Math.PI * t) / 0.26) * (1 - k * 0.15));
      const motor = tone(0.26, () => 38 - k * 2, softSquare, (t) => 0.5 * Math.sin((Math.PI * t) / 0.26) * (1 - k * 0.15));
      mixInto(x, s, k * 0.3, 1);
      mixInto(x, motor, k * 0.3, 0.7);
    }
    return x;
  },
  rain: () => {
    const sec = 8;
    const x = env(bandNoise(sec, () => 400, () => 6000, 11), (t) => Math.min(1, t / 1.5, (sec - t) / 1.5) * 0.5);
    const r = rng(5);
    for (let k = 0; k < 260; k++) {
      const drop = tone(0.03, () => 2500 + r() * 3000, Math.sin, (t) => Math.exp(-t * 180));
      const at = r() * (sec - 0.1);
      mixInto(x, drop, at, 0.25 * Math.min(1, at / 1.5, (sec - at) / 1.5));
    }
    return x;
  },
  tick: () => {
    const x = buf(4.2);
    for (let k = 0; k < 4; k++) mixInto(x, tone(0.04, () => (k % 2 ? 1800 : 2200), Math.sin, (t) => Math.exp(-t * 160)), k * 1.0);
    return x;
  },
  scratch: () => {
    const sec = 0.5;
    return env(bandNoise(sec, (t) => 400 + 1800 * Math.abs(Math.sin(t * 22)), (t) => 1200 + 3500 * Math.abs(Math.sin(t * 22)), 13), (t) => Math.sin((Math.PI * t) / sec));
  },
  typing: () => {
    const x = buf(2.6), r = rng(17);
    let t = 0.02;
    while (t < 2.4) {
      const c = env(bandNoise(0.025, () => 1200, () => 7000, Math.floor(r() * 1000)), (u) => Math.exp(-u * 250));
      mixInto(x, c, t, 0.5 + r() * 0.5);
      t += 0.06 + r() * 0.12;
    }
    return x;
  },
  bubble: () => tone(0.22, (t) => 280 + 1300 * t + 40 * Math.sin(t * 90), Math.sin, (t) => Math.sin((Math.PI * t) / 0.22) * Math.exp(-t * 6)),
  swell: () => {
    const sec = 1.8;
    const x = env(bandNoise(sec, () => 200, (t) => 600 + 3000 * (t / sec), 21), (t) => Math.pow(t / sec, 2) * (t < sec - 0.05 ? 1 : (sec - t) / 0.05));
    mixInto(x, tone(sec, (t) => 220 + 220 * (t / sec), tri, (t) => 0.35 * Math.pow(t / sec, 2)), 0);
    return x;
  },
  glitch: () => {
    const x = buf(0.7), r = rng(29);
    for (let k = 0; k < 9; k++) {
      const len = 0.03 + r() * 0.06;
      const f = 200 + r() * 1800;
      mixInto(x, tone(len, () => f, (ph) => Math.sign(Math.sin(ph)), () => 0.5), r() * 0.6);
    }
    return x;
  },
};

export function renderSfx(id: string): Buf {
  const f = SFX[id];
  if (!f) throw new Error(`SFX không tồn tại: ${id}`);
  return normalize(f(), 0.8);
}

// ---------- Nhạc nền ----------
const NOTE = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface Mood { bpm: number; bars: number; chords: number[][]; seed: number; pluckGain: number }
const MOODS: Record<string, Mood> = {
  // C – Am – F – G (hơi tinh nghịch)
  curious: { bpm: 100, bars: 16, seed: 1, pluckGain: 0.32, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]] },
  // F – G – Em – Am (ấm, kết)
  warm: { bpm: 82, bars: 12, seed: 2, pluckGain: 0.26, chords: [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 62], [57, 60, 64, 67]] },
};

/** trả về [L, R] — loop đúng số ô nhịp để lặp liền mạch */
export function renderMusic(mood: keyof typeof MOODS): [Buf, Buf] {
  const m = MOODS[mood];
  const beat = 60 / m.bpm, bar = beat * 4, sec = bar * m.bars;
  const L = buf(sec), R = buf(sec);
  const r = rng(m.seed);
  for (let b = 0; b < m.bars; b++) {
    const ch = m.chords[b % m.chords.length], t0 = b * bar;
    // pad: tam giác hơi lệch tông, lowpass
    for (const [k, note] of ch.entries()) {
      const f = NOTE(note);
      const pad = tone(bar + 0.3, (t) => f * (1 + 0.0025 * Math.sin(t * 2.1 + k)), tri, adsr(0.6, 0.4, 0.8, 0.5, bar + 0.3));
      const lp = lowpass(pad, () => 1100);
      mixInto(L, lp, t0, k % 2 ? 0.05 : 0.07);
      mixInto(R, lp, t0, k % 2 ? 0.07 : 0.05);
    }
    // bass
    const bass = tone(bar, () => NOTE(ch[0] - 24), Math.sin, adsr(0.02, 0.3, 0.6, 0.2, bar));
    mixInto(L, bass, t0, 0.16);
    mixInto(R, bass, t0, 0.16);
    // arpeggio pluck theo móc đơn
    const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
    for (let s = 0; s < 8; s++) {
      if (r() < 0.18) continue; // nghỉ ngẫu nhiên cho tự nhiên
      const note = ch[pattern[s]] + 12;
      const p = pluck(NOTE(note), 0.9, m.seed * 100 + b * 8 + s);
      const pan = 0.5 + 0.35 * Math.sin(s * 1.3);
      mixInto(L, p, t0 + s * (beat / 2), m.pluckGain * (1 - pan) * 2 * 0.5);
      mixInto(R, p, t0 + s * (beat / 2), m.pluckGain * pan * 2 * 0.5);
    }
    // nhịp nhẹ: kick mềm phách 1 & 3, shaker
    for (const q of [0, 2]) mixInto(L, tone(0.25, (t) => 60 * Math.exp(-t * 12) + 45, Math.sin, (t) => Math.exp(-t * 14)), t0 + q * beat, 0.18);
    for (const q of [0, 2]) mixInto(R, tone(0.25, (t) => 60 * Math.exp(-t * 12) + 45, Math.sin, (t) => Math.exp(-t * 14)), t0 + q * beat, 0.18);
    for (let q = 0; q < 8; q++) {
      const sh = env(bandNoise(0.06, () => 5000, () => 12000, b * 8 + q + 300), (t) => Math.exp(-t * 60));
      mixInto(q % 2 ? L : R, sh, t0 + q * (beat / 2), q % 2 ? 0.05 : 0.03);
    }
  }
  const peakNorm = (x: Buf) => normalize(x, 0.7);
  return [peakNorm(L), peakNorm(R)];
}
