import { notFound } from "next/navigation";
import Image from "next/image";
import Markdown from "@/app/components/markdown";
import { WipeLink } from "@/app/components/wipe";
import { pool, ready, type Devlog, type Media, type Project } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { title: "Project | Code-Z" };
  await ready();
  const project = (await pool.query("SELECT name, summary FROM projects WHERE slug = $1", [slug])).rows[0] as
    | Pick<Project, "name" | "summary">
    | undefined;
  if (!project) return { title: "Project | Code-Z" };
  return {
    title: `${project.name} | Code-Z`,
    description: project.summary || `Project details and development notes for ${project.name}.`,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title: `${project.name} | Code-Z`, description: project.summary || undefined },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) notFound();

  await ready();
  const row = (await pool.query("SELECT * FROM projects WHERE slug = $1", [slug])).rows[0] as Project | undefined;
  if (!row) notFound();
  const project: Pick<Project, "name" | "summary" | "body" | "link"> & { date: string } = {
    ...row,
    date: row.created_at.toISOString().slice(0, 10),
  };
  const media = (await pool.query("SELECT id, name, mime FROM media WHERE post_id = $1 ORDER BY created_at", [row.id])).rows as Media[];
  const logs = ((await pool.query("SELECT id, body, created_at FROM devlogs WHERE project_id = $1 ORDER BY created_at DESC", [row.id])).rows as Devlog[]).map(
    (l) => ({ id: l.id, date: l.created_at.toISOString().slice(0, 10), body: l.body }),
  );

  return (
    <main className="screen">
      <div className="center doc post">
        <h1 className="prompt">{project.name}</h1>
        <p className="post-date">{project.date}</p>
        {project.summary && <p className="proj-summary">{project.summary}</p>}
        {media.map((m) => (
          <Image
            key={m.id}
            src={`/api/media/${m.id}`}
            alt={m.name}
            width={1200}
            height={800}
            sizes="(max-width: 700px) 90vw, 700px"
            className="post-media"
            style={{ width: "auto", height: "auto" }}
          />
        ))}
        <div className="md"><Markdown>{project.body}</Markdown></div>
        {project.link && (
          <a className="button" href={project.link} target="_blank" rel="noopener noreferrer">
            visit
          </a>
        )}
        {logs.length > 0 && (
          <section className="devlog">
            <h2 className="prompt">devlog</h2>
            {logs.map((l) => (
              <article key={l.id}>
                <p className="post-date">{l.date}</p>
                <div className="md"><Markdown>{l.body}</Markdown></div>
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
