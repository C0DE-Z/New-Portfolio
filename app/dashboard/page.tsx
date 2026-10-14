import { redirect } from "next/navigation";
import { isAdmin } from "@/app/lib/auth";
import { pool, ready, type Devlog, type Media, type Post, type Project } from "@/app/lib/db";
import Dashboard from "@/app/components/dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Code-Z | Dashboard", robots: { index: false } };

const iso = (d: Date | null) => (d ? new Date(d).toISOString() : null);

export default async function DashboardPage() {
  if (!(await isAdmin())) redirect("/login");
  await ready();
  const posts = (await pool.query("SELECT id, title, body, created_at, updated_at FROM posts ORDER BY created_at DESC")).rows as (Post & { updated_at: Date | null })[];
  const projects = (await pool.query("SELECT id, name, slug, summary, body, link, created_at, updated_at FROM projects ORDER BY created_at DESC")).rows as (Project & { updated_at: Date | null })[];
  const logs = (await pool.query("SELECT id, project_id, body, created_at, updated_at FROM devlogs ORDER BY created_at DESC")).rows as (Devlog & { updated_at: Date | null })[];
  const media = (await pool.query("SELECT post_id FROM media")).rows as Pick<Media, "post_id">[];
  const counts = new Map<string, number>();
  media.forEach((m) => counts.set(m.post_id, (counts.get(m.post_id) ?? 0) + 1));
  return (
    <Dashboard
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        summary: p.summary,
        body: p.body,
        link: p.link ?? "",
        created: iso(p.created_at)!,
        updated: iso(p.updated_at),
        files: counts.get(p.id) ?? 0,
        logs: logs
          .filter((l) => l.project_id === p.id)
          .map((l) => ({ id: l.id, body: l.body, created: iso(l.created_at)!, updated: iso(l.updated_at) })),
      }))}
      posts={posts.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        created: iso(p.created_at)!,
        updated: iso(p.updated_at),
        files: counts.get(p.id) ?? 0,
      }))}
    />
  );
}