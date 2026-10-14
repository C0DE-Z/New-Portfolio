export type Settings = {
  effect: string;
  palette: string;
  seed: string;
  charset: string;
  cell: number;
  speed: number;
  intensity: number;
  hueShift: number;
  glitch: number;
  trails: number;
  invert: boolean;
  audio: boolean;
  sensitivity: number;
  beat: number;
  overlay: boolean;
  bassTo: string;
  midTo: string;
  highTo: string;
  bassAmt: number;
  midAmt: number;
  highAmt: number;
  cycle: string;
  cycleBeats: number;
  cycleSecs: number;
  cycEffect: boolean;
  cycPalette: boolean;
  cycChars: boolean;
};

export const TARGETS = ["none", "warp", "size", "brightness", "hue", "glitch", "speed", "trails"];

export const EFFECTS = ["plasma", "tunnel", "waves", "vortex", "matrix", "interference", "metaballs", "julia", "checker", "ripples", "spiral", "kaleido", "rain", "flow"];
export const PALETTES = ["rainbow", "watchdogs", "acid", "fire", "ocean", "mono", "sunset", "toxic", "candy", "ice", "blood", "gold", "vapor", "seeded"];
export const CHARSETS: Record<string, string> = {
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
  glyphs: " .·:;+x%&$@#",
  kana: " ・ｱｲｳｴｵｶｷｸｹｺﾊﾐﾑﾒﾓ",
};

export const DEFAULTS: Settings = {
  effect: "plasma",
  palette: "watchdogs",
  seed: "code-z",
  charset: "classic",
  cell: 12,
  speed: 1,
  intensity: 1,
  hueShift: 0,
  glitch: 0.3,
  trails: 0.35,
  invert: false,
  audio: false,
  sensitivity: 1.5,
  beat: 0.6,
  overlay: false,
  bassTo: "warp",
  midTo: "hue",
  highTo: "glitch",
  bassAmt: 1,
  midAmt: 1,
  highAmt: 1,
  cycle: "off",
  cycleBeats: 16,
  cycleSecs: 12,
  cycEffect: true,
  cycPalette: false,
  cycChars: false,
};

export const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const randomSeed = () => Math.random().toString(36).slice(2, 8);

export type Audio = { bass: number; mid: number; high: number };
