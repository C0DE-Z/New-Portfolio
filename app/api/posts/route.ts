import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/auth";
import { randomBytes, scryptSync } from "node:crypto";
import { pool, ready } from "@/app/lib/db";

export const runtime = "nodejs";

const MAX_FILE = 25 * 1024 * 1024;
const MAX_TOTAL = 60 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpeg|gif|webp|avif)|video\/(mp4|webm|ogg|quicktime)|audio\/(mpeg|mp3|ogg|wav|x-wav|webm|mp4|aac|flac|x-m4a))$/;

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? "");
    const code = String(form.get("code") ?? "").trim();
    if (!code || code.length > 128 || !title || title.length > 200 || body.length > 100_000) {
      return NextResponse.json({ error: "Invalid post" }, { status: 400 });
    }
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    let total = 0;
    for (const f of files) {
      total += f.size;
      if (f.size > MAX_FILE || total > MAX_TOTAL || !ALLOWED.test(f.type)) {
        return NextResponse.json({ error: `Rejected file: ${f.name}` }, { status: 400 });
      }
    }
    await ready();
    const salt = randomBytes(16).toString("hex");
    const { rows } = await pool.query("INSERT INTO posts (title, body, salt, hash) VALUES ($1, $2, $3, $4) RETURNING id", [
      title,
      body,
      salt,
      scryptSync(code, salt, 32).toString("hex"),
    ]);
    const id = rows[0].id as string;
    for (const f of files) {
      await pool.query("INSERT INTO media (post_id, name, mime, size, data) VALUES ($1,$2,$3,$4,$5)", [
        id,
        f.name.slice(0, 200),
        f.type,
        f.size,
        Buffer.from(await f.arrayBuffer()),
      ]);
    }
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

