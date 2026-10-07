// Định dạng xuất theo nền tảng. ƯU TIÊN: video YouTube dài 8–10 phút.
// Các bản ngắn (TikTok/Shorts/Reels/Facebook) được cắt từ cùng kịch bản + voice, không đọc lại.
import path from "node:path";
import { PATHS } from "./index.js";

export type VideoType = "youtube" | "facebook" | "tiktok" | "shorts" | "reels";

export interface Format {
  label: string;
  width: number;
  height: number;
  vertical: boolean;
  /** thời lượng lý tưởng [min, max] giây */
  ideal: [number, number];
  /** giới hạn cứng của nền tảng (giây) */
  hardMax?: number;
  /** có intro/outro kênh không */
  introOutro: boolean;
  /** mặc định dùng bản tóm tắt (chỉ các câu đánh dấu summary) */
  summary: boolean;
  /** tự giãn nhịp để đạt ideal[0] */
  stretch: boolean;
  /** lời kêu gọi hiện cuối video (chữ trên màn hình, không đọc) */
  cta?: string;
  note: string;
}

export const FORMATS: Record<VideoType, Format> = {
  youtube: {
    label: "YouTube (dài, 16:9)", width: 1920, height: 1080, vertical: false, ideal: [480, 600], introOutro: true, summary: false, stretch: true,
    note: "Ưu tiên số 1. ≥ 8 phút để có quảng cáo giữa video (mid-roll).",
  },
  facebook: {
    label: "Facebook (16:9 rút gọn)", width: 1920, height: 1080, vertical: false, ideal: [180, 300], introOutro: true, summary: true, stretch: false,
    note: "Bản rút gọn 3–5 phút cho fanpage.",
  },
  tiktok: {
    label: "TikTok (9:16)", width: 1080, height: 1920, vertical: true, ideal: [61, 180], hardMax: 600, introOutro: false, summary: true, stretch: false,
    cta: "Follow để xem thêm kiến thức nguội ngắt",  // không dùng emoji: font không có
    note: "> 1 phút để đủ điều kiện Creator Rewards.",
  },
  shorts: {
    label: "YouTube Shorts (9:16)", width: 1080, height: 1920, vertical: true, ideal: [30, 60], hardMax: 180, introOutro: false, summary: false, stretch: false,
    cta: "Xem bản đầy đủ trên YouTube Não Phẳng",
    note: "1 khối nội dung, kéo người xem về video dài.",
  },
  reels: {
    label: "Reels Facebook/Instagram (9:16)", width: 1080, height: 1920, vertical: true, ideal: [30, 90], hardMax: 180, introOutro: false, summary: false, stretch: false,
    cta: "Theo dõi Não Phẳng để xem thêm",
    note: "Clip ngắn để xây thương hiệu.",
  },
};

export interface FormatArgs {
  type: VideoType;
  format: Format;
  /** chỉ lấy các scene này (vd. cho Shorts) */
  scenes?: string[];
  /** bản tóm tắt: chỉ giữ các câu đánh dấu summary */
  summary: boolean;
  /** hậu tố tên file, vd "tiktok" hoặc "shorts-scene-04" */
  tag: string;
}

const argVal = (argv: string[], name: string) => {
  const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  return argv[i].includes("=") ? argv[i].split("=").slice(1).join("=") : argv[i + 1];
};

export function parseFormatArgs(argv = process.argv.slice(2)): FormatArgs {
  const type = (argVal(argv, "type") ?? "youtube") as VideoType;
  const format = FORMATS[type];
  if (!format) throw new Error(`--type không hợp lệ: ${type}. Chọn: ${Object.keys(FORMATS).join(", ")}`);
  const scenes = argVal(argv, "scenes")?.split(",").filter(Boolean);
  const summary = argv.includes("--summary") ? true : argv.includes("--full") ? false : format.summary;
  // youtube bản đầy đủ → không hậu tố (giữ đường dẫn cũ); còn lại vd "tiktok-summary", "shorts-scene-04"
  const tag = type === "youtube" && !scenes && !summary ? "" : [type, ...(scenes ?? []), summary ? "summary" : ""].filter(Boolean).join("-");
  return { type, format, scenes, summary, tag };
}

/** Đường dẫn theo định dạng: YouTube bản đầy đủ giữ đường dẫn cũ (data/storyboard.json, output/) */
export function formatPaths(f: FormatArgs) {
  if (!f.tag) return { storyboard: PATHS.storyboard, out: PATHS.output, sceneClips: PATHS.sceneClips, suffix: "" };
  const out = path.join(PATHS.output, f.tag);
  return { storyboard: path.join(PATHS.data, `storyboard.${f.tag}.json`), out, sceneClips: path.join(out, "scenes"), suffix: `-${f.tag}` };
}

export const formatArgsToCli = (f: FormatArgs) => [
  `--type=${f.type}`,
  ...(f.scenes ? [`--scenes=${f.scenes.join(",")}`] : []),
  f.summary ? "--summary" : "--full",
];
