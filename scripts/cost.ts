// Kiểm tra chi phí TRƯỚC khi gọi API tạo nội dung. Chỉ gọi endpoint miễn phí (/key, /models).
import fs from "node:fs";
import path from "node:path";
import { API, PATHS } from "../src/config/index.js";
import type { ScriptFile } from "../src/script/types.js";
import { keyInfo, listModels, loadLedger, saveLedger } from "../src/utils/openrouter.js";

const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));
const allImages = [...new Set(["character-ref", ...script.scenes.flatMap((s) => s.shots.filter((sh) => !sh.image_prompt.startsWith("reuse:")).map((sh) => sh.id))])];
const missing = allImages.filter((id) => !fs.existsSync(path.join(PATHS.images, `${id}.png`)));

const ledger = loadLedger();
const measured = ledger.spent.filter((x) => x.step === "image" && x.usd > 0);

let usdPerImage = API.fallbackUsdPerImage;
let pricingNote = "fallback (không đọc được giá)";
try {
  const models = await listModels();
  const m = models.find((x) => x.id === API.imageModel);
  if (!m) throw new Error(`Không thấy model ${API.imageModel} trên OpenRouter`);
  // ảnh output được tính như completion tokens (~1300 token / ảnh); thêm prompt ~600 token + ảnh ref ~1300 token
  const pIn = Number(m.pricing.prompt ?? 0), pOut = Number(m.pricing.completion ?? 0), pImg = Number(m.pricing.image ?? 0);
  const pImgOut = Number((m.pricing as Record<string, string>).image_output ?? 0) || pOut;
  const est = 600 * pIn + 1300 * pImgOut + pImg + Number(m.pricing.request ?? 0);
  usdPerImage = Math.max(est, 0.001);
  pricingNote = `từ /models: prompt=${pIn}/tok, completion=${pOut}/tok, image_output=${pImgOut}/tok`;
  const cheaper = models
    .filter((x) => x.architecture?.output_modalities?.includes("image"))
    .map((x) => x.id);
  console.log("Model có output ảnh:", cheaper.join(", "));
} catch (e) {
  console.warn("⚠", (e as Error).message);
}
if (measured.length) {
  const avg = measured.reduce((s, x) => s + x.usd, 0) / measured.length;
  usdPerImage = Math.max(usdPerImage, avg);
  pricingNote += ` | thực tế trung bình ${avg.toFixed(4)}$/ảnh`;
}

const imagesUsd = missing.length * usdPerImage;
const remaining = API.budgetUsd - ledger.total_spent_usd;
ledger.estimate = {
  at: new Date().toISOString(),
  image_model: API.imageModel,
  usd_per_image: +usdPerImage.toFixed(5),
  pricing_note: pricingNote,
  images_total: allImages.length,
  images_missing: missing.length,
  images_usd: +imagesUsd.toFixed(4),
  script_llm_usd: 0, // kịch bản do Claude viết trực tiếp trong repo, không gọi API
  tts_usd: 0, // edge-tts miễn phí
  music_sfx_usd: 0, // tổng hợp local
  projected_total_usd: +(ledger.total_spent_usd + imagesUsd).toFixed(4),
  within_budget: ledger.total_spent_usd + imagesUsd <= API.budgetUsd,
};
saveLedger(ledger);

console.log(`\nNgân sách: $${API.budgetUsd} | đã chi: $${ledger.total_spent_usd.toFixed(4)} | còn: $${remaining.toFixed(4)}`);
console.log(`Ảnh cần tạo: ${missing.length}/${allImages.length} × ~$${usdPerImage.toFixed(4)} = ~$${imagesUsd.toFixed(3)} (${pricingNote})`);
console.log(`Dự kiến tổng: $${(ledger.total_spent_usd + imagesUsd).toFixed(3)} → ${ledger.estimate.within_budget ? "OK trong ngân sách" : "VƯỢT NGÂN SÁCH"}`);

try {
  const k = await keyInfo();
  console.log(`Key OpenRouter: đã dùng $${k.usage}, giới hạn ${k.limit ?? "không"}, còn ${k.limit_remaining ?? "?"}`);
} catch (e) {
  console.warn("⚠ Không đọc được thông tin key:", (e as Error).message);
}
