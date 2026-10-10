"use client";
import { useEffect, useRef } from "react";

const RAMP = " .'`,:;-~+=*#%@";
const CELL_W = 10;
const CELL_H = 18;

export default function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cols = 0;
    let rows = 0;
    let frame = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / CELL_W);
      rows = Math.ceil(window.innerHeight / CELL_H);
    };

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `${CELL_H - 4}px NerdMono, Consolas, monospace`;
      ctx.textBaseline = "top";

      const sweep = ((t * 0.12) % 1.6) - 0.3;
      const last = RAMP.length - 1;

      for (let y = 0; y < rows; y++) {
        const v = y / rows;
        for (let x = 0; x < cols; x++) {
          const u = x / cols;
          const warp =
            Math.sin(u * 7 + t * 0.9 + Math.sin(v * 4 - t * 0.6) * 1.6) * 0.06 +
            Math.sin(v * 9 - t * 0.7 + u * 3) * 0.03;
          const diag = u * 0.8 + v * 0.35 + warp;
          const band = Math.exp(-Math.pow((diag - sweep) * 5.5, 2));
          const trail = diag < sweep ? Math.exp((diag - sweep) * 3) * 0.28 : 0;
          const grain = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
          const noise = (grain - Math.floor(grain)) * 0.08;
          const dx = (u - 0.5) * 2.4;
          const dy = (v - 0.5) * 2.2;
          const quiet = Math.min(1, Math.max(0, Math.hypot(dx, dy) - 0.25) / 0.55);
          const l = Math.min(1, band + trail + noise * (band + trail + 0.2)) * (0.08 + 0.92 * quiet * quiet);
          if (l < 0.06) continue;
          const g = Math.round(34 + l * 120);
          ctx.fillStyle = `rgb(${g},${g},${g})`;
          ctx.fillText(RAMP[Math.min(Math.floor(l * last), last)], x * CELL_W, y * CELL_H);
        }
      }

      if (!reduce) frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />;
}
