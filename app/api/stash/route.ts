import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { pool, ready } from "../../db";

export const runtime = "nodejs";

type Entry = { id: string; salt: string; hash: string; type?: "link" | "text" | "post"; url?: string; title?: string; body?: string };
const PAGE_WORDS: { path: string; words: string[] }[] = [
  { path: "/", words: ["home", "main", "start", "welcome"] },
  { path: "/projects", words: ["project", "projects", "things", "work", "portfolio"] },
  { path: "/contact", words: ["contact", "social", "email", "reach"] },
  { path: "/code", words: ["code", "words", "stash", "codes"] },
];

const WINDOW = 60_000;
const LIMIT = 8;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

async function match(code: string): Promise<Entry | null> {
  await ready();
  const { rows } = await pool.query("SELECT id, salt, hash, type, url, title, body FROM codes");
  const posts = await pool.query("SELECT id::STRING AS id, salt, hash FROM posts WHERE hash IS NOT NULL");
  let found: Entry | null = null;
  for (const e of [...(rows as Entry[]), ...posts.rows.map((p) => ({ ...p, type: "post" as const }))]) {
    const a = scryptSync(code, e.salt, 32);
    if (timingSafeEqual(a, Buffer.from(e.hash, "hex"))) found = e;
  }
  return found;
}

function editDistance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return prev[b.length];
}

function relatedPage(input: string) {
  const words = input.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (!words.length) return null;
  let best: { path: string; score: number } | null = null;
  for (const page of PAGE_WORDS) {
    for (const alias of page.words) {
      for (const word of words) {
        const score = 1 - editDistance(word, alias) / Math.max(word.length, alias.length);
        if (!best || score > best.score) best = { path: page.path, score };
      }
    }
  }
  return best && best.score >= 0.68 ? best.path : null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  try {
    const { name } = await request.json();
    if (typeof name !== "string" || !name || name.length > 128) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const entry = await match(name);
    if (!entry) {
      const path = relatedPage(name);
      if (path) return NextResponse.json({ type: "page", path });
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }
    if (entry.type === "post") return NextResponse.json({ type: "post", id: entry.id });
    if (entry.type === "text") {
      return NextResponse.json({ type: "text", title: entry.title ?? "", body: entry.body ?? "" });
    }
    if (!entry.url) return NextResponse.json({ error: "Invalid entry" }, { status: 500 });
    return NextResponse.json({ type: "link", url: entry.url });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
}

