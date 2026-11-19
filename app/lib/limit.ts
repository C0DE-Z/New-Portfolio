const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;
let nextSweep = 0;

export function limited(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  if (now >= nextSweep) {
    nextSweep = now + windowMs;
    for (const [storedKey, timestamps] of hits) {
      const active = timestamps.filter((timestamp) => now - timestamp < windowMs);
      if (active.length) hits.set(storedKey, active);
      else hits.delete(storedKey);
    }
  }
  if (!hits.has(key) && hits.size >= MAX_KEYS) {
    const oldestKey = hits.keys().next().value as string | undefined;
    if (oldestKey) hits.delete(oldestKey);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  const isLimited = recent.length > limit;
  hits.set(key, recent.slice(-Math.max(limit, 1)));
  return isLimited;
}

export const clientIp = (h: Headers) => {
  const ip = h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",").pop()?.trim();
  return ip && /^[a-f0-9:.]+$/i.test(ip) ? ip : "unknown";
};
