// Logo kênh: bộ não "phẳng lỳ", bóng như gương (kiểu đầu trọc bóng), kèm mặt nhân vật với đôi mắt ngơ ngác.
//   npx tsx scripts/brand-logo.ts [--name="NÃO PHẲNG"] [--eyes=cross|up|dizzy]
import fs from "node:fs";
import path from "node:path";
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import { FONT, font, registerFonts, type Ctx } from "../src/components/canvas.js";
import { ROOT } from "../src/config/index.js";

const args = process.argv.slice(2);
const opt = (n: string, d: string) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const NAME = opt("name", "NÃO PHẲNG");
const EYES = opt("eyes", "cross");

const INK = "#151515", PAPER = "#f1ebe0", RED = "#e0362c";
const S = 900, CX = 450;
registerFonts();
const OUT = path.join(ROOT, "brand");
fs.mkdirSync(OUT, { recursive: true });

/** thân não nhìn ngang, dẹt, mặt nhẵn */
function bodyPath(x: Ctx, grow = 0) {
  const g = grow;
  x.beginPath();
  x.moveTo(130 - g, 500);
  x.bezierCurveTo(100 - g, 380, 200, 280 - g, 340, 262 - g);
  x.bezierCurveTo(470, 246 - g, 600, 262 - g, 690, 330 - g);
  x.bezierCurveTo(765 + g, 388, 770 + g, 480, 700, 540);
  x.bezierCurveTo(640, 590 + g, 480, 600 + g, 360, 592 + g);
  x.bezierCurveTo(240, 584 + g, 150, 560, 130 - g, 500);
  x.closePath();
}

function draw(x: Ctx, withBg: boolean) {
  if (withBg) { x.fillStyle = PAPER; x.beginPath(); x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); x.fill(); }
  x.lineJoin = "round"; x.lineCap = "round";
  x.save(); x.translate(0, -34); // nâng não lên để không chạm chữ

  // bóng đổ dưới não
  x.fillStyle = "rgba(21,21,21,0.10)"; x.beginPath(); x.ellipse(CX, 640, 290, 20, 0, 0, Math.PI * 2); x.fill();

  // tiểu não + cuống não (nằm sau thân, giúp nhận ra đây là bộ não)
  const back = x.createLinearGradient(0, 520, 0, 650);
  back.addColorStop(0, "#e9998a"); back.addColorStop(1, "#d57e72");
  x.fillStyle = back; x.strokeStyle = INK; x.lineWidth = 12;
  x.beginPath(); x.roundRect(498, 566, 64, 74, 22); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(640, 566, 112, 54, 0.08, 0, Math.PI * 2); x.fill(); x.stroke();
  x.strokeStyle = "rgba(120,50,45,0.35)"; x.lineWidth = 5;
  for (const dy of [-18, 0, 18]) { x.beginPath(); x.moveTo(570, 566 + dy); x.quadraticCurveTo(640, 556 + dy, 705, 566 + dy); x.stroke(); }

  // thân não: viền mực dày rồi tô gradient
  bodyPath(x); x.strokeStyle = INK; x.lineWidth = 22; x.stroke();
  const body = x.createLinearGradient(0, 262, 0, 600);
  body.addColorStop(0, "#fdd3c6"); body.addColorStop(0.45, "#f6b2a2"); body.addColorStop(1, "#e58f80");
  bodyPath(x); x.fillStyle = body; x.fill();

  x.save(); bodyPath(x); x.clip();
  // vài rãnh nông (nhẵn, không gồ ghề)
  x.strokeStyle = "rgba(170,75,65,0.38)"; x.lineWidth = 7;
  const groove = (pts: number[][]) => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i += 2) x.quadraticCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]); x.stroke(); };
  groove([[505, 262], [540, 320], [520, 372], [575, 410], [610, 395]]);
  groove([[600, 290], [650, 330], [640, 395], [690, 430], [740, 420]]);
  groove([[470, 440], [520, 470], [570, 450], [610, 505], [650, 500]]);
  groove([[205, 330], [250, 345], [255, 305], [300, 285], [330, 300]]);
  // phản chiếu bầu trời mờ (bề mặt cong như gương)
  const sky = x.createLinearGradient(0, 262, 0, 440);
  sky.addColorStop(0, "rgba(255,255,255,0.55)"); sky.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = sky; x.fillRect(0, 250, S, 200);
  // ánh phản xạ viền dưới
  const rim = x.createLinearGradient(0, 540, 0, 600);
  rim.addColorStop(0, "rgba(255,238,226,0)"); rim.addColorStop(1, "rgba(255,238,226,0.75)");
  x.fillStyle = rim; x.fillRect(0, 540, S, 70);
  // cửa sổ phản chiếu (2 ô) và vệt sáng dài
  x.save(); x.translate(250, 318); x.rotate(-0.4);
  x.fillStyle = "rgba(255,255,255,0.85)";
  x.beginPath(); x.roundRect(-58, -32, 52, 58, 10); x.fill();
  x.beginPath(); x.roundRect(4, -32, 52, 58, 10); x.fill();
  x.restore();
  x.save(); x.translate(690, 400); x.rotate(0.55);
  x.fillStyle = "rgba(255,255,255,0.72)"; x.beginPath(); x.roundRect(-10, -62, 20, 118, 10); x.fill();
  x.beginPath(); x.arc(0, 86, 10, 0, Math.PI * 2); x.fill();
  x.restore();
  x.restore();
  // đường viền sáng mảnh bên trong
  bodyPath(x, -9); x.strokeStyle = "rgba(255,255,255,0.35)"; x.lineWidth = 4; x.stroke();

  // ---- mặt nhân vật ----
  x.lineCap = "round"; x.lineJoin = "round";
  const eye = (ex: number, ey: number, r: number, px: number, py: number, pr: number) => {
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(ex, ey, r, 0, Math.PI * 2); x.fill();
    x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
    x.fillStyle = INK; x.beginPath(); x.arc(ex + px, ey + py, pr, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#fff"; x.beginPath(); x.arc(ex + px - pr * 0.3, ey + py - pr * 0.3, pr * 0.28, 0, Math.PI * 2); x.fill();
  };
  const FX = 345, ey = 428;
  if (EYES === "up") {
    eye(FX - 88, ey, 52, 6, -22, 19); eye(FX + 82, ey + 4, 56, -10, -24, 19);
  } else if (EYES === "dizzy") {
    eye(FX - 88, ey, 52, 0, 0, 12); eye(FX + 82, ey + 4, 56, 0, 0, 12);
  } else { // cross: lác vào trong, mắt to nhỏ khác nhau
    eye(FX - 88, ey + 2, 48, 22, 10, 20); eye(FX + 84, ey - 2, 58, -20, -2, 15);
  }
  // lông mày dày (nét của nhân vật)
  x.strokeStyle = INK; x.lineWidth = 16;
  x.beginPath(); x.moveTo(FX - 148, ey - 70); x.quadraticCurveTo(FX - 104, ey - 90, FX - 46, ey - 72); x.stroke();
  x.beginPath(); x.moveTo(FX + 34, ey - 92); x.quadraticCurveTo(FX + 98, ey - 104, FX + 150, ey - 76); x.stroke();
  // mũi (một nét cong nhỏ)
  x.lineWidth = 7; x.beginPath(); x.moveTo(FX + 4, ey + 50); x.quadraticCurveTo(FX - 8, ey + 68, FX + 6, ey + 74); x.stroke();
  // miệng há nhỏ, ngơ ngác
  x.fillStyle = INK; x.beginPath(); x.ellipse(FX + 2, ey + 104, 21, 16, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#d9534f"; x.beginPath(); x.ellipse(FX + 2, ey + 111, 12, 7, 0, 0, Math.PI * 2); x.fill();

  x.restore();
  // ---- chữ ----
  x.save(); x.translate(CX, 770); x.rotate(-0.03);
  x.font = font(108, FONT.xbold); x.textAlign = "center"; x.lineJoin = "round";
  x.strokeStyle = INK; x.lineWidth = 24; x.strokeText(NAME, 0, 0);
  x.fillStyle = RED; x.fillText(NAME, 0, 0);
  x.restore();
}

const save = (c: Canvas, name: string) => { const f = path.join(OUT, name); fs.writeFileSync(f, c.toBuffer("image/png")); console.log(path.relative(ROOT, f)); };
{
  const c = createCanvas(S, S); draw(c.getContext("2d"), true); save(c, `logo-circle-${EYES}.png`);
  // bản vuông nền kem (tải lên YouTube/TikTok, họ tự cắt tròn)
  const sq = createCanvas(S, S), sx = sq.getContext("2d"); sx.fillStyle = PAPER; sx.fillRect(0, 0, S, S); draw(sx, false); save(sq, `logo-square-${EYES}.png`);
  // bản nền trong suốt để chèn video/banner
  const tr = createCanvas(S, S); draw(tr.getContext("2d"), false); save(tr, `logo-transparent-${EYES}.png`);
}
