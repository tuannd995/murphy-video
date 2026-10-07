// Nhân vật vẽ tay bằng canvas: rig 2 xương cho tay/chân (IK), biểu cảm, chớp mắt, nhép miệng, nét "rung" như vẽ tay.
// Hệ toạ độ nhân vật: gốc (0,0) ở giữa hai bàn chân, y âm là hướng lên. Cao ~600px ở scale 1.
import type { Ctx } from "../components/canvas.js";
import { clamp, easeInOutCubic, lerp } from "../utils/anim.js";

export interface Look {
  skin: string;
  shirt: string;
  pants: string;
  shoes: string;
  hair: string;
  ink: string;
}

export const HERO_LOOK: Look = {
  skin: "#fbf7ee",
  shirt: "#8cc4e4",
  pants: "#2b3445",
  shoes: "#fbf7ee",
  hair: "#151515",
  ink: "#151515",
};

export type Eyes = "dot" | "wide" | "happy" | "closed" | "angry";
export type Brows = "neutral" | "up" | "angry" | "worried";
export type Mouth = "line" | "smile" | "grin" | "o" | "frown" | "smirk";
export type Extra = "sweat" | "shock" | "question" | "sparkle" | "none";

type V = { x: number; y: number };

export interface Pose {
  /** mục tiêu bàn tay (screen-left = L, screen-right = R) */
  lHand: V; rHand: V;
  /** hướng gập khuỷu: 1 = ra ngoài/xuống, -1 = vào trong */
  lBend?: number; rBend?: number;
  lFoot?: V; rFoot?: V;
  /** nghiêng người (rad), nghiêng đầu (rad), hạ/nhún hông (px) */
  lean?: number; headTilt?: number; crouch?: number;
  eyes?: Eyes; brows?: Brows; mouth?: Mouth; extra?: Extra;
  /** hướng nhìn của con ngươi -1..1 */
  gaze?: number;
}

export const POSES: Record<string, Pose> = {
  stand:    { lHand: { x: -88, y: -215 }, rHand: { x: 88, y: -215 }, eyes: "dot", brows: "neutral", mouth: "line" },
  happy:    { lHand: { x: -210, y: -560 }, rHand: { x: 210, y: -560 }, eyes: "happy", brows: "up", mouth: "grin", extra: "sparkle", crouch: -8 },
  think:    { lHand: { x: -70, y: -300 }, rHand: { x: 26, y: -440 }, rBend: -1, lBend: -1, headTilt: 0.08, eyes: "dot", brows: "worried", mouth: "smirk", extra: "question", gaze: 0.6 },
  shock:    { lHand: { x: -112, y: -585 }, rHand: { x: 112, y: -585 }, eyes: "wide", brows: "up", mouth: "o", extra: "sweat", crouch: 10 },
  point:    { lHand: { x: -88, y: -230 }, rHand: { x: 270, y: -470 }, eyes: "dot", brows: "up", mouth: "smile", gaze: 1, lean: 0.04 },
  facepalm: { lHand: { x: -80, y: -230 }, rHand: { x: 10, y: -525 }, rBend: -1, headTilt: 0.18, eyes: "closed", brows: "worried", mouth: "frown", lean: 0.05 },
  shrug:    { lHand: { x: -165, y: -375 }, rHand: { x: 165, y: -375 }, lBend: 1, rBend: 1, headTilt: -0.12, eyes: "dot", brows: "up", mouth: "smirk" },
  angry:    { lHand: { x: -70, y: -250 }, rHand: { x: 70, y: -250 }, lBend: -1, rBend: -1, eyes: "angry", brows: "angry", mouth: "frown", extra: "shock" },
};

export interface CharState {
  pose: Pose;
  /** 0..1 miệng mở khi nói (lip-sync); >0 sẽ thay hình miệng */
  talk?: number;
  /** thời gian (giây) để chớp mắt, thở, rung nét */
  t: number;
  /** đang đi bộ: pha 0..1 lặp */
  walk?: number;
}

// ---------- tiện ích ----------
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const lerpV = (a: V, b: V, p: number): V => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });

/** trộn hai tư thế (số thì nội suy, biểu cảm đổi ở giữa) */
export function blendPose(a: Pose, b: Pose, p: number): Pose {
  const e = easeInOutCubic(clamp(p));
  const n = (x?: number, y?: number, d = 0) => lerp(x ?? d, y ?? d, e);
  const pick = <T,>(x: T | undefined, y: T | undefined) => (e < 0.5 ? x : y);
  return {
    lHand: lerpV(a.lHand, b.lHand, e), rHand: lerpV(a.rHand, b.rHand, e),
    lBend: pick(a.lBend, b.lBend), rBend: pick(a.rBend, b.rBend),
    lFoot: a.lFoot || b.lFoot ? lerpV(a.lFoot ?? { x: -34, y: 0 }, b.lFoot ?? { x: -34, y: 0 }, e) : undefined,
    rFoot: a.rFoot || b.rFoot ? lerpV(a.rFoot ?? { x: 34, y: 0 }, b.rFoot ?? { x: 34, y: 0 }, e) : undefined,
    lean: n(a.lean, b.lean), headTilt: n(a.headTilt, b.headTilt), crouch: n(a.crouch, b.crouch), gaze: n(a.gaze, b.gaze),
    eyes: pick(a.eyes, b.eyes), brows: pick(a.brows, b.brows), mouth: pick(a.mouth, b.mouth), extra: pick(a.extra, b.extra),
  };
}

/** nét rung kiểu vẽ tay: đổi 8 lần/giây, ổn định giữa các frame trong cùng nhịp */
function makeJitter(t: number, amp: number) {
  const boil = Math.floor(t * 8);
  return (x: number, y: number) => {
    const h = Math.sin(x * 12.9898 + y * 78.233 + boil * 37.719) * 43758.5453;
    const h2 = Math.sin(x * 39.346 + y * 11.135 + boil * 91.17) * 24634.6345;
    return { x: x + ((h - Math.floor(h)) - 0.5) * amp, y: y + ((h2 - Math.floor(h2)) - 0.5) * amp };
  };
}

/** IK 2 xương: trả về khớp giữa (khuỷu/gối) */
function ik(root: V, target: V, a: number, b: number, bend: number): { mid: V; end: V } {
  let dx = target.x - root.x, dy = target.y - root.y;
  let d = Math.hypot(dx, dy);
  const maxD = a + b - 0.5;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  const end = { x: root.x + dx, y: root.y + dy };
  const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
  const base = Math.atan2(dy, dx);
  const ang = base + bend * Math.acos(cosA);
  return { mid: { x: root.x + Math.cos(ang) * a, y: root.y + Math.sin(ang) * a }, end };
}

export interface DrawOpts {
  x: number; y: number; scale: number;
  look?: Look;
  /** độ rung nét (px), 0 = tắt */
  wobble?: number;
  /** lật ngang (nhìn sang trái) */
  flip?: boolean;
}

export function drawDoodle(ctx: Ctx, st: CharState, o: DrawOpts) {
  const L = o.look ?? HERO_LOOK;
  const P = st.pose;
  const t = st.t;
  const J = makeJitter(t, o.wobble ?? 2.2);
  const LW = 6;

  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(o.scale * (o.flip ? -1 : 1), o.scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // thở + đi bộ
  const breathe = Math.sin(t * 2.2) * 3;
  const w = st.walk;
  const walkBob = w !== undefined ? Math.abs(Math.sin(w * Math.PI * 2)) * -10 : 0;
  const crouch = (P.crouch ?? 0) + breathe * 0.3 + walkBob;
  const hip: V = { x: 0, y: -215 + crouch };
  const lean = P.lean ?? 0;
  const shoulderY = -392 + crouch + breathe;
  const sh = (side: number): V => ({ x: side * 66 + Math.sin(lean) * 180, y: shoulderY });
  const neck: V = { x: Math.sin(lean) * 200, y: -405 + crouch + breathe };
  const headC: V = { x: neck.x + Math.sin(lean) * 40, y: -512 + crouch + breathe * 1.1 };

  // chân (IK) — khi đi bộ bàn chân lần lượt nhấc lên
  const feet = (side: number): V => {
    let f = side < 0 ? P.lFoot ?? { x: -34, y: 0 } : P.rFoot ?? { x: 34, y: 0 };
    if (w !== undefined) {
      const ph = w * Math.PI * 2 + (side < 0 ? 0 : Math.PI);
      f = { x: f.x + Math.sin(ph) * 26, y: Math.min(0, -Math.cos(ph) * 34) };
    }
    return f;
  };

  const tube = (pts: V[], width: number, color: string) => {
    const jp = pts.map((p) => J(p.x, p.y));
    for (const [c, wd] of [[L.ink, width + LW * 2], [color, width]] as const) {
      ctx.strokeStyle = c;
      ctx.lineWidth = wd;
      ctx.beginPath();
      ctx.moveTo(jp[0].x, jp[0].y);
      for (let i = 1; i < jp.length; i++) ctx.lineTo(jp[i].x, jp[i].y);
      ctx.stroke();
    }
  };
  const blob = (pts: V[], fill: string, close = true) => {
    const jp = pts.map((p) => J(p.x, p.y));
    ctx.beginPath();
    ctx.moveTo(jp[0].x, jp[0].y);
    for (let i = 1; i < jp.length; i++) {
      const p0 = jp[i - 1], p1 = jp[i];
      ctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    }
    if (close) ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = L.ink; ctx.lineWidth = LW; ctx.stroke();
  };
  const ellipsePts = (c: V, rx: number, ry: number, n = 28, rot = 0) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      return { x: c.x + x * Math.cos(rot) - y * Math.sin(rot), y: c.y + x * Math.sin(rot) + y * Math.cos(rot) };
    });

  // ---- chân + giày
  for (const side of [-1, 1]) {
    const root = { x: hip.x + side * 30, y: hip.y };
    const f = feet(side);
    const leg = ik(root, { x: f.x, y: f.y - 18 }, 100, 99, side > 0 ? -1 : 1); // gối hơi hướng ra ngoài
    tube([root, leg.mid, leg.end], 38, L.pants);
    blob(ellipsePts({ x: leg.end.x + side * 10, y: leg.end.y + 10 }, 32, 15, 20), L.shoes);
  }

  // ---- thân áo
  const s0 = sh(-1), s1 = sh(1);
  blob([
    { x: s0.x - 8, y: s0.y - 6 }, { x: neck.x, y: neck.y - 2 }, { x: s1.x + 8, y: s1.y - 6 },
    { x: s1.x + 6, y: hip.y + 8 }, { x: hip.x, y: hip.y + 14 }, { x: s0.x - 6, y: hip.y + 8 },
  ], L.shirt);
  // cổ áo
  const jc = [J(neck.x - 26, neck.y + 6), J(neck.x, neck.y + 22), J(neck.x + 26, neck.y + 6)];
  ctx.strokeStyle = L.ink; ctx.lineWidth = LW * 0.8;
  ctx.beginPath(); ctx.moveTo(jc[0].x, jc[0].y); ctx.quadraticCurveTo(jc[1].x, jc[1].y, jc[2].x, jc[2].y); ctx.stroke();

  // ---- đầu
  ctx.save();
  ctx.translate(headC.x, headC.y);
  ctx.rotate(P.headTilt ?? 0);
  ctx.scale(1.28, 1.28);
  // tai
  for (const side of [-1, 1]) blob(ellipsePts({ x: side * 86, y: 6 }, 16, 20, 16), L.skin);
  // mặt
  blob(ellipsePts({ x: 0, y: 0 }, 86, 92, 36), L.skin);
  // tóc: vòm tóc ôm đầu, 5 chỏm nhọn trên đỉnh, mái lởm chởm
  const hairPts: V[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI * 1.06 + (i / 24) * Math.PI * 0.88;
    const tuft = i >= 7 && i <= 17 && i % 2 === 1 ? 22 + (i === 11 ? 10 : 0) : 0;
    const r = 96 + tuft;
    hairPts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r - 4 });
  }
  hairPts.push({ x: 84, y: -14 }, { x: 70, y: -40 }, { x: 46, y: -30 }, { x: 24, y: -50 }, { x: 0, y: -34 }, { x: -24, y: -52 }, { x: -50, y: -36 }, { x: -72, y: -42 }, { x: -86, y: -12 });
  const jh = hairPts.map((p) => J(p.x, p.y));
  ctx.beginPath(); ctx.moveTo(jh[0].x, jh[0].y);
  for (const p of jh.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.closePath(); ctx.fillStyle = L.hair; ctx.fill();
  ctx.strokeStyle = L.ink; ctx.lineWidth = LW * 0.6; ctx.stroke();

  // mắt + chớp
  const blinkPhase = (t % 3.7) / 3.7;
  const blink = blinkPhase > 0.96 ? 0.1 : 1;
  const gx = (P.gaze ?? 0) * 6;
  ctx.fillStyle = L.ink; ctx.strokeStyle = L.ink;
  for (const side of [-1, 1]) {
    const ex = side * 32, ey = 4;
    const eyes = P.eyes ?? "dot";
    ctx.lineWidth = LW * 0.8;
    if (eyes === "closed" || blink < 0.5) {
      ctx.beginPath(); ctx.moveTo(ex - 12, ey); ctx.quadraticCurveTo(ex, ey + 6, ex + 12, ey); ctx.stroke();
    } else if (eyes === "happy") {
      ctx.beginPath(); ctx.moveTo(ex - 13, ey + 4); ctx.quadraticCurveTo(ex, ey - 12, ex + 13, ey + 4); ctx.stroke();
    } else if (eyes === "wide") {
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, 22, 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = L.ink; ctx.beginPath(); ctx.arc(ex + gx, ey, 7, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.ellipse(ex + gx, ey, 7.5, 11 * blink, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // lông mày
  const brows = P.brows ?? "neutral";
  ctx.lineWidth = 11;
  for (const side of [-1, 1]) {
    const bx = side * 34;
    let by = -36, inner = 0, outer = 0;
    if (brows === "up") { by = -48; }
    if (brows === "angry") { inner = 10; outer = -6; }
    if (brows === "worried") { inner = -10; outer = 4; }
    const a = J(bx - side * 16, by + inner), b = J(bx + side * 18, by + outer);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  // mũi
  ctx.lineWidth = LW * 0.6;
  ctx.beginPath(); ctx.moveTo(4, 18); ctx.quadraticCurveTo(-6, 30, 4, 34); ctx.stroke();
  // miệng (lip-sync ưu tiên)
  const talk = clamp(st.talk ?? 0);
  ctx.lineWidth = LW * 0.8;
  const mouth = P.mouth ?? "line";
  if (talk > 0.06) {
    ctx.fillStyle = L.ink;
    ctx.beginPath(); ctx.ellipse(0, 54, 12 + talk * 6, 3 + talk * 17, 0, 0, Math.PI * 2); ctx.fill();
    if (talk > 0.4) { ctx.fillStyle = "#d9534f"; ctx.beginPath(); ctx.ellipse(0, 54 + talk * 9, 7, talk * 6, 0, 0, Math.PI * 2); ctx.fill(); }
  } else if (mouth === "smile") {
    ctx.beginPath(); ctx.moveTo(-18, 50); ctx.quadraticCurveTo(0, 64, 18, 50); ctx.stroke();
  } else if (mouth === "grin") {
    ctx.fillStyle = L.ink; ctx.beginPath(); ctx.moveTo(-26, 46); ctx.quadraticCurveTo(0, 84, 26, 46); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#d9534f"; ctx.beginPath(); ctx.ellipse(0, 62, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
  } else if (mouth === "o") {
    ctx.fillStyle = L.ink; ctx.beginPath(); ctx.ellipse(0, 58, 12, 18, 0, 0, Math.PI * 2); ctx.fill();
  } else if (mouth === "frown") {
    ctx.beginPath(); ctx.moveTo(-16, 60); ctx.quadraticCurveTo(0, 48, 16, 60); ctx.stroke();
  } else if (mouth === "smirk") {
    ctx.beginPath(); ctx.moveTo(-14, 54); ctx.quadraticCurveTo(6, 58, 18, 48); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-12, 54); ctx.lineTo(12, 54); ctx.stroke();
  }
  ctx.restore();

  // ---- tay (vẽ sau đầu để có thể che mặt)
  for (const side of [-1, 1]) {
    const root = sh(side);
    const target = side < 0 ? P.lHand : P.rHand;
    const swing = w !== undefined ? Math.sin(w * Math.PI * 2 + (side < 0 ? Math.PI : 0)) * 30 : 0;
    const tgt = add(target, { x: swing, y: crouch + breathe * 0.5 });
    const bendPref = (side < 0 ? P.lBend : P.rBend) ?? 1;
    const arm = ik(root, tgt, 98, 92, side > 0 ? -bendPref : bendPref);
    tube([root, arm.mid, arm.end], 32, L.shirt);
    blob(ellipsePts(arm.end, 16, 16, 14), L.skin);
  }

  // ---- hiệu ứng
  const extra = P.extra ?? "none";
  if (extra === "sweat") {
    for (const [dx, dy, s] of [[-150, -600, 1], [150, -630, 0.8], [165, -560, 0.7]] as const) {
      const yy = dy + crouch + ((t * 40) % 20);
      ctx.save(); ctx.translate(dx, yy); ctx.scale(s, s);
      ctx.fillStyle = "#8cc4e4"; ctx.strokeStyle = L.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(14, 4, 0, 10); ctx.quadraticCurveTo(-14, 4, 0, -18); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  if (extra === "shock") {
    ctx.strokeStyle = L.ink; ctx.lineWidth = 5;
    for (const [a, r] of [[-2.4, 165], [-2.0, 175], [-1.15, 175], [-0.75, 165]] as const) {
      const cx = headC.x, cy = headC.y;
      const p0 = J(cx + Math.cos(a) * r, cy + Math.sin(a) * r), p1 = J(cx + Math.cos(a) * (r + 30), cy + Math.sin(a) * (r + 30));
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
  }
  if (extra === "question") {
    ctx.fillStyle = L.ink; ctx.font = "bold 90px InterXB, sans-serif"; ctx.textAlign = "center";
    ctx.save(); ctx.translate(headC.x + 175, headC.y - 110 + Math.sin(t * 3) * 6); ctx.rotate(0.15); ctx.fillText("?", 0, 0); ctx.restore();
  }
  if (extra === "sparkle") {
    ctx.strokeStyle = "#e0362c"; ctx.lineWidth = 5;
    for (const [dx, dy] of [[-170, -640], [180, -650], [0, -690]] as const) {
      const s = 12 + Math.sin(t * 6 + dx) * 4;
      ctx.beginPath(); ctx.moveTo(dx - s, dy); ctx.lineTo(dx + s, dy); ctx.moveTo(dx, dy - s); ctx.lineTo(dx, dy + s); ctx.stroke();
    }
  }
  ctx.restore();
}
