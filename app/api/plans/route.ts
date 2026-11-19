import { NextRequest, NextResponse } from "next/server";
import { randomBytes, scryptSync } from "node:crypto";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready } from "@/app/lib/db";
import { parsePlanKeywords, parsePlanTodos, PLAN_STATUSES } from "@/app/lib/plans";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "");
  const codeword = String(form.get("codeword") ?? "").trim();
  const summary = String(form.get("summary") ?? "").trim();
  const status = String(form.get("status") ?? "idea");
  const storyboard = String(form.get("storyboard") ?? "");
  const keywords = parsePlanKeywords(form.get("keywords") ?? "");
  const todos = parsePlanTodos(form.get("todos") ?? "");
  if (
    !/^[0-9a-f-]{36}$/i.test(projectId) ||
    !codeword ||
    codeword.length > 128 ||
    summary.length > 300 ||
    storyboard.length > 100_000 ||
    !PLAN_STATUSES.includes(status as (typeof PLAN_STATUSES)[number]) ||
    !keywords ||
    !todos
  ) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await ready();
  const project = (await pool.query("SELECT id, name FROM projects WHERE id = $1", [projectId])).rows[0] as
    | { id: string; name: string }
    | undefined;
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const salt = randomBytes(16).toString("hex");
  try {
    const { rows } = await pool.query(
      "INSERT INTO plans (project_id, salt, hash, name, summary, status, keywords, storyboard, todos) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb) RETURNING id",
      [
        project.id,
        salt,
        scryptSync(codeword, salt, 32).toString("hex"),
        project.name,
        summary,
        status,
        JSON.stringify(keywords),
        storyboard,
        JSON.stringify(todos),
      ],
    );
    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "This project already has a plan" }, { status: 409 });
    }
    throw error;
  }
}
