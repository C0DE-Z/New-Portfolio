function hsl(h: number, s: number, l: number) {
  return `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
}

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h;
}

const seedCache = new Map<string, { h1: number; h2: number; sat: number; mode: number; lo: number }>();
function seedPalette(seed: string) {
  let p = seedCache.get(seed);
  if (!p) {
    let a = hashSeed(seed);
    const r = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    p = { h1: r() * 360, h2: r() * 360, sat: 70 + r() * 30, mode: Math.floor(r() * 3), lo: 15 + r() * 15 };
    if (seedCache.size > 50) seedCache.clear();
    seedCache.set(seed, p);
  }
  return p;
}

export function color(p: string, v: number, t: number, shift: number, seed: string) {
  switch (p) {
    case "sunset":
      return hsl(330 + v * 80 + shift, 95, 25 + v * 45);
    case "toxic":
      return hsl(v < 0.5 ? 120 + shift : 60 + shift, 100, 20 + v * 50);
    case "candy":
      return hsl(v < 0.33 ? 320 + shift : v < 0.66 ? 190 + shift : 50 + shift, 90, 45 + v * 25);
    case "ice":
      return hsl(185 + v * 40 + shift, 70 + v * 30, 30 + v * 60);
    case "blood":
      return hsl(355 + v * 15 + shift, 90, 12 + v * 50);
    case "gold":
      return hsl(40 + v * 20 + shift, 95, 20 + v * 55);
    case "vapor":
      return hsl(v < 0.5 ? 280 + shift : 170 + shift, 85, 35 + v * 40);
    case "seeded": {
      const q = seedPalette(seed);
      const hue = q.mode === 0 ? (v < 0.5 ? q.h1 : q.h2) : q.mode === 1 ? q.h1 + (q.h2 - q.h1) * v : q.h1 + v * 120 + t * 10;
      return hsl(hue + shift, q.sat, q.lo + v * (70 - q.lo));
    }
    case "rainbow":
      return hsl(v * 360 + t * 40 + shift, 100, 35 + v * 35);
    case "watchdogs":
      return hsl(v < 0.5 ? 180 + shift : 310 + shift, 100, 30 + v * 45);
    case "acid":
      return hsl(95 + v * 60 + shift, 100, 25 + v * 45);
    case "fire":
      return hsl(v * 60 + shift, 100, 20 + v * 50);
    case "ocean":
      return hsl(190 + v * 70 + shift, 90, 25 + v * 45);
    default:
      return hsl(shift, 0, 20 + v * 70);
  }
}
