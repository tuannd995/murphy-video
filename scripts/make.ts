// Làm trọn 1 bản video theo định dạng: storyboard → render → mix → final.
//   npm run make                                          # YouTube 16:9 đầy đủ (ưu tiên 8–10 phút)
//   npm run make -- --type=tiktok                         # bản tóm tắt dọc > 1 phút
//   npm run make -- --type=facebook                       # bản tóm tắt ngang 3–5 phút
//   npm run make -- --type=shorts --scenes=scene-04       # 1 khối nội dung → Shorts
//   npm run make -- --type=reels --all-shortable          # mỗi scene "shortable" → 1 clip riêng
//   npm run make -- --type=youtube --summary              # tóm tắt ngang của video dài
import fs from "node:fs";
import { PATHS } from "../src/config/index.js";
import { formatArgsToCli, parseFormatArgs } from "../src/config/formats.js";
import type { ScriptFile } from "../src/script/types.js";
import { run } from "../src/utils/media.js";

const argv = process.argv.slice(2);
const steps = ["build-storyboard", "render", "mix-audio", "assemble"];
const once = async (cli: string[]) => { for (const s of steps) await run("npx", ["tsx", `scripts/${s}.ts`, ...cli]); };

if (argv.includes("--all-shortable")) {
  const script: ScriptFile = JSON.parse(fs.readFileSync(PATHS.script, "utf8"));
  const ids = script.scenes.filter((s) => s.shortable).map((s) => s.id);
  const base = parseFormatArgs(argv.filter((a) => a !== "--all-shortable"));
  console.log(`Tạo ${ids.length} clip ${base.format.label}: ${ids.join(", ")}`);
  for (const id of ids) await once(formatArgsToCli({ ...base, scenes: [id] }));
} else {
  await once(formatArgsToCli(parseFormatArgs(argv)));
}
