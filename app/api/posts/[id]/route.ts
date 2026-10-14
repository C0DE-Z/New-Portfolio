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
  await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const j = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(j.title ?? "").trim();
  const body = String(j.body ?? "");
  if (!title || title.length > 200 || body.length > 100_000) return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  await ready();
  await pool.query("UPDATE posts SET title=$1, body=$2, updated_at=now() WHERE id=$3", [title, body, id]);
  return NextResponse.json({ ok: true });
}