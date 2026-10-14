import type { Settings } from "@/app/trip/lib/settings";

export const label = "text-[10px] uppercase tracking-widest text-neutral-400";
export const field =
  "w-full bg-black border border-neutral-700 text-neutral-200 text-xs px-2 py-1 outline-none focus:border-cyan-400";

const on = "border-cyan-400 text-cyan-300";
const off = "border-neutral-700 text-neutral-400 hover:border-neutral-500";

type Setter = <K extends keyof Settings>(k: K, v: Settings[K]) => void;

export function Choice({
  title,
  options,
  value,
  onPick,
  names,
}: {
  title: string;
  options: string[];
  value: string;
  onPick: (o: string) => void;
  names?: Record<string, string>;
}) {
  return (
    <div>
      <div className={label}>{title}</div>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {options.map((o) => (
          <button key={o} onClick={() => onPick(o)} className={`border px-1 py-1 text-[10px] truncate ${value === o ? on : off}`}>
            {names?.[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Slider({
  s,
  set,
  k,
  name,
  min,
  max,
  step,
}: {
  s: Settings;
  set: Setter;
  k: keyof Settings;
  name: string;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block">
      <div className={`${label} flex justify-between`}>
        <span>{name}</span>
        <span>{Number(s[k]).toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number(s[k])}
        onChange={(e) => set(k, Number(e.target.value) as never)}
        className="w-full accent-cyan-400"
      />
    </label>
  );
}

export function Check({ s, set, k, name }: { s: Settings; set: Setter; k: keyof Settings; name: string }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input type="checkbox" checked={Boolean(s[k])} onChange={(e) => set(k, e.target.checked as never)} />
      {name}
    </label>
  );
}
