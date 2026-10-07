// Visual identity dùng chung cho mọi ảnh. Sửa ở đây = đổi style cả video.

export const CHARACTER =
  "the same recurring main character: a simple hand-drawn doodle young man with a round white head, " +
  "short spiky black hair, dot eyes, thick expressive eyebrows and a tiny mouth, slim stick-like limbs, " +
  "wearing a light blue shirt, dark trousers and white sneakers, drawn with thick black ink outlines";

export const STYLE =
  "hand-drawn doodle cartoon like a minimalist explainer YouTube channel, " +
  "simple stick-figure-like characters with round heads, thick slightly uneven black ink outlines, " +
  "flat minimal coloring with almost no shading, warm cream paper background, very limited palette " +
  "(black ink, white, cream, light blue for the main character's shirt, small bold red accents), " +
  "simple perspective line-drawn rooms and props, comedic exaggerated poses, motion lines and sweat drops, " +
  "lots of clean empty cream space, no gradients, no photorealism, no 3D, no anime, " +
  "no text, no letters, no typography, no watermark, no logo, 16:9";

export const PALETTE = {
  ink: "#1a1a1a",
  paper: "#f6eedc",
  teal: "#2f6f73",
  tealSoft: "#7fb2ad",
  ochre: "#d9a441",
  coral: "#e0362c",
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
  lighting: "flat even light",
  mood: "friendly, clear, neutral reference",
  camera: "straight-on eye level, orthographic feel",
});
