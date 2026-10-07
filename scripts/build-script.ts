// Sinh data/script.json từ src/script/murphy.ts (nguồn chính, có type-check).
import fs from "node:fs";
import { PATHS } from "../src/config/index.js";
import { buildPrompt, CHARACTER_REFERENCE_PROMPT } from "../src/config/style.js";
import { SCENES, TITLE_EN, TITLE_VI } from "../src/script/murphy.js";
import type { ScriptFile } from "../src/script/types.js";

const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

const scenes = SCENES.map((s) => {
  const shots = s.shots.map((sh) => ({ id: sh.id, fromCaption: sh.fromCaption, image_prompt: sh.prompt ? buildPrompt(sh.prompt) : `reuse:${sh.id}` }));
  return {
    id: s.id,
    title: s.title,
    duration: s.targetDuration,
    voice_vi: s.captions.map((c) => c.vi).join(" "),
    subtitle_vi: s.captions.map((c) => c.vi).join(" "),
    subtitle_en: s.captions.map((c) => c.en).join(" "),
    captions: s.captions,
    visual_summary: s.visual_summary,
    image_prompt: shots[0].image_prompt,
    shots,
    animation: s.animation,
    sfx: s.sfx,
    music: s.music,
  };
});

const out: ScriptFile = {
  title_vi: TITLE_VI,
  title_en: TITLE_EN,
  word_count_vi: scenes.reduce((n, s) => n + words(s.voice_vi), 0),
  character_reference_prompt: CHARACTER_REFERENCE_PROMPT,
  scenes,
};

fs.writeFileSync(PATHS.script, JSON.stringify(out, null, 2) + "\n");
const shots = scenes.reduce((n, s) => n + s.shots.length, 0);
console.log(`data/script.json: ${scenes.length} scenes, ${shots} shots (+1 character ref), ${out.word_count_vi} từ tiếng Việt`);
for (const s of scenes) console.log(`  ${s.id}  ${String(words(s.voice_vi)).padStart(3)} từ  ${s.title}`);
