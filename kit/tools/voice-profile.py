#!/usr/bin/env python3
"""Đo "hồ sơ giọng kể" của một bản thu và so với giọng mục tiêu (kit/11-phong-cach-giong-ke.md, mục 1).

Dùng:
    pip install librosa numpy
    python3 tools/voice-profile.py ban-thu.wav --text kich-ban.txt
    python3 tools/voice-profile.py ban-thu.mp3            # không có --text thì bỏ qua tốc độ âm tiết

Cần ffmpeg trong PATH. Chỉ nên đo bản thu giọng đọc sạch (ít nhạc nền). Các con số là vùng mục tiêu, không phải luật cứng.
Cao độ tuyệt đối tuỳ giọng mỗi người, nên không dùng để chấm đạt/không đạt.
"""
import argparse, re, subprocess, sys, tempfile, os
import numpy as np
import librosa

# Vùng mục tiêu rút từ giọng tham chiếu (xem mục 1 của file 11)
TARGET = {
    "rate": (4.2, 5.0),        # âm tiết/giây khi đang nói
    "pause_med": (0.25, 0.45), # giây, trung vị khoảng nghỉ giữa cụm
    "fall_pct": (60, 90),      # % cụm kết thúc bằng hạ giọng
    "rise_pct": (0, 20),       # % cụm kết thúc bằng lên giọng
    "range_st": (9, 13),       # nửa cung, p90-p10 trong mỗi cụm
    "stress_ps": (1.2, 2.0),   # điểm nhấn mỗi giây
}

def load(path):
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, "a.wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", wav], check=True)
        y, sr = librosa.load(wav, sr=16000, mono=True)
    return y, sr

def syllables(text):
    return len(re.findall(r"[^\W_]+", text, flags=re.UNICODE))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio"); ap.add_argument("--text", help="file văn bản đúng nội dung bản thu (để tính âm tiết/giây)")
    ap.add_argument("--top-db", type=float, default=32, help="ngưỡng im lặng (dB dưới đỉnh); tăng nếu phòng thu ồn")
    a = ap.parse_args()

    y, sr = load(a.audio)
    hop = 256
    iv = librosa.effects.split(y, top_db=a.top_db, frame_length=1024, hop_length=hop)
    # gộp các đoạn cách nhau < 0.15 s (ngắt hơi trong chữ, không phải nghỉ)
    segs = []
    for s, e in iv / sr:
        if segs and s - segs[-1][1] < 0.15: segs[-1][1] = e
        else: segs.append([s, e])
    segs = [(s, e) for s, e in segs if e - s > 0.4]
    if not segs: sys.exit("Không tìm thấy đoạn có tiếng nói. Thử giảm --top-db.")

    speech = sum(e - s for s, e in segs)
    pauses = [segs[i + 1][0] - segs[i][1] for i in range(len(segs) - 1)]
    pauses = [p for p in pauses if p < 3.0]

    f0_all, rng, fin, peaks = [], [], [], []
    for s, e in segs:
        seg = y[int(s * sr):int(e * sr)]
        if len(seg) < sr * 0.8: continue
        f0, _, _ = librosa.pyin(seg, fmin=70, fmax=400, sr=sr, frame_length=1024, hop_length=320)
        t = np.arange(len(f0)) * 320 / sr; ok = ~np.isnan(f0)
        if ok.sum() < 20: continue
        semi = 12 * np.log2(f0 / np.nanmedian(f0))
        f0_all.append(f0[ok]); rng.append(np.percentile(semi[ok], 90) - np.percentile(semi[ok], 10))
        d = e - s
        if d > 1.5:
            last = semi[(t > d - 0.6) & ok]; prev = semi[(t > d - 1.8) & (t <= d - 0.6) & ok]
            if len(last) > 4 and len(prev) > 4: fin.append(np.median(last) - np.median(prev))
        rms = librosa.feature.rms(y=seg, frame_length=640, hop_length=160)[0]; db = 20 * np.log10(rms + 1e-6)
        thr = np.median(db) + 5; cl = []
        for i in range(1, len(db) - 1):
            if db[i] > thr and db[i] >= db[i - 1] and db[i] >= db[i + 1] and (not cl or i - cl[-1] > 40): cl.append(i)
        peaks.append(len(cl) / d)

    f0m = float(np.median(np.concatenate(f0_all))) if f0_all else float("nan")
    fin = np.array(fin) if fin else np.array([0.0])
    me = {
        "rate": syllables(open(a.text, encoding="utf8").read()) / speech if a.text else None,
        "pause_med": float(np.median(pauses)) if pauses else None,
        "fall_pct": float((fin < -1).mean() * 100),
        "rise_pct": float((fin > 1).mean() * 100),
        "range_st": float(np.median(rng)) if rng else None,
        "stress_ps": float(np.median(peaks)) if peaks else None,
    }
    hint = {
        "rate": ("nói nhanh và liền hơn, bớt ngắt giữa chừng", "chậm lại một chút, rõ chữ hơn"),
        "pause_med": ("nghỉ lâu hơn một chút ở cuối cụm", "bớt nghỉ, nối cụm liền hơn"),
        "fall_pct": ("hạ giọng rõ ở cuối cụm (kể chắc chắn, không treo)", None),
        "rise_pct": (None, "bớt lên giọng cuối câu, chỉ lên ở câu hỏi thật"),
        "range_st": ("lên xuống nhiều hơn, mở cụm cao rồi hạ dần", "bớt diễn, giữ ngữ điệu gọn"),
        "stress_ps": ("nhấn thêm vào danh từ, số, từ bất ngờ", "bớt nhấn, chỉ nhấn chữ mang nghĩa"),
    }
    label = {"rate": "Tốc độ (âm tiết/s)", "pause_med": "Nghỉ giữa cụm (s, trung vị)", "fall_pct": "% cụm hạ giọng cuối",
             "rise_pct": "% cụm lên giọng cuối", "range_st": "Biên độ ngữ điệu (nửa cung)", "stress_ps": "Điểm nhấn mỗi giây"}
    if len(segs) < 8:
        print(f"CẢNH BÁO: chỉ tách được {len(segs)} cụm, số đo về ngữ điệu chưa đáng tin. Dùng bản thu giọng sạch (không nhạc nền) dài hơn 1 phút, hoặc chỉnh --top-db.")
    print(f"\nFile: {a.audio}\nThời lượng {len(y)/sr:.0f}s, tiếng nói {speech:.0f}s, {len(segs)} cụm. Cao độ trung vị {f0m:.0f} Hz (tuỳ giọng, không chấm).\n")
    print(f"{'Thông số':32}{'Của bạn':>10}{'Mục tiêu':>14}  Gợi ý")
    for k, (lo, hi) in TARGET.items():
        v = me[k]
        if v is None: print(f"{label[k]:32}{'-':>10}{f'{lo}-{hi}':>14}  (thiếu --text)" if k == 'rate' else f"{label[k]:32}{'-':>10}"); continue
        msg = "ok"
        if v < lo: msg = hint[k][0] or "ok"
        elif v > hi: msg = hint[k][1] or "ok"
        print(f"{label[k]:32}{v:>10.2f}{f'{lo}-{hi}':>14}  {msg}")

if __name__ == "__main__":
    main()
