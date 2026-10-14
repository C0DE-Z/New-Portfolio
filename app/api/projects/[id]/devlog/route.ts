import { NextResponse } from "next/server";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { body } = (await request.json().catch(() => ({}))) as { body?: unknown };
  if (typeof body !== "string" || !body.trim() || body.length > 20_000) {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }
  await ready();
  const exists = (await pool.query("SELECT 1 FROM projects WHERE id = $1", [id])).rows.length;
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await pool.query("INSERT INTO devlogs (project_id, body) VALUES ($1, $2)", [id, body]);
  return NextResponse.json({ ok: true });
}
