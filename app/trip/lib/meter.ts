import type { Audio } from "@/app/trip/lib/settings";

export function drawMeter(c: HTMLCanvasElement, freq: Uint8Array | null, l: Audio, beat: number, sens: number) {
  const g = c.getContext("2d");
  if (!g) return;
  const W = c.width;
  const H = c.height;
  g.fillStyle = "#050505";
  g.fillRect(0, 0, W, H);
  const specH = H - 22;
  if (!freq || freq.length === 0) {
    g.fillStyle = "#666";
    g.font = "10px monospace";
    g.fillText("no signal - waiting for audio", 8, specH / 2);
    return;
  }
  const n = freq.length;
  const bars = 48;
  const bw = W / bars;
  for (let i = 0; i < bars; i++) {
    const idx = Math.min(n - 1, Math.floor(Math.pow(i / bars, 1.8) * n * 0.7));
    const v = Math.min(1, (freq[idx] / 255) * sens * 0.8);
    const band = idx < n * 0.06 ? 0 : idx < n * 0.3 ? 1 : 2;
    g.fillStyle = ["#ff2d6f", "#22d3ee", "#e5e5e5"][band];
    g.fillRect(i * bw + 1, specH - v * specH, bw - 2, v * specH);
  }
  g.strokeStyle = "#333";
  for (const f of [0.06, 0.3]) {
    const x = Math.pow(f / 0.7, 1 / 1.8) * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, specH);
    g.stroke();
  }
  const rows: [string, number, string][] = [["bass", l.bass, "#ff2d6f"], ["mid", l.mid, "#22d3ee"], ["high", l.high, "#e5e5e5"]];
  const mw = (W - 40) / 3;
  g.font = "9px monospace";
  rows.forEach(([name, v, col], i) => {
    const x = 4 + i * (mw + 10);
    g.fillStyle = "#222";
    g.fillRect(x, H - 14, mw, 6);
    g.fillStyle = col;
    g.fillRect(x, H - 14, mw * Math.min(1, v), 6);
    g.fillStyle = "#888";
    g.fillText(name, x, H - 2);
  });
  g.fillStyle = `rgba(255,255,255,${Math.min(1, beat)})`;
  g.beginPath();
  g.arc(W - 10, H - 9, 6, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#555";
  g.stroke();
}
