import path from "node:path";
import { PATHS } from "../config/index.js";

export const voiceFile = (sceneId: string, i: number) => path.join(PATHS.voice, `${sceneId}_${String(i).padStart(2, "0")}.mp3`);
