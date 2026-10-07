// Easing + helpers cho animation (thời gian tính bằng giây).

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutBounce = (t: number) => {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

/** tiến độ 0..1 của t trong đoạn [start, start+dur] */
export const prog = (t: number, start: number, dur: number) => clamp((t - start) / Math.max(dur, 1e-6));

/** tween với easing */
export const tween = (t: number, start: number, dur: number, from: number, to: number, ease = easeInOutCubic) =>
  lerp(from, to, ease(prog(t, start, dur)));

/** độ hiện: fade in tại `start`, fade out tại `end` */
export const appear = (t: number, start: number, end = Infinity, fade = 0.35) =>
  Math.min(easeOutCubic(prog(t, start, fade)), 1 - easeInCubic(prog(t, end - fade, fade)));

/** rung có suy giảm, bắt đầu ở `start` */
export const shake = (t: number, start: number, dur = 0.5, amp = 14, seed = 1) => {
  const p = (t - start) / dur;
  if (p < 0 || p > 1) return { x: 0, y: 0 };
  const k = amp * (1 - p) * (1 - p);
  return { x: Math.sin(t * 61 + seed) * k, y: Math.cos(t * 47 + seed * 2) * k * 0.6 };
};

/** PRNG có seed để particles ổn định giữa các frame */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
