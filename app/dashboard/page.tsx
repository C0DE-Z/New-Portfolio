import { redirect } from "next/navigation";
import { isAdmin } from "../auth";
import { pool, ready, type Media, type Post } from "../db";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Code-Z | Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  if (!(await isAdmin())) redirect("/login");
  await ready();
  const posts = (await pool.query("SELECT id, title, created_at FROM posts ORDER BY created_at DESC")).rows as Pick<Post, "id" | "title" | "created_at">[];
  const media = (await pool.query("SELECT post_id FROM media")).rows as Pick<Media, "post_id">[];
  const counts = new Map<string, number>();
  media.forEach((m) => counts.set(m.post_id, (counts.get(m.post_id) ?? 0) + 1));
  return (
    <Dashboard
      posts={posts.map((p) => ({ id: p.id, title: p.title, date: p.created_at.toISOString().slice(0, 10), files: counts.get(p.id) ?? 0 }))}
    />
  );
}
