const hits = new Map<string, number[]>();

export function limited(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
