import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await ready();
  await pool.query("DELETE FROM media WHERE post_id = $1", [id]);
  await pool.query("DELETE FROM devlogs WHERE project_id = $1", [id]);
  await pool.query("DELETE FROM projects WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const j = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(j.name ?? "").trim();
  const summary = String(j.summary ?? "").trim();
  const body = String(j.body ?? "");
  const link = String(j.link ?? "").trim();
  if (!name || name.length > 100 || summary.length > 300 || body.length > 100_000) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }
  if (link && !/^https?:\/\/\S+$/i.test(link)) return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  await ready();
  await pool.query("UPDATE projects SET name=$1, summary=$2, body=$3, link=$4, updated_at=now() WHERE id=$5", [name, summary, body, link || null, id]);
  return NextResponse.json({ ok: true });
}