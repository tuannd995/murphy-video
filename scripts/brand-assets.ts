// Bộ nhận diện kênh: ảnh đại diện, banner, watermark, mẫu thumbnail. Dựng bằng canvas từ bộ tư thế nhân vật, $0.
//   npx tsx scripts/brand-assets.ts [characterId] [--name="Não Phẳng"] [--tagline="..."]
import fs from "node:fs";
import path from "node:path";
import { createCanvas, type Canvas, type Image } from "@napi-rs/canvas";
import { FONT, font, registerFonts, type Ctx } from "../src/components/canvas.js";
import { drawSprite, loadSprites, type SpriteChar } from "../src/character/sprites.js";
import { ROOT } from "../src/config/index.js";
import { BRAND, bulb, chip, sparkle, wordmark } from "../src/brand/draw.js";

const args = process.argv.slice(2);
const charId = args.find((a) => !a.startsWith("--")) ?? "hero";
const opt = (n: string, d: string) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const NAME = opt("name", "NÃO PHẲNG");
const TAGLINE = opt("tagline", "Những câu hỏi kỳ lạ, kể cho não nghỉ ngơi");
const SCHEDULE = opt("schedule", "Video mới thứ Năm & Chủ nhật");

const INK = "#151515", PAPER = "#f6eedc", PAPER2 = "#efe3c8", RED = "#e0362c";
const OUT = path.join(ROOT, "brand");
fs.mkdirSync(OUT, { recursive: true });
registerFonts();
const ch = await loadSprites(charId);

const save = (c: Canvas, name: string) => {
  const f = path.join(OUT, name);
  fs.writeFileSync(f, c.toBuffer("image/png"));
  console.log(path.relative(ROOT, f));
};

function paper(ctx: Ctx, w: number, h: number) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, w, h);
  // vân giấy nhẹ, cố định theo seed
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < (w * h) / 900; i++) { ctx.fillStyle = `rgba(120,95,40,${0.02 + r() * 0.03})`; ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 1 + r() * 2); }
}

function rays(ctx: Ctx, cx: number, cy: number, r: number, n = 18) {
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = PAPER2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = a + Math.PI / n;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(b) * r, Math.sin(b) * r); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** chữ nhiều đoạn, mỗi đoạn một màu; đoạn đỏ có viền mực dày kiểu sticker */
type Seg = { t: string; red?: boolean };
function headline(ctx: Ctx, lines: Seg[][], x: number, y: number, size: number, align: "left" | "center" = "left") {
  ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round";
  lines.forEach((segs, li) => {
    ctx.font = font(size, FONT.xbold);
    const widths = segs.map((s) => ctx.measureText(s.t).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = align === "center" ? x - total / 2 : x;
    const cy = y + li * size * 1.08;
    segs.forEach((s, i) => {
      if (s.red) { ctx.strokeStyle = INK; ctx.lineWidth = size * 0.2; ctx.strokeText(s.t, cx, cy); ctx.fillStyle = RED; }
      else ctx.fillStyle = INK;
      ctx.textAlign = "left"; ctx.fillText(s.t, cx, cy);
      cx += widths[i];
    });
  });
}

function bigMark(ctx: Ctx, mark: string, x: number, y: number, size: number, rot: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = font(size, FONT.xbold); ctx.textAlign = "center"; ctx.lineJoin = "round";
  ctx.strokeStyle = INK; ctx.lineWidth = size * 0.16; ctx.strokeText(mark, 0, 0); ctx.fillStyle = RED; ctx.fillText(mark, 0, 0); ctx.restore();
}

function sprite(ctx: Ctx, pose: string, x: number, y: number, height: number, flip = false) {
  drawSprite(ctx, ch, { pose, poseStart: -10, t: 5 }, { x, y, height, flip, shadow: false });
}

/** cắt phần đầu của tư thế đứng làm ảnh đại diện */
function headCrop(img: Image) {
  const w = img.width, h = img.height;
  const sy = 0, sh = h * 0.36, sw = Math.min(w, sh * 1.15), sx = (w - sw) / 2;
  return { sx, sy, sw, sh };
}

// ---------- 1. Ảnh đại diện 800×800 ----------
{
  const c = createCanvas(800, 800), x = c.getContext("2d");
  paper(x, 800, 800); rays(x, 400, 430, 700, 20);
  const img = ch.img.get("stand")!; const { sx, sy, sw, sh } = headCrop(img);
  const scale = 640 / sh; const dw = sw * scale, dh = sh * scale;
  x.drawImage(img, sx, sy, sw, sh, 400 - dw / 2, 120, dw, dh);
  save(c, "avatar-800.png");
  // bản xem trước dạng tròn như YouTube hiển thị
  const p = createCanvas(240, 240), px = p.getContext("2d");
  px.beginPath(); px.arc(120, 120, 120, 0, Math.PI * 2); px.clip(); px.drawImage(c, 0, 0, 240, 240);
  save(p, "avatar-preview-circle.png");
}

// ---------- 2. Watermark 150×150 (nền trong suốt) ----------
{
  const c = createCanvas(150, 150), x = c.getContext("2d");
  x.fillStyle = PAPER; x.beginPath(); x.arc(75, 75, 72, 0, Math.PI * 2); x.fill();
  x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.save(); x.beginPath(); x.arc(75, 75, 69, 0, Math.PI * 2); x.clip();
  const img = ch.img.get("stand")!; const { sx, sy, sw, sh } = headCrop(img);
  const s = 118 / sh; x.drawImage(img, sx, sy, sw, sh, 75 - (sw * s) / 2, 24, sw * s, sh * s);
  x.restore();
  save(c, "watermark-150.png");
}

// ---------- 3. Banner 2560×1440 (vùng an toàn 1546×423 ở giữa) ----------
{
  const W = 2560, H = 1440, c = createCanvas(W, H), x = c.getContext("2d");
  paper(x, W, H); rays(x, W / 2, H / 2, 2200, 28);
  // chi tiết trang trí nằm NGOÀI vùng an toàn (chỉ hiện trên TV/máy tính)
  const deco: [string, number, number, number, number][] = [
    ["?", 330, 360, 220, -0.2], ["?", 2250, 1090, 260, 0.25], ["!", 2330, 330, 200, 0.18], ["?", 250, 1120, 180, 0.2],
    ["?", 760, 160, 120, 0.3], ["!", 1850, 1280, 130, -0.25],
  ];
  for (const [m, dx, dy, sz, r] of deco) bigMark(x, m, dx, dy, sz, r);
  // vùng an toàn
  const sx0 = (W - 1546) / 2, sy0 = (H - 423) / 2;
  sprite(x, "think", sx0 + 190, sy0 + 440, 440);
  const nx = sx0 + 400, ny = sy0 + 264;
  wordmark(x, NAME, nx, ny, 188, { align: "left", rot: -0.02 });
  x.textAlign = "left"; x.textBaseline = "alphabetic";
  x.font = font(50, FONT.round); x.fillStyle = RED; x.fillText(TAGLINE, nx + 8, ny + 82);
  x.font = font(38, FONT.round); x.fillStyle = INK; x.fillText(SCHEDULE, nx + 8, ny + 128);
  // bóng đèn và lấp lánh quanh tên kênh (trong vùng an toàn) + ngoài vùng an toàn
  bulb(x, sx0 + 1400, sy0 + 130, 112, { rot: 0.2 });
  sparkle(x, nx - 36, sy0 + 70, 24); sparkle(x, sx0 + 1490, sy0 + 330, 18, "#fff", true, 0.3);
  sparkle(x, 480, 700, 34, BRAND.yellow, true, 0.2); sparkle(x, 2150, 720, 40, BRAND.yellow, true, -0.2); sparkle(x, 1900, 260, 28, "#fff", true, 0.4);
  save(c, "banner-2560x1440.png");
  // xem trước: khung vùng an toàn
  const p = createCanvas(1280, 720), px = p.getContext("2d");
  px.drawImage(c, 0, 0, 1280, 720);
  px.strokeStyle = "rgba(224,54,44,0.9)"; px.lineWidth = 3; px.setLineDash([12, 8]);
  px.strokeRect(sx0 / 2, sy0 / 2, 1546 / 2, 423 / 2);
  save(p, "banner-preview-safe-area.png");
}

// ---------- 4. Mẫu thumbnail video 1280×720 ----------
const thumbs: { file: string; lines: Seg[][]; pose: string; mark: string; tag?: string; flip?: boolean }[] = [
  { file: "thumb-sample-1-what-if.png", lines: [[{ t: "NẾU TRÁI ĐẤT" }], [{ t: "NGỪNG QUAY", red: true }], [{ t: "1 GIÂY?" }]], pose: "shock", mark: "?", tag: "NẾU… THÌ SAO?" },
  { file: "thumb-sample-2-curiosity.png", lines: [[{ t: "VÌ SAO TA" }], [{ t: "HAY QUÊN", red: true }], [{ t: "TÊN NGƯỜI?" }]], pose: "think", mark: "?", tag: "CÂU HỎI KỲ LẠ" },
  { file: "thumb-sample-3-paradox.png", lines: [[{ t: "BÁNH MÌ" }], [{ t: "LUÔN ÚP BƠ", red: true }], [{ t: "XUỐNG SÀN?" }]], pose: "facepalm", mark: "!", tag: "NGHỊCH LÝ ĐỜI THƯỜNG" },
];
/** dòng chữ nhiều đoạn: đoạn "red" dùng gradient vàng → đỏ, đoạn thường trắng viền mực; cả khối nghiêng nhẹ */
function title(x: Ctx, lines: Seg[][], px: number, py: number, size: number) {
  x.save(); x.translate(px, py); x.rotate(-0.035);
  lines.forEach((segs, li) => {
    let cur = 0; const y = li * size * 1.03;
    segs.forEach((sg) => { cur += wordmark(x, sg.t, cur, y, size, { align: "left", rot: 0, bounce: 0.015, extrude: 0.06, fill: sg.red ? "hot" : "white", outline: 0.17 }) + size * 0.3; });
  });
  x.restore();
}

for (const t of thumbs) {
  const W = 1280, H = 720, c = createCanvas(W, H), x = c.getContext("2d");
  paper(x, W, H); rays(x, 960, 420, 1000, 20);
  // quầng sáng vàng sau nhân vật
  const g = x.createRadialGradient(1000, 330, 40, 1000, 330, 520); g.addColorStop(0, "rgba(255,226,102,0.55)"); g.addColorStop(1, "rgba(255,226,102,0)");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  bigMark(x, t.mark, 1190, 470, 200, 0.16);
  sprite(x, t.pose, 1000, 700, 540);
  bulb(x, 1160, 142, 130, { rot: 0.16 });
  sparkle(x, 760, 110, 28); sparkle(x, 1240, 300, 22, "#fff", true, 0.3); sparkle(x, 820, 640, 24, BRAND.yellow, true, 0.2); sparkle(x, 90, 600, 18, "#fff", true, -0.2);
  title(x, t.lines, 56, 292, 140);
  if (t.tag) chip(x, t.tag, 56, 44, 34);
  // tên kênh nhỏ góc dưới trái
  wordmark(x, NAME, 56, 684, 64, { align: "left", rot: -0.02, extrude: 0.05, outline: 0.18 });
  save(c, t.file);
}
console.log("Xong → brand/");
