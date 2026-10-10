import { NextRequest, NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { pool, ready } from "../../db";

export const runtime = "nodejs";

type Entry = { id: string; salt: string; hash: string; type?: "link" | "text" | "post"; url?: string; title?: string; body?: string };

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

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  try {
    const { name } = await request.json();
    if (typeof name !== "string" || !name || name.length > 128) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const entry = await match(name);
    if (!entry) return NextResponse.json({ error: "Invalid code" }, { status: 401 });
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


