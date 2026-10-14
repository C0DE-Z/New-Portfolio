import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";

export const runtime = "nodejs";

const MAX_FILE = 10 * 1024 * 1024;
const MAX_TOTAL = 30 * 1024 * 1024;
const IMAGE = /^image\/(png|jpeg|gif|webp|avif)$/;
const RESERVED = new Set(["new", "api"]);

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const summary = String(form.get("summary") ?? "").trim();
    const body = String(form.get("body") ?? "");
    const link = String(form.get("link") ?? "").trim();
    if (!name || name.length > 100 || summary.length > 300 || body.length > 100_000) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    }
    if (link && !/^https?:\/\/\S+$/i.test(link)) return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
    if (!base || RESERVED.has(base)) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    let total = 0;
    for (const f of files) {
      total += f.size;
      if (f.size > MAX_FILE || total > MAX_TOTAL || !IMAGE.test(f.type)) {
        return NextResponse.json({ error: `Rejected file: ${f.name}` }, { status: 400 });
      }
    }
    await ready();
    const taken = new Set((await pool.query("SELECT slug FROM projects WHERE slug = $1 OR slug LIKE $2", [base, `${base}-%`])).rows.map((r) => r.slug as string));
    let slug = base;
    for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
    const { rows } = await pool.query("INSERT INTO projects (slug, name, summary, body, link) VALUES ($1,$2,$3,$4,$5) RETURNING id", [
      slug,
      name,
      summary,
      body,
      link || null,
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
    return NextResponse.json({ id, slug });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
