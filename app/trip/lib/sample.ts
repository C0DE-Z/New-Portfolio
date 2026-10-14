import type { Audio } from "@/app/trip/lib/settings";

export function sample(
  effect: string,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  a: Audio,
  seeds: Float32Array
): number {
  const nx = (x / w) * 2 - 1;
  const ny = ((y / h) * 2 - 1) * (h / w) * 2;
  const bump = 1 + a.bass * 2;
  switch (effect) {
    case "tunnel": {
      const d = Math.hypot(nx, ny) + 0.0001;
      const ang = Math.atan2(ny, nx);
      return 0.5 + 0.5 * Math.sin(1.5 / d + t * 3 * bump + Math.sin(ang * 4 + t) * (1 + a.mid * 3));
    }
    case "waves": {
      const s =
        Math.sin(nx * 6 + t * 2) * 0.4 * bump +
        Math.sin(ny * 8 - t * 1.5 + nx * 3) * 0.3 +
        Math.sin((nx + ny) * 10 + t * 3) * 0.3 * (1 + a.high * 3);
      return 0.5 + 0.5 * Math.sin(s * 4 + ny * 5);
    }
    case "vortex": {
      const d = Math.hypot(nx, ny);
      const ang = Math.atan2(ny, nx) + d * (4 + a.mid * 6) - t * 2;
      return 0.5 + 0.5 * Math.sin(ang * 3 + d * 8 * bump);
    }
    case "matrix": {
      const i = ((Math.floor(x) % seeds.length) + seeds.length) % seeds.length;
      const speed = 0.3 + seeds[i] * 1.2;
      const head = (t * speed * (1 + a.bass) * 6 + seeds[i] * 100) % (h + 20);
      const dist = head - y;
      if (dist < 0 || dist > 18) return 0;
      return 1 - dist / 18 + (a.high > 0.4 && Math.random() < 0.05 ? 0.4 : 0);
    }
    case "interference": {
      const c1 = Math.hypot(nx - Math.sin(t * 0.7) * 0.6, ny - Math.cos(t * 0.5) * 0.4);
      const c2 = Math.hypot(nx + Math.cos(t * 0.6) * 0.6, ny + Math.sin(t * 0.8) * 0.4);
      return 0.5 + 0.5 * Math.sin((c1 + c2) * (12 + a.mid * 10) - t * 4 * bump);
    }
    case "ripples": {
      const p1 = Math.hypot(nx - Math.sin(t * 0.9) * 0.7, ny - Math.cos(t * 0.7) * 0.35);
      const p2 = Math.hypot(nx + Math.cos(t * 0.5) * 0.6, ny + Math.sin(t * 1.1) * 0.35);
      const p3 = Math.hypot(nx - Math.cos(t * 0.3) * 0.2, ny - Math.sin(t * 0.4) * 0.5);
      const r = (d: number, ph: number) => Math.sin(d * 18 - t * 5 * bump + ph) / (1 + d * 3);
      return 0.5 + 0.55 * (r(p1, 0) + r(p2, 2) + r(p3, 4)) / 1.5;
    }
    case "spiral": {
      const d = Math.hypot(nx, ny) + 0.001;
      const ang = Math.atan2(ny, nx);
      const arms = 3 + Math.round(a.mid * 3);
      return 0.5 + 0.5 * Math.sin(arms * ang + Math.log(d) * 9 * bump - t * 3);
    }
    case "kaleido": {
      const d = Math.hypot(nx, ny);
      const seg = 6;
      let ang = Math.atan2(ny, nx) + t * 0.2;
      const sl = (Math.PI * 2) / seg;
      ang = Math.abs(((ang % sl) + sl) % sl - sl / 2);
      const kx = Math.cos(ang) * d;
      const ky = Math.sin(ang) * d;
      return 0.5 + 0.25 * (Math.sin(kx * 14 + t * 2) + Math.sin(ky * 14 - t * 1.5 * bump) + 0.5 * Math.sin((kx + ky) * 20 + t));
    }
    case "metaballs": {
      let f = 0;
      for (let i = 0; i < 5; i++) {
        const bx = Math.sin(t * (0.4 + i * 0.23) + i * 2) * 0.8;
        const by = Math.cos(t * (0.5 + i * 0.17) + i) * 0.45;
        const dd = (nx - bx) ** 2 + (ny - by) ** 2 + 0.01;
        f += (0.05 + a.bass * 0.06) / dd;
      }
      return Math.min(1, f * 0.35);
    }
    case "julia": {
      let zx = nx * 1.4;
      let zy = ny * 1.4;
      const cx = -0.75 + Math.sin(t * 0.3) * 0.12 + a.mid * 0.05;
      const cy = 0.11 + Math.cos(t * 0.37) * 0.12;
      let i = 0;
      for (; i < 24; i++) {
        const nzx = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = nzx;
        if (zx * zx + zy * zy > 4) break;
      }
      return i === 24 ? 0.05 : i / 24;
    }
    case "checker": {
      const sz = 0.35 + Math.sin(t * 0.5) * 0.1;
      const rot = t * 0.3;
      const rx = nx * Math.cos(rot) - ny * Math.sin(rot);
      const ry = nx * Math.sin(rot) + ny * Math.cos(rot);
      const warp = Math.sin(Math.hypot(nx, ny) * 4 - t * 2 * bump) * 0.15;
      const c = Math.floor((rx + warp) / sz) + Math.floor((ry + warp) / sz);
      return 0.15 + 0.7 * (((c % 2) + 2) % 2) * (0.7 + 0.3 * Math.sin(t + rx * 3));
    }
    case "rain": {
      const col = ((Math.floor(x) % seeds.length) + seeds.length) % seeds.length;
      const sp = 0.4 + seeds[col] * 1.4;
      const ph = (y / h + t * sp * 0.4 + seeds[col] * 7) % 1;
      return Math.pow(1 - ph, 3) * (seeds[(col * 7) % seeds.length] > 0.35 ? 1 : 0.3) + a.high * 0.1;
    }
    case "flow": {
      const ang = Math.sin(nx * 3 + t * 0.6) + Math.cos(ny * 3 - t * 0.5);
      const fx = nx + Math.cos(ang * 2) * 0.3;
      const fy = ny + Math.sin(ang * 2) * 0.3;
      return 0.5 + 0.5 * Math.sin((fx * 6 + fy * 6) + ang * 3 + t * 2 * bump);
    }
    default: {
      const v =
        Math.sin(nx * 5 + t) +
        Math.sin(ny * 5 + t * 1.3) +
        Math.sin((nx + ny) * 4 + t * 0.7) +
        Math.sin(Math.hypot(nx, ny) * 8 - t * 2 * bump);
      return 0.5 + 0.25 * v;
    }
  }
}
