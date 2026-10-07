import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";

export function probeDuration(file: string): number {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return parseFloat(out.toString().trim());
}

/** Giải mã file audio bất kỳ → Float32 mono ở sampleRate */
export function decodeMono(file: string, sampleRate: number): Float32Array {
  const buf = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(sampleRate), "-"], {
    maxBuffer: 1 << 30,
  });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

/** Ghi WAV 16-bit PCM từ các kênh Float32 */
export function writeWav(file: string, channels: Float32Array[], sampleRate: number) {
  const n = channels[0].length, ch = channels.length;
  const data = Buffer.alloc(n * ch * 2);
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]));
      data.writeInt16LE(Math.round(v * 32767), (i * ch + c) * 2);
    }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(sampleRate * ch * 2, 28); h.writeUInt16LE(ch * 2, 32);
  h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

export const dbToGain = (db: number) => Math.pow(10, db / 20);

export function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

export const fmtTime = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
