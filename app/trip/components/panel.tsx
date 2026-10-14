"use client";
import { useState } from "react";
import { AudioTab, ColorTab, LookTab, type TabProps } from "@/app/trip/components/tabs";
import { CHARSETS, DEFAULTS, EFFECTS, PALETTES, pick, randomSeed, type Settings } from "@/app/trip/lib/settings";

type AudioProps = Omit<Parameters<typeof AudioTab>[0], keyof TabProps>;

const TABS = ["look", "color", "audio"] as const;
const action = "flex-1 border border-neutral-700 px-2 py-1 hover:border-cyan-400";

export default function Panel({
  s,
  set,
  setS,
  close,
  audio,
}: TabProps & {
  setS: (f: (p: Settings) => Settings) => void;
  close: () => void;
  audio: AudioProps;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("look");

  const randomize = () =>
    setS((p) => ({
      ...p,
      effect: pick(EFFECTS),
      palette: pick(PALETTES),
      seed: randomSeed(),
      charset: pick(Object.keys(CHARSETS)),
      hueShift: Math.floor(Math.random() * 360),
      glitch: Math.random(),
    }));

  return (
    <aside className="absolute top-3 right-3 z-10 w-72 max-h-[calc(100vh-1.5rem)] overflow-y-auto border border-neutral-700 bg-black/80 backdrop-blur text-neutral-200">
      <div className="flex border-b border-neutral-700 text-xs sticky top-0 bg-black z-10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 uppercase tracking-widest text-[10px] ${tab === t ? "text-cyan-400 border-b border-cyan-400" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            {t}
            {t === "audio" && s.audio ? " ●" : ""}
          </button>
        ))}
        <button onClick={close} aria-label="hide panel" className="px-3 text-neutral-500 hover:text-white">
          ×
        </button>
      </div>
      <div className="p-3 space-y-3">
        {tab === "look" && <LookTab s={s} set={set} />}
        {tab === "color" && <ColorTab s={s} set={set} />}
        {tab === "audio" && <AudioTab s={s} set={set} {...audio} />}
        <div className="flex gap-2 text-xs border-t border-neutral-800 pt-3">
          <button onClick={() => setS((p) => ({ ...DEFAULTS, audio: p.audio }))} className={action}>
            reset
          </button>
          <button onClick={randomize} className={action}>
            randomize
          </button>
        </div>
      </div>
    </aside>
  );
}
