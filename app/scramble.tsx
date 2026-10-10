"use client";
import { useEffect, useRef, useState } from "react";
// thank you to fireship
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789#%@&*+=";

export default function Scramble({ base, alt }: { base: string; alt: string }) {
  const [text, setText] = useState(base);
  const raf = useRef(0);
  const target = useRef(base);

  const run = (to: string) => {
    cancelAnimationFrame(raf.current);
    target.current = to;
    const from = text;
    const len = Math.max(from.length, to.length);
    const start = performance.now();
    const step = (now: number) => {
      const p = (now - start) / 450;
      let out = "";
      for (let i = 0; i < len; i++) {
        const settle = (i + 1) / len;
        if (p >= settle * 0.8 + 0.2 * (i / len)) out += to[i] ?? "";
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setText(out);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setText(to);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <span
      className="name"
      onMouseEnter={() => run(alt)}
      onMouseLeave={() => run(base)}
      style={{ minWidth: `${Math.max(base.length, alt.length)}ch` }}
    >
      {text}
    </span>
  );
}
