// Tạo 1 ảnh nhân vật mẫu + 1 key visual / shot qua OpenRouter.
// Mặc định chỉ dry-run. Cần --confirm mới gọi API. Ảnh đã có sẽ được bỏ qua (regenerate: xoá file hoặc --only=<id>).
//   npm run images                       # dry-run: in kế hoạch + chi phí
//   npm run images -- --confirm          # tạo các ảnh còn thiếu
//   npm run images -- --confirm --only=s04-desk-usb --force
import fs from "node:fs";
import path from "node:path";
import { API, PATHS } from "../src/config/index.js";
import type { ScriptFile } from "../src/script/types.js";
import { chat, loadLedger, saveLedger } from "../src/utils/openrouter.js";

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const force = args.includes("--force");
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));
const ledger = loadLedger();
const est = (ledger.estimate?.usd_per_image as number | undefined) ?? API.fallbackUsdPerImage;
if (!ledger.estimate) {
  console.error("Chưa có ước tính chi phí. Chạy `npm run cost` trước.");
  process.exit(1);
}

const REF = "character-ref";
const jobs = [
  { id: REF, prompt: script.character_reference_prompt, useRef: false },
  ...script.scenes.flatMap((s) => s.shots.filter((sh) => !sh.image_prompt.startsWith("reuse:")).map((sh) => ({ id: sh.id, prompt: sh.image_prompt, useRef: true }))),
].filter((j, i, arr) => arr.findIndex((x) => x.id === j.id) === i)
 .filter((j) => (only ? only.includes(j.id) : true))
 .filter((j) => force || !fs.existsSync(path.join(PATHS.images, `${j.id}.png`)));

console.log(`Ảnh cần tạo: ${jobs.length} | ~$${est.toFixed(4)}/ảnh | đã chi $${ledger.total_spent_usd.toFixed(4)} / $${API.budgetUsd}`);
for (const j of jobs) console.log("  -", j.id);
if (!confirm) {
  console.log("\nDry-run. Thêm --confirm để gọi API.");
  process.exit(0);
}

const refPath = path.join(PATHS.images, `${REF}.png`);
for (const job of jobs) {
  const spent = ledger.spent.reduce((s, x) => s + x.usd, 0);
  if (spent + est > API.budgetUsd) {
    console.error(`Dừng: thêm ảnh ${job.id} sẽ vượt ngân sách ($${spent.toFixed(3)} + ~$${est.toFixed(3)} > $${API.budgetUsd}).`);
    break;
  }
  const content: unknown[] = [];
  if (job.useRef && fs.existsSync(refPath)) {
    content.push({
      type: "text",
      text: "Reference sheet of the recurring main character. Keep his face, hairstyle, outfit and the art style exactly consistent with it. Do not copy the layout, draw a new scene:",
    });
    content.push({ type: "image_url", image_url: { url: "data:image/png;base64," + fs.readFileSync(refPath).toString("base64") } });
  }
  content.push({ type: "text", text: job.prompt });

  process.stdout.write(`→ ${job.id} ... `);
  let saved = false;
  for (let attempt = 1; attempt <= 2 && !saved; attempt++) {
    const r = await chat({
      model: API.imageModel,
      modalities: ["image", "text"],
      image_config: { aspect_ratio: "16:9" },
      messages: [{ role: "user", content }],
    });
    ledger.spent.push({ ts: new Date().toISOString(), step: "image", model: API.imageModel, item: job.id, usd: r.costUsd });
    saveLedger(ledger);
    const url = r.message.images?.[0]?.image_url?.url;
    if (url?.startsWith("data:")) {
      const b64 = url.slice(url.indexOf(",") + 1);
      fs.writeFileSync(path.join(PATHS.images, `${job.id}.png`), Buffer.from(b64, "base64"));
      saved = true;
      console.log(`OK ($${r.costUsd.toFixed(4)})`);
    } else {
      console.log(`không có ảnh (lần ${attempt}): ${String(r.message.content ?? "").slice(0, 120)}`);
    }
  }
}
console.log(`Tổng đã chi: $${ledger.total_spent_usd.toFixed(4)} — xem data/cost.json`);
