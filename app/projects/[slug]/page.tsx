import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { WipeLink } from "@/app/components/wipe";
import { pool, ready, type Devlog, type Media, type Project } from "@/app/lib/db";

export const dynamic = "force-dynamic";

const md = (s: string) => <ReactMarkdown>{s}</ReactMarkdown>;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();

  let project: Pick<Project, "name" | "summary" | "body" | "link"> & { date?: string };
  let media: Media[] = [];
  let logs: { id: string; date: string; body: string }[] = [];
  let found = false;
  try {
    await ready();
    const row = (await pool.query("SELECT * FROM projects WHERE slug = $1", [slug])).rows[0] as Project | undefined;
    if (row) {
      found = true;
      project = { ...row, date: row.created_at.toISOString().slice(0, 10) };
      media = (await pool.query("SELECT id, name, mime FROM media WHERE post_id = $1 ORDER BY created_at", [row.id])).rows as Media[];
      logs = ((await pool.query("SELECT id, body, created_at FROM devlogs WHERE project_id = $1 ORDER BY created_at DESC", [row.id])).rows as Devlog[]).map(
        (l) => ({ id: l.id, date: l.created_at.toISOString().slice(0, 10), body: l.body }),
      );
    }
  } catch {}
  if (!found) {
    notFound();
  }

  return (
    <main className="screen">
      <div className="center doc post">
        <p className="prompt">{project.name}</p>
        {project.date && <p className="post-date">{project.date}</p>}
        {project.summary && <p className="proj-summary">{project.summary}</p>}
        {media.map((m) => (
          <img key={m.id} src={`/api/media/${m.id}`} alt={m.name} className="post-media" />
        ))}
        <div className="md">{md(project.body)}</div>
        {project.link && (
          <a className="button" href={project.link} target="_blank" rel="noopener noreferrer">
            visit
          </a>
        )}
        {logs.length > 0 && (
          <section className="devlog">
            <p className="prompt">devlog</p>
            {logs.map((l) => (
              <article key={l.id}>
                <p className="post-date">{l.date}</p>
                <div className="md">{md(l.body)}</div>
              </article>
            ))}
          </section>
        )}
        <WipeLink href="/projects" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
