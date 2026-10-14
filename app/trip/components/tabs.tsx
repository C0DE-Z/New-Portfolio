import { CHARSETS, EFFECTS, PALETTES, TARGETS, type Settings } from "@/app/trip/lib/settings";
import { Check, Choice, Slider, field, label } from "@/app/trip/components/controls";

export type TabProps = {
  s: Settings;
  set: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
};

export function LookTab({ s, set }: TabProps) {
  return (
    <>
      <Choice title="effect" options={EFFECTS} value={s.effect} onPick={(o) => set("effect", o)} />
      <Choice title="characters" options={Object.keys(CHARSETS)} value={s.charset} onPick={(o) => set("charset", o)} />
      <Slider s={s} set={set} k="cell" name="cell size" min={6} max={32} step={1} />
      <Slider s={s} set={set} k="speed" name="speed" min={0} max={4} step={0.05} />
      <Slider s={s} set={set} k="intensity" name="contrast" min={0.3} max={4} step={0.05} />
      <Slider s={s} set={set} k="glitch" name="glitch" min={0} max={1} step={0.01} />
      <Slider s={s} set={set} k="trails" name="trails" min={0} max={1} step={0.01} />
      <Check s={s} set={set} k="invert" name="invert" />
    </>
  );
}

export function ColorTab({ s, set }: TabProps) {
  return (
    <>
      <Choice title="palette" options={PALETTES} value={s.palette} onPick={(o) => set("palette", o)} />
      {s.palette === "seeded" && (
        <div className="flex gap-2 text-xs">
          <input
            className={field}
            value={s.seed}
            maxLength={40}
            placeholder="type a seed"
            onChange={(e) => set("seed", e.target.value)}
          />
          <button
            onClick={() => set("seed", Math.random().toString(36).slice(2, 8))}
            className="border border-neutral-700 px-2 hover:border-cyan-400"
          >
            roll
          </button>
        </div>
      )}
      <Slider s={s} set={set} k="hueShift" name="hue shift" min={0} max={360} step={1} />
    </>
  );
}

const bandColor = { bass: "text-pink-400", mid: "text-cyan-400", high: "text-neutral-200" };

export function AudioTab({
  s,
  set,
  msg,
  src,
  setSrc,
  startFile,
  meterRef,
}: TabProps & {
  msg: string;
  src: "mic" | "file";
  setSrc: (v: "mic" | "file") => void;
  startFile: (f: File) => void;
  meterRef: React.RefObject<HTMLCanvasElement>;
}) {
  const sourceBtn = (v: string) => `flex-1 border px-2 py-1 ${src === v ? "border-cyan-400" : "border-neutral-700"}`;

  return (
    <>
      <Check s={s} set={set} k="audio" name="audio reactive" />
      {s.audio && (
        <>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setSrc("mic")} className={sourceBtn("mic")}>
              mic
            </button>
            <label className={`${sourceBtn("file")} text-center cursor-pointer`}>
              file
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSrc("file");
                    startFile(f);
                  }
                }}
              />
            </label>
          </div>
          <div className="text-[10px] text-neutral-500">{msg || "pick mic or upload a track"}</div>
          <canvas ref={meterRef} width={240} height={110} className="w-full border border-neutral-800" />
          <div className="text-[10px] text-neutral-500 leading-relaxed">
            <span className="text-pink-400">bass</span> grows cells, brightens, kicks the speed.{" "}
            <span className="text-cyan-400">mid</span> shifts hue and bends the shapes.{" "}
            <span className="text-neutral-200">high</span> adds glitch. The dot flashes on each detected beat.
          </div>
          <Slider s={s} set={set} k="sensitivity" name="sensitivity" min={0.5} max={4} step={0.05} />
          <div className="border-t border-neutral-800 pt-3 space-y-2">
            <div className={label}>what reacts</div>
            {(["bass", "mid", "high"] as const).map((b) => (
              <div key={b} className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 items-center">
                <span className={`text-[10px] ${bandColor[b]}`}>{b}</span>
                <select className={field} value={s[`${b}To`]} onChange={(e) => set(`${b}To`, e.target.value)}>
                  {TARGETS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.05}
                  value={s[`${b}Amt`]}
                  onChange={(e) => set(`${b}Amt`, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <Slider s={s} set={set} k="beat" name="beat kick" min={0} max={1} step={0.01} />
          <Check s={s} set={set} k="overlay" name="show spectrum on screen" />
        </>
      )}
      <div className="border-t border-neutral-800 pt-3 space-y-2">
        <div className={label}>auto-cycle</div>
        <Choice
          title=""
          options={["off", "beat", "timer"]}
          value={s.cycle}
          onPick={(o) => set("cycle", o)}
          names={{ beat: "every N beats", timer: "every N sec" }}
        />
        {s.cycle === "beat" && <Slider s={s} set={set} k="cycleBeats" name="beats" min={2} max={64} step={1} />}
        {s.cycle === "timer" && <Slider s={s} set={set} k="cycleSecs" name="seconds" min={2} max={60} step={1} />}
        {s.cycle !== "off" && (
          <div className="flex gap-3 text-[11px] flex-wrap">
            <Check s={s} set={set} k="cycEffect" name="effect" />
            <Check s={s} set={set} k="cycPalette" name="palette" />
            <Check s={s} set={set} k="cycChars" name="characters" />
          </div>
        )}
      </div>
    </>
  );
}
