"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const RAMP = " .'`,:;-~+=*#%@";
const CELL_W = 10;
const CELL_H = 18;
const SHADES = Array.from({ length: 121 }, (_, i) => `rgb(${34 + i},${34 + i},${34 + i})`);
const month = new Date().getMonth();


type Shape = { ax: number; ay: number; fx: number; fy: number; amp: number; speed: number };

const SHAPES: Shape[] = [
  { ax: 0.8, ay: 0.35, fx: 7, fy: 9, amp: 1, speed: 0.12 },
  { ax: 0.3, ay: 0.85, fx: 5, fy: 11, amp: 1.3, speed: 0.1 },
  { ax: -0.75, ay: 0.4, fx: 9, fy: 6, amp: 0.8, speed: 0.14 },
  { ax: -0.3, ay: -0.8, fx: 6, fy: 8, amp: 1.5, speed: 0.11 },
  { ax: 0.9, ay: -0.3, fx: 8, fy: 7, amp: 1.1, speed: 0.13 },
];

const PATHS: Record<string, number> = { "/": 0, "/projects": 1, "/contact": 2, "/code": 3 };

function rngFor(path: string) {
  let h = 1779033703 * month;
  for (let i = 0; i < path.length; i++) h = Math.imul(h ^ path.charCodeAt(i), 3432918353) >>> 0;
  let a = h;
  return () => {
    // Mulberry32 stolen 
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shapeFor(path: string): Shape {
  if (path in PATHS) return SHAPES[PATHS[path]];
  const r = rngFor(path);
  const sign = () => (r() < 0.5 ? -1 : 1);
  return { ax: sign() * (0.3 + r() * 0.6), ay: sign() * (0.3 + r() * 0.6), fx: 5 + r() * 5, fy: 6 + r() * 6, amp: 0.8 + r() * 0.8, speed: 0.1 + r() * 0.05 };
}

function seedFor(path: string) {
  const r = rngFor("seed:" + path);
  return { a: r() * 6.28, b: r() * 6.28, c: r() * 6.28, n: r() * 100, jx: (r() - 0.5) * 0.2, jy: (r() - 0.5) * 0.2 };
}

export default function AsciiField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const target = useRef<Shape>(shapeFor(pathname));

  const seedRef = useRef(seedFor(pathname));
  const warp = useRef<{ dir: 'in' | 'out'; t0: number } | null>(null);

  useEffect(() => {
    target.current = shapeFor(pathname);
    seedRef.current = seedFor(pathname);
    if (warp.current?.dir === 'in') warp.current = { dir: 'out', t0: performance.now() };
  }, [pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let cols = 0;
    let rows = 0;
    let frame = 0;
    let alive = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur: Shape = { ...target.current };
    let phase = Math.random() * 1.6;
    let last = performance.now();
    let ripples: { x: number; y: number; t0: number }[] = [];
    const LIFE = 2.4;
    const SPREAD = 26;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / CELL_W);
      rows = Math.ceil(window.innerHeight / CELL_H);
    };

    const onWarp = () => {
      warp.current = { dir: 'in', t0: performance.now() };
      document.documentElement.classList.add('warping');
    };

    const onDown = (e: PointerEvent) => {
      const target = e.target;
      if (target !== canvas && !(target instanceof Element && target.matches(".screen"))) return;
      ripples.push({ x: e.clientX / CELL_W, y: e.clientY / CELL_H, t0: performance.now() / 1000 });
      if (ripples.length > 6) ripples.shift();
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      const k = 1 - Math.exp(-dt * 1.4);
      const tg = target.current;
      cur.ax += (tg.ax - cur.ax) * k;
      cur.ay += (tg.ay - cur.ay) * k;
      cur.fx += (tg.fx - cur.fx) * k;
      cur.fy += (tg.fy - cur.fy) * k;
      cur.amp += (tg.amp - cur.amp) * k;
      cur.speed += (tg.speed - cur.speed) * k;
      phase = (phase + dt * cur.speed) % 1.6;

      ripples = ripples.filter((r) => t - r.t0 < LIFE);
      const rings = ripples.map((r) => {
        const age = t - r.t0;
        return { x: r.x, y: r.y, radius: age * SPREAD, fade: Math.pow(1 - age / LIFE, 1.5) };
      });

      let w = 0;
      const wp = warp.current;
      if (wp) {
        const el = now - wp.t0;
        if (wp.dir === "in") w = Math.min(1, el / 800);
        else {
          w = Math.max(0, 1 - el / 700);
          if (w === 0) {
            warp.current = null;
            document.documentElement.classList.remove("warping");
          }
        }
        w = w * w * (3 - 2 * w);
      }

      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `${CELL_H - 4}px NerdMono, Consolas, monospace`;
      ctx.textBaseline = "top";

      const sweep = phase - 0.3;
      const lastIdx = RAMP.length - 1;
      const seed = seedRef.current;
      const ax = cur.ax + seed.jx;
      const ay = cur.ay + seed.jy;
      const norm = (1.15 / (Math.abs(ax) + Math.abs(ay))) * 0.5;
      const aspect = CELL_W / CELL_H;

      for (let y = 0; y < rows; y++) {
        const v = y / rows;
        for (let x = 0; x < cols; x++) {
          const u = x / cols;
          const warp =
            (Math.sin(u * cur.fx + t * 0.9 + seed.a + Math.sin(v * 4 - t * 0.6 + seed.b) * 1.6) * 0.06 +
              Math.sin(v * cur.fy - t * 0.7 + u * 3 + seed.c) * 0.03) *
            cur.amp;
          const diag = (ax * (u - 0.5) + ay * (v - 0.5)) * norm * 2 + 0.575 + warp;
          const band = Math.exp(-Math.pow((diag - sweep) * 5.5, 2));
          const trail = diag < sweep ? Math.exp((diag - sweep) * 3) * 0.28 : 0;
          const grain = Math.sin(x * 12.9898 + y * 78.233 + seed.n) * 43758.5453;
          const noise = (grain - Math.floor(grain)) * 0.08;
          const dx = (u - 0.5) * 2.4;
          const dy = (v - 0.5) * 2.2;
          const quiet = Math.min(1, Math.max(0, Math.hypot(dx, dy) - 0.25) / 0.55);
          let l = Math.min(1, band + trail + noise * (band + trail + 0.2)) * (0.08 + 0.92 * quiet * quiet);
          if (w > 0) {
            const d = Math.hypot(dx, dy) + 0.02;
            const ang = Math.atan2(dy, dx);
            const tl = Math.pow(0.5 + 0.5 * Math.sin(1.6 / d - t * (4 + w * 18) + Math.sin(ang * 6 + t) * 0.6), 2) * Math.min(1, d * 1.4);
            l = l * (1 - w) + tl * w;
          }

          for (let i = 0; i < rings.length; i++) {
            const r = rings[i];
            const d = Math.hypot((x - r.x) * aspect, y - r.y);
            const off = d - r.radius * aspect;
            l += Math.exp(-(off * off) / 6) * r.fade * 0.75;
          }
          if (l > 1) l = 1;

          if (l < 0.06) continue;
          ctx.fillStyle = SHADES[Math.round(l * 120)];
          ctx.fillText(RAMP[Math.min(Math.floor(l * lastIdx), lastIdx)], x * CELL_W, y * CELL_H);
        }
      }

      if (!reduce) frame = requestAnimationFrame(draw);
    };

    resize();
    document.fonts
      .load(`${CELL_H - 4}px NerdMono`)
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        if (!alive) return;
        canvas.style.opacity = "1";
        last = performance.now();
        frame = requestAnimationFrame(draw);
      });
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("warp-in", onWarp);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("warp-in", onWarp);
    };
  }, []);

  return <canvas ref={canvasRef} className="field" style={{ opacity: 0, transition: "opacity 400ms ease" }} aria-hidden="true" />;
}



