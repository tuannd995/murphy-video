// Visual identity dùng chung cho mọi ảnh. Sửa ở đây = đổi style cả video.

export const CHARACTER =
  "the same recurring main character: a Vietnamese man in his late 20s, short neat black hair, " +
  "simple friendly expressive face, light blue casual button-up shirt with rolled sleeves, " +
  "dark navy trousers, clean white sneakers";

export const STYLE =
  "modern editorial cartoon, cinematic 2D digital illustration, clean vector-like shapes, " +
  "soft textured shading, slightly exaggerated facial expression, warm but restrained color palette " +
  "(muted teal, warm ochre, soft coral, off-white), subtle depth, soft shadows, uncluttered background, " +
  "sophisticated modern educational YouTube aesthetic, humorous but not childish, " +
  "no photorealism, no anime, no 3D render, no text, no letters, no typography, no watermark, no logo, 16:9";

export const PALETTE = {
  ink: "#1d2430",
  paper: "#f4efe6",
  teal: "#2f6f73",
  tealSoft: "#7fb2ad",
  ochre: "#d9a441",
  coral: "#e0715a",
  red: "#d6453d",
  green: "#3fae6a",
  sky: "#9cc3d9",
  night: "#18202c",
};

export interface PromptParts {
  scene: string;
  environment: string;
  composition: string;
  lighting: string;
  mood: string;
  camera: string;
  /** false cho shot không có nhân vật */
  character?: boolean;
}

/** Ghép prompt theo template [CHARACTER][SCENE][ENVIRONMENT][COMPOSITION][LIGHTING][MOOD][CAMERA][STYLE] */
export function buildPrompt(p: PromptParts): string {
  return [
    p.character === false ? "" : `[CHARACTER] ${CHARACTER}.`,
    `[SCENE] ${p.scene}.`,
    `[ENVIRONMENT] ${p.environment}.`,
    `[COMPOSITION] ${p.composition}.`,
    `[LIGHTING] ${p.lighting}.`,
    `[MOOD] ${p.mood}.`,
    `[CAMERA] ${p.camera}.`,
    `[STYLE] ${STYLE}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export const CHARACTER_REFERENCE_PROMPT = buildPrompt({
  scene:
    "character model sheet: the character shown three times side by side — front view standing relaxed, " +
    "three-quarter view smiling, and a surprised expression close-up",
  environment: "plain warm off-white studio background",
  composition: "evenly spaced full-body turnaround, character fills the frame height",
  lighting: "soft even studio light",
  mood: "friendly, clear, neutral reference",
  camera: "straight-on eye level, orthographic feel",
});
