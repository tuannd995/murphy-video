// Tạo bộ tư thế cho nhân vật từ characters/<id>/<id>.json.
//   npx tsx scripts/gen-character.ts hero                   # dry-run: liệt kê + chi phí
//   npx tsx scripts/gen-character.ts hero --confirm         # tạo ảnh còn thiếu (AI) rồi tách nền
//   npx tsx scripts/gen-character.ts hero --key-only        # chỉ tách nền lại từ raw/ (miễn phí)
//   npx tsx scripts/gen-character.ts hero --confirm --only=shock --force
// Ảnh tự vẽ: bỏ vào characters/<id>/raw/<pose>.png (nền một màu trơn, khác màu nhân vật) rồi chạy --key-only.
import fs from "node:fs";
import path from "node:path";
import { API, ROOT } from "../src/config/index.js";
import { charDir, keyBackground, loadDef } from "../src/character/sprites.js";
import { chat, loadLedger, saveLedger } from "../src/utils/openrouter.js";

const id = process.argv[2];
if (!id) throw new Error("Thiếu id nhân vật, ví dụ: hero");
const args = process.argv.slice(3);
const confirm = args.includes("--confirm"), force = args.includes("--force"), keyOnly = args.includes("--key-only");
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const def = loadDef(id);
const dir = charDir(id);
const raw = (p: string) => path.join(dir, "raw", `${p}.png`);
const out = (p: string) => path.join(dir, "poses", `${p}.png`);
fs.mkdirSync(path.dirname(raw("x")), { recursive: true });
fs.mkdirSync(path.dirname(out("x")), { recursive: true });

const ref = path.join(ROOT, def.reference);
const STYLE_RULES =
  "Draw ONLY this one character, full body from head to shoes, centered, filling about 85% of the image height. " +
  "Same character design and same hand-drawn doodle style as the reference: thick slightly uneven black ink outlines, flat colors, no shading. " +
  "Background: one solid flat pure green color (#00FF00) everywhere, no floor, no shadow, no props, no text, no frame.";

const jobs = [
  ...def.poses.map((p) => ({ id: p.id, kind: "pose" as const, text: `Character: ${def.description}. Pose: ${p.prompt}. ${STYLE_RULES}`, base: undefined as string | undefined })),
  ...def.variants.map((v) => ({ id: v.id, kind: "variant" as const, text: `${v.edit}. Background stays solid pure green (#00FF00).`, base: v.base })),
].filter((j) => !only || only.includes(j.id));

if (keyOnly) {
  for (const j of jobs) if (fs.existsSync(raw(j.id))) fs.writeFileSync(out(j.id), await keyBackground(fs.readFileSync(raw(j.id))));
  console.log("Đã tách nền lại từ raw/ → poses/");
  process.exit(0);
}

const todo = jobs.filter((j) => force || !fs.existsSync(raw(j.id)));
const ledger = loadLedger();
const est = (ledger.estimate?.usd_per_image as number | undefined) ?? API.fallbackUsdPerImage;
console.log(`Nhân vật ${def.name} (${id}): ${todo.length} ảnh cần tạo × ~$${est.toFixed(3)} = ~$${(todo.length * est).toFixed(2)} | đã chi $${ledger.total_spent_usd.toFixed(3)} / $${API.budgetUsd}`);
for (const j of todo) console.log("  -", j.id);
if (!confirm) { console.log("\nDry-run. Thêm --confirm để gọi API."); process.exit(0); }

const b64 = (f: string) => "data:image/png;base64," + fs.readFileSync(f).toString("base64");
// tạo pose trước, variant sau (variant cần ảnh gốc)
for (const j of [...todo.filter((x) => x.kind === "pose"), ...todo.filter((x) => x.kind === "variant")]) {
  const spent = ledger.spent.reduce((s, x) => s + x.usd, 0);
  if (spent + est > API.budgetUsd) { console.error(`Dừng: vượt ngân sách ($${spent.toFixed(3)} + ~$${est.toFixed(3)} > $${API.budgetUsd})`); break; }
  const content: unknown[] =
    j.kind === "variant"
      ? [{ type: "image_url", image_url: { url: b64(raw(j.base!)) } }, { type: "text", text: j.text }]
      : [{ type: "text", text: "Reference sheet of the character (style + design to copy exactly):" }, { type: "image_url", image_url: { url: b64(ref) } }, { type: "text", text: j.text }];
  process.stdout.write(`→ ${j.id} ... `);
  const r = await chat({ model: API.imageModel, modalities: ["image", "text"], image_config: { aspect_ratio: "3:4" }, messages: [{ role: "user", content }] });
  ledger.spent.push({ ts: new Date().toISOString(), step: "character", model: API.imageModel, item: `${id}/${j.id}`, usd: r.costUsd });
  saveLedger(ledger);
  const url = r.message.images?.[0]?.image_url?.url;
  if (!url) { console.log("không có ảnh"); continue; }
  fs.writeFileSync(raw(j.id), Buffer.from(url.slice(url.indexOf(",") + 1), "base64"));
  fs.writeFileSync(out(j.id), await keyBackground(fs.readFileSync(raw(j.id))));
  console.log(`OK ($${r.costUsd.toFixed(4)})`);
}
console.log(`Tổng đã chi: $${ledger.total_spent_usd.toFixed(4)}`);
