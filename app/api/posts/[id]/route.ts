import { NextResponse } from "next/server";
import { isAdmin } from "../../../auth";
import { pool, ready } from "../../../db";

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
