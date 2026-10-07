import type { SceneRenderer } from "../components/canvas.js";
import { scene00 } from "./scene00.js";
import { scene01 } from "./scene01.js";
import { scene02 } from "./scene02.js";
import { scene03 } from "./scene03.js";
import { scene04 } from "./scene04.js";
import { scene05 } from "./scene05.js";
import { scene06 } from "./scene06.js";
import { scene07 } from "./scene07.js";
import { scene08 } from "./scene08.js";
import { scene09 } from "./scene09.js";
import { scene10 } from "./scene10.js";

export const SCENE_RENDERERS: Record<string, SceneRenderer> = {
  "scene-00": scene00,
  "scene-01": scene01,
  "scene-02": scene02,
  "scene-03": scene03,
  "scene-04": scene04,
  "scene-05": scene05,
  "scene-06": scene06,
  "scene-07": scene07,
  "scene-08": scene08,
  "scene-09": scene09,
  "scene-10": scene10,
};
