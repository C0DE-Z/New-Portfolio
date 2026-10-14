import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;
type Ctx = { params: Promise<{ id: string; logId: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, logId } = await params;
  if (!UUID.test(id) || !UUID.test(logId)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { body } = (await request.json().catch(() => ({}))) as { body?: unknown };
  if (typeof body !== "string" || !body.trim() || body.length > 20_000) {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }
  await ready();
  await pool.query("UPDATE devlogs SET body = $1, updated_at = now() WHERE id = $2 AND project_id = $3", [body, logId, id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, logId } = await params;
  if (!UUID.test(id) || !UUID.test(logId)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await ready();
  await pool.query("DELETE FROM devlogs WHERE id = $1 AND project_id = $2", [logId, id]);
  return NextResponse.json({ ok: true });
}
