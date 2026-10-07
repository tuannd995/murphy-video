// Tờ xem trước bộ tư thế: characters/<id>/sheet.png
import fs from "node:fs";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { FONT, font, registerFonts } from "../src/components/canvas.js";
import { charDir, loadSprites } from "../src/character/sprites.js";

const id = process.argv[2] ?? "hero";
registerFonts();
const ch = await loadSprites(id);
const ids = [...ch.img.keys()];
const cols = 6, cw = 300, chh = 380;
const rows = Math.ceil(ids.length / cols);
const c = createCanvas(cols * cw, rows * chh + 80);
const x = c.getContext("2d");
x.fillStyle = "#f6eedc"; x.fillRect(0, 0, c.width, c.height);
x.fillStyle = "#151515"; x.font = font(40, FONT.xbold); x.fillText(`${ch.def.name} (${id}) — ${ids.length} tư thế`, 24, 54);
ids.forEach((pid, i) => {
  const im = ch.img.get(pid)!;
  const cx = (i % cols) * cw + cw / 2, by = 80 + Math.floor(i / cols) * chh + chh - 50;
  const h = 290 * (ch.height.get(pid) ?? 1) / 1.18;
  const w = (im.width / im.height) * h;
  x.drawImage(im, cx - w / 2, by - h, w, h);
  x.font = font(24, FONT.semi); x.textAlign = "center"; x.fillText(pid, cx, by + 34); x.textAlign = "left";
});
const f = path.join(charDir(id), "sheet.png");
fs.writeFileSync(f, c.toBuffer("image/png"));
console.log(f);
