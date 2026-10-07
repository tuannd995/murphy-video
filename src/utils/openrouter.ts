import fs from "node:fs";
import { API, PATHS } from "../config/index.js";

export interface CostLedger {
  budget_usd: number;
  estimate?: Record<string, unknown>;
  spent: { ts: string; step: string; model: string; item: string; usd: number }[];
  total_spent_usd: number;
}

export function loadLedger(): CostLedger {
  if (fs.existsSync(PATHS.cost)) {
    const l = JSON.parse(fs.readFileSync(PATHS.cost, "utf8")) as CostLedger;
    l.budget_usd = API.budgetUsd;
    return l;
  }
  return { budget_usd: API.budgetUsd, spent: [], total_spent_usd: 0 };
}

export function saveLedger(l: CostLedger) {
  l.total_spent_usd = +l.spent.reduce((s, x) => s + x.usd, 0).toFixed(6);
  fs.writeFileSync(PATHS.cost, JSON.stringify(l, null, 2) + "\n");
}

function key() {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) throw new Error("Thiếu OPENROUTER_API_KEY (copy .env.example → .env)");
  return k;
}

async function req(pathname: string, init: RequestInit = {}) {
  const res = await fetch(API.baseUrl + pathname, {
    ...init,
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/murphy-video",
      "X-Title": "murphy-video",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenRouter ${pathname} ${res.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

/** Số dư key (không tốn tiền) */
export async function keyInfo(): Promise<{ usage: number; limit: number | null; limit_remaining: number | null }> {
  return (await req("/key")).data;
}

export interface ModelInfo {
  id: string;
  pricing: Record<string, string>;
  architecture?: { input_modalities?: string[]; output_modalities?: string[] };
}

/** Danh sách model + giá (không tốn tiền) */
export async function listModels(): Promise<ModelInfo[]> {
  return (await req("/models")).data;
}

export interface ChatResult {
  message: { content?: string; images?: { image_url: { url: string } }[] };
  costUsd: number;
}

export async function chat(body: Record<string, unknown>): Promise<ChatResult> {
  const r = await req("/chat/completions", {
    method: "POST",
    body: JSON.stringify({ ...body, usage: { include: true } }),
  });
  const msg = r.choices?.[0]?.message;
  if (!msg) throw new Error("Phản hồi không có message: " + JSON.stringify(r).slice(0, 400));
  return { message: msg, costUsd: Number(r.usage?.cost ?? 0) };
}
