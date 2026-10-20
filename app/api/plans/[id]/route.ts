import { NextResponse } from "next/server";
import { randomBytes, scryptSync } from "node:crypto";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";
import { parsePlanKeywords, parsePlanTodos, PLAN_STATUSES } from "@/app/lib/plans";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const body = await request.json().catch(() => null);
  const j: Record<string, unknown> =
    typeof body === "object" && body !== null && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const summary = String(j.summary ?? "").trim();
  const status = String(j.status ?? "");
  const storyboard = String(j.storyboard ?? "");
  const codeword = String(j.codeword ?? "").trim();
  const keywords = parsePlanKeywords(j.keywords);
  const todos = parsePlanTodos(j.todos);
  if (
    summary.length > 300 ||
    codeword.length > 128 ||
    storyboard.length > 100_000 ||
    !PLAN_STATUSES.includes(status as (typeof PLAN_STATUSES)[number]) ||
    !keywords ||
    !todos
  ) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  await ready();
  const salt = codeword ? randomBytes(16).toString("hex") : null;
  const hash = salt ? scryptSync(codeword, salt, 32).toString("hex") : null;
  const result = await pool.query(
    "UPDATE plans AS p SET name=COALESCE((SELECT projects.name FROM projects WHERE projects.id=p.project_id),p.name), summary=$1, status=$2, keywords=$3::jsonb, storyboard=$4, todos=$5::jsonb, salt=COALESCE($6,salt), hash=COALESCE($7,hash), updated_at=now() WHERE p.id=$8",
    [summary, status, JSON.stringify(keywords), storyboard, JSON.stringify(todos), salt, hash, id],
  );
  if (!result.rowCount) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await ready();
  const result = await pool.query("DELETE FROM plans WHERE id = $1", [id]);
  if (!result.rowCount) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
