"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { color } from "@/app/trip/lib/color";
import { drawMeter } from "@/app/trip/lib/meter";
import Panel from "@/app/trip/components/panel";
import { sample } from "@/app/trip/lib/sample";
import { CHARSETS, DEFAULTS, EFFECTS, PALETTES, pick, randomSeed, type Settings } from "@/app/trip/lib/settings";
import { useAudio } from "@/app/trip/hooks/use-audio";

export default function TripPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meterRef = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [open, setOpen] = useState(true);
  const settings = useRef(s);
  settings.current = s;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const denied = useCallback(() => setS((p) => ({ ...p, audio: false })), []);
  const { level, analyser, msg, src, setSrc, startFile } = useAudio(s.audio, denied);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const seeds = new Float32Array(400).map(() => Math.random());
    let freq = new Uint8Array(0);
    let beatAvg = 0;
    let beat = 0;
    let lastBeat = 0;
    let beatCount = 0;
    let curEffect = settings.current.effect;
    let prevEffect = curEffect;
    let blend = 1;
    let lastCycle = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      const cur = settings.current;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (cur.effect !== curEffect) {
        prevEffect = curEffect;
        curEffect = cur.effect;
        blend = 0;
      }
      blend = Math.min(1, blend + dt / 1.5);
      const mix = blend * blend * (3 - 2 * blend);
      const lv = cur.audio ? level.current : { bass: 0, mid: 0, high: 0 };
      const m: Record<string, number> = { warp: 0, size: 0, brightness: 0, hue: 0, glitch: 0, speed: 0, trails: 0 };
      const wp = { bass: 0, mid: 0, high: 0 };
      (["bass", "mid", "high"] as const).forEach((b) => {
        const to = cur[`${b}To` as "bassTo"];
        const amt = lv[b] * cur[`${b}Amt` as "bassAmt"];
        if (to === "none") return;
        m[to] += amt;
        if (to === "warp") wp[b] = amt;
      });
      t += dt * cur.speed * (1 + m.speed * 2);

      const doCycle = () => {
        lastCycle = now;
        beatCount = 0;
        setS((p) => {
          const n = { ...p };
          if (p.cycEffect) n.effect = pick(EFFECTS);
          if (p.cycPalette) {
            n.palette = pick(PALETTES);
            n.seed = randomSeed();
          }
          if (p.cycChars) {
            n.charset = pick(Object.keys(CHARSETS));
          }
          return n;
        });
      };
      if (cur.cycle === "timer" && now - lastCycle > cur.cycleSecs * 1000) doCycle();

      const an = analyser.current;
      const live = cur.audio && !!an;
      if (live && an) {
        if (freq.length !== an.frequencyBinCount) freq = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(freq);
        const avg = (x: number, y: number) => {
          let sum = 0;
          for (let i = x; i < y; i++) sum += freq[i];
          return sum / Math.max(1, y - x) / 255;
        };
        const n = freq.length;
        const k = cur.sensitivity;
        const rawBass = avg(0, Math.floor(n * 0.06));
        beatAvg += (rawBass - beatAvg) * 0.04;
        if (rawBass > beatAvg * 1.25 + 0.04 && now - lastBeat > 170) {
          beat = 1;
          lastBeat = now;
          if (cur.cycle === "beat" && ++beatCount >= cur.cycleBeats) doCycle();
        }
        beat *= 0.9;
        const target = {
          bass: Math.min(1, rawBass * k + beat * cur.beat * 0.5),
          mid: Math.min(1, avg(Math.floor(n * 0.06), Math.floor(n * 0.3)) * k),
          high: Math.min(1, avg(Math.floor(n * 0.3), Math.floor(n * 0.7)) * k * 1.5),
        };
        const l = level.current;
        l.bass += (target.bass - l.bass) * 0.5;
        l.mid += (target.mid - l.mid) * 0.5;
        l.high += (target.high - l.high) * 0.5;
      }
      const mc = meterRef.current;
      if (mc) drawMeter(mc, live ? freq : null, level.current, beat, cur.sensitivity);
      const a = wp;

      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.fillStyle = `rgba(0,0,0,${1 - Math.max(0, Math.min(0.95, cur.trails - m.trails * 0.5)) * 0.9})`;
      ctx.fillRect(0, 0, W, H);

      const cw = cur.cell * (1 + m.size * 0.35);
      const ch = cur.cell * 1.7;
      const cols = Math.ceil(W / cw);
      const rows = Math.ceil(H / ch);
      const chars = CHARSETS[cur.charset] ?? CHARSETS.classic;
      ctx.font = `${cur.cell * 1.5}px var(--font-geist-mono), monospace`;
      ctx.textBaseline = "top";

      const shift = cur.hueShift + m.hue * 120;
      const gl = cur.glitch + m.glitch * 0.6;

      for (let r = 0; r < rows; r++) {
        let off = 0;
        if (gl > 0 && Math.random() < gl * 0.02) off = Math.floor((Math.random() - 0.5) * 12 * gl);
        for (let c = 0; c < cols; c++) {
          let v = sample(cur.effect, c + off, r, cols, rows, t, a, seeds);
          if (mix < 1) v = sample(prevEffect, c + off, r, cols, rows, t, a, seeds) * (1 - mix) + v * mix;
          v = Math.max(0, Math.min(1, (v - 0.5) * cur.intensity + 0.5 + m.brightness * 0.3));
          if (cur.invert) v = 1 - v;
          if (v < 0.04) continue;
          let idx = Math.floor(v * (chars.length - 1));
          if (gl > 0 && Math.random() < gl * 0.01) idx = Math.floor(Math.random() * chars.length);
          const chr = chars[idx];
          if (chr === " ") continue;
          const x = c * cw;
          const y = r * ch;
          if (gl > 0.15 && v > 0.6) {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = "rgba(255,0,80,0.35)";
            ctx.fillText(chr, x - gl * 2.5, y);
            ctx.fillStyle = "rgba(0,200,255,0.35)";
            ctx.fillText(chr, x + gl * 2.5, y);
            ctx.globalCompositeOperation = "source-over";
          }
          ctx.fillStyle = color(cur.palette, v, t, shift, cur.seed);
          ctx.fillText(chr, x, y);
        }
      }
      if (cur.overlay && live) {
        const bars = 64;
        const bw = W / bars;
        for (let i = 0; i < bars; i++) {
          const idx = Math.floor(Math.pow(i / bars, 1.7) * freq.length * 0.7);
          const h = (freq[idx] / 255) * H * 0.25 * cur.sensitivity;
          ctx.fillStyle = color(cur.palette, i / bars, t, shift, cur.seed);
          ctx.globalAlpha = 0.6;
          ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [level, analyser]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "SELECT") return;
      if (e.key === "h" || e.key === "H") setOpen((o) => !o);
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {!open && (
        <button
          aria-label="show settings"
          onClick={() => setOpen(true)}
          className="absolute top-0 right-0 z-10 h-8 w-8 opacity-0 hover:opacity-30 text-white text-xs"
        >
          ::
        </button>
      )}
      {open && (
        <Panel
          s={s}
          set={set}
          setS={setS}
          close={() => setOpen(false)}
          audio={{ msg, src, setSrc, startFile, meterRef }}
        />
      )}
    </>
  );
}