import { WipeReveal, WipeLink } from "@/app/components/wipe";
import { pool, ready, type Project } from "@/app/lib/db";
import FileOpen from "@/app/components/file-open";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Code-Z | Projects",
  description: "Projects and experiments by Code-Z.",
  alternates: { canonical: "/projects" },
};

async function load() {
  await ready();
  return (await pool.query("SELECT slug, name, summary FROM projects ORDER BY created_at DESC")).rows as Pick<
    Project,
    "slug" | "name" | "summary"
  >[];
}

export default async function Projects() {
  const rows = await load();
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center list">
        <h1 className="prompt">things</h1>
        <ul>
          {rows.map((p) => (
            <li key={p.slug} className="file">
              <FileOpen href={`/projects/${p.slug}`} name={p.name} />
              {p.summary && <small>{p.summary}</small>}
            </li>
          ))}
        </ul>
        <a className="button" href="https://github.com/C0DE-Z" target="_blank" rel="noopener noreferrer">
          github
        </a>
        <WipeLink href="/" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
