// Đo độ mở miệng từ file voice: RMS theo từng frame, chuẩn hoá + làm mượt → 0..1
import { decodeMono } from "../utils/media.js";

export function mouthEnvelope(file: string, fps: number, sampleRate = 16000): number[] {
  const pcm = decodeMono(file, sampleRate);
  const hop = Math.round(sampleRate / fps);
  const raw: number[] = [];
  for (let i = 0; i < pcm.length; i += hop) {
    let s = 0;
    const end = Math.min(pcm.length, i + hop);
    for (let j = i; j < end; j++) s += pcm[j] * pcm[j];
    raw.push(Math.sqrt(s / Math.max(1, end - i)));
  }
  const peak = [...raw].sort((a, b) => a - b)[Math.floor(raw.length * 0.95)] || 1;
  const out: number[] = [];
  let v = 0;
  for (const r of raw) {
    const target = Math.min(1, Math.max(0, (r / peak - 0.08) * 1.2));
    v += (target - v) * (target > v ? 0.7 : 0.35); // mở nhanh, khép chậm
    out.push(v);
  }
  return out;
}
