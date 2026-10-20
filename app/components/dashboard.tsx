"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WipeReveal, useWipeNav } from "@/app/components/wipe";

type Log = { id: string; body: string; created: string; updated: string | null };
type Post = { id: string; title: string; body: string; created: string; updated: string | null; files: number };
type PlanTodo = { text: string; done: boolean };
type Plan = {
  id: string;
  projectId: string | null;
  name: string;
  summary: string;
  status: string;
  keywords: string[];
  storyboard: string;
  todos: PlanTodo[];
  created: string;
  updated: string | null;
};
type Proj = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  body: string;
  link: string;
  created: string;
  updated: string | null;
  files: number;
  logs: Log[];
};

type Tab = "projects" | "posts" | "new project" | "new post";
const TABS: Tab[] = ["projects", "posts", "new project", "new post"];
const formatTodos = (todos: PlanTodo[]) => todos.map((todo) => `- [${todo.done ? "x" : " "}] ${todo.text}`).join("\n");

const fmt = (s: string) => new Date(s).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function Stamp({ created, updated }: { created: string; updated: string | null }) {
  return (
    <span className="dash-meta" suppressHydrationWarning>
      created {fmt(created)}
      {updated ? ` · edited ${fmt(updated)}` : ""}
    </span>
  );
}

export default function Dashboard({ posts, projects, plans }: { posts: Post[]; projects: Proj[]; plans: Plan[] }) {
  const router = useRouter();
  const [go, wipe] = useWipeNav();
  const [tab, setTab] = useState<Tab>("projects");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Record<string, string>>({});
  const [planFormProject, setPlanFormProject] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const projRef = useRef<HTMLFormElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [pnames, setPnames] = useState<string[]>([]);

  const call = async (url: string, method: string, json?: unknown, ok = "saved") => {
    const res = await fetch(url, {
      method,
      headers: json ? { "Content-Type": "application/json" } : undefined,
      body: json ? JSON.stringify(json) : undefined,
    });
    if (res.ok) {
      setStatus(ok);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error ?? "failed");
    }
    return res.ok;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>, url: string, form: React.RefObject<HTMLFormElement>, clear: () => void, ok: string, next: Tab) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("uploading...");
    try {
      const res = await fetch(url, { method: "POST", body: new FormData(e.currentTarget) });
      if (res.ok) {
        form.current?.reset();
        clear();
        setStatus(ok);
        setTab(next);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(data.error ?? "failed");
      }
    } catch {
      setStatus("failed");
    }
    setBusy(false);
  };

  const d = (k: string, fallback: string) => draft[k] ?? fallback;
  const setD = (k: string, v: string) => setDraft((o) => ({ ...o, [k]: v }));
  const stop = () => {
    setEditing(null);
    setDraft({});
    setPlanFormProject(null);
  };

  const saveProject = async (p: Proj) => {
    const ok = await call(
      `/api/projects/${p.id}`,
      "PATCH",
      { name: d("name", p.name), summary: d("summary", p.summary), link: d("link", p.link), body: d("body", p.body) },
      "project saved"
    );
    if (ok) stop();
  };

  const savePost = async (p: Post) => {
    const ok = await call(`/api/posts/${p.id}`, "PATCH", { title: d("title", p.title), body: d("body", p.body) }, "post saved");
    if (ok) stop();
  };

  const savePlan = async (p: Plan) => {
    const ok = await call(
      `/api/plans/${p.id}`,
      "PATCH",
      {
        summary: d("planSummary", p.summary),
        status: d("planStatus", p.status),
        keywords: d("planKeywords", p.keywords.join(", ")),
        storyboard: d("storyboard", p.storyboard),
        todos: d("todos", formatTodos(p.todos)),
        codeword: d("planCodeword", ""),
      },
      "plan saved",
    );
    if (ok) stop();
  };

  const createPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    setBusy(true);
    setStatus("saving plan...");
    try {
      const res = await fetch("/api/plans", { method: "POST", body: new FormData(form) });
      if (res.ok) {
        form.reset();
        setPlanFormProject(null);
        setStatus("plan saved");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus(data.error ?? "failed");
      }
    } catch {
      setStatus("failed");
    }
    setBusy(false);
  };

  const saveLog = async (p: Proj, l: Log) => {
    const ok = await call(`/api/projects/${p.id}/devlog/${l.id}`, "PATCH", { body: d("log", l.body) }, "devlog saved");
    if (ok) stop();
  };

  const addLog = async (id: string) => {
    const body = logs[id]?.trim();
    if (!body) return;
    if (await call(`/api/projects/${id}/devlog`, "POST", { body }, "devlog added")) setLogs({ ...logs, [id]: "" });
  };

  const del = async (url: string, what: string) => {
    if (confirm(`delete this ${what}?`)) await call(url, "DELETE", undefined, "deleted");
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    go("/");
  };

  return (
    <main className="screen">
      <WipeReveal />
      {wipe}
      <div className="center dash">
        <p className="prompt">dashboard</p>
        <nav className="dash-tabs">
          {TABS.map((t) => (
            <button key={t} type="button" className={t === tab ? "on" : ""} onClick={() => { setTab(t); stop(); }}>
              {t}
              {t === "projects" ? ` (${projects.length})` : t === "posts" ? ` (${posts.length})` : ""}
            </button>
          ))}
        </nav>
        <p className="entry-status">{status}&nbsp;</p>

        {tab === "projects" && (
          <div className="dash-list">
            {projects.length === 0 && <span className="dash-meta">no projects yet</span>}
            {projects.map((p) => {
              const plan = plans.find((candidate) => candidate.projectId === p.id);
              return (
              <article key={p.id} className="dash-card">
                {editing === p.id ? (
                  <>
                    <input value={d("name", p.name)} maxLength={100} onChange={(e) => setD("name", e.target.value)} placeholder="name" />
                    <input value={d("summary", p.summary)} maxLength={300} onChange={(e) => setD("summary", e.target.value)} placeholder="summary" />
                    <input value={d("link", p.link)} maxLength={500} onChange={(e) => setD("link", e.target.value)} placeholder="link" />
                    <textarea rows={8} value={d("body", p.body)} onChange={(e) => setD("body", e.target.value)} placeholder="write-up (markdown)" />
                    <div className="dash-actions">
                      <button type="button" onClick={() => saveProject(p)}>save</button>
                      <button type="button" onClick={stop}>cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <header>
                      <span>{p.name}</span>
                      <div className="dash-actions">
                        <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">view</a>
                        <button type="button" onClick={() => { stop(); setEditing(p.id); }}>edit</button>
                        <button type="button" onClick={() => del(`/api/projects/${p.id}`, "project")}>delete</button>
                      </div>
                    </header>
                    {p.summary && <span>{p.summary}</span>}
                    <Stamp created={p.created} updated={p.updated} />
                  </>
                )}
                <span className="dash-meta">devlog ({p.logs.length})</span>
                {p.logs.map((l) => (
                  <div key={l.id} className="dash-log">
                    {editing === l.id ? (
                      <>
                        <textarea rows={4} value={d("log", l.body)} onChange={(e) => setD("log", e.target.value)} />
                        <div className="dash-actions">
                          <button type="button" onClick={() => saveLog(p, l)}>save</button>
                          <button type="button" onClick={stop}>cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>{l.body}</span>
                        <Stamp created={l.created} updated={l.updated} />
                        <div className="dash-actions">
                          <button type="button" onClick={() => { stop(); setEditing(l.id); }}>edit</button>
                          <button type="button" onClick={() => del(`/api/projects/${p.id}/devlog/${l.id}`, "devlog entry")}>delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <textarea
                  rows={2}
                  placeholder="new devlog entry (markdown)"
                  value={logs[p.id] ?? ""}
                  onChange={(e) => setLogs({ ...logs, [p.id]: e.target.value })}
                />
                <div className="dash-actions">
                  <button type="button" onClick={() => addLog(p.id)}>add devlog</button>
                </div>
                <section className="dash-plan">
                  <header>
                    <span className="dash-meta">project plan</span>
                    {plan && editing !== plan.id && (
                      <div className="dash-actions">
                        <button type="button" onClick={() => { stop(); setEditing(plan.id); }}>edit plan</button>
                        <button type="button" onClick={() => del(`/api/plans/${plan.id}`, "plan")}>delete plan</button>
                      </div>
                    )}
                  </header>
                  {plan ? editing === plan.id ? (
                    <>
                      <input value={d("planSummary", plan.summary)} maxLength={300} onChange={(e) => setD("planSummary", e.target.value)} placeholder="one-line summary" />
                      <select value={d("planStatus", plan.status)} onChange={(e) => setD("planStatus", e.target.value)}>
                        <option value="idea">idea</option>
                        <option value="planned">planned</option>
                        <option value="in progress">in progress</option>
                        <option value="paused">paused</option>
                      </select>
                      <input value={d("planKeywords", plan.keywords.join(", "))} onChange={(e) => setD("planKeywords", e.target.value)} placeholder="keywords, comma separated" />
                      <textarea rows={7} value={d("storyboard", plan.storyboard)} onChange={(e) => setD("storyboard", e.target.value)} placeholder="storyboard / notes (markdown)" />
                      <textarea rows={6} value={d("todos", formatTodos(plan.todos))} onChange={(e) => setD("todos", e.target.value)} placeholder={"todos, one per line\n- [ ] not started\n- [x] completed"} />
                      <input type="password" autoComplete="new-password" value={d("planCodeword", "")} onChange={(e) => setD("planCodeword", e.target.value)} placeholder="new codeword (blank keeps current)" />
                      <div className="dash-actions">
                        <button type="button" onClick={() => savePlan(plan)}>save plan</button>
                        <button type="button" onClick={stop}>cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{plan.status}{plan.summary ? ` · ${plan.summary}` : ""}</span>
                      {plan.keywords.length > 0 && <span className="dash-meta">{plan.keywords.join(" · ")}</span>}
                      <span className="dash-meta">{plan.todos.filter((todo) => todo.done).length}/{plan.todos.length} todos complete · revealed through words</span>
                      <Stamp created={plan.created} updated={plan.updated} />
                    </>
                  ) : planFormProject === p.id ? (
                    <form onSubmit={createPlan} className="dash-form">
                      <input type="hidden" name="projectId" value={p.id} />
                      <input type="password" name="codeword" placeholder="project codeword" maxLength={128} required autoComplete="new-password" />
                      <input name="summary" placeholder="one-line summary" maxLength={300} autoComplete="off" />
                      <select name="status" defaultValue="idea">
                        <option value="idea">idea</option>
                        <option value="planned">planned</option>
                        <option value="in progress">in progress</option>
                        <option value="paused">paused</option>
                      </select>
                      <input name="keywords" placeholder="keywords, comma separated" autoComplete="off" />
                      <textarea name="storyboard" placeholder="storyboard / notes (markdown)" rows={7} />
                      <textarea name="todos" placeholder={"todos, one per line\n- [ ] not started\n- [x] completed"} rows={6} />
                      <div className="dash-actions">
                        <button type="submit" className="button" disabled={busy}>save project plan</button>
                        <button type="button" onClick={() => setPlanFormProject(null)}>cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="dash-actions">
                      <span className="dash-meta">no private plan</span>
                      <button type="button" onClick={() => setPlanFormProject(p.id)}>add plan</button>
                    </div>
                  )}
                </section>
              </article>
              );
            })}
          </div>
        )}

        {tab === "posts" && (
          <div className="dash-list">
            {posts.length === 0 && <span className="dash-meta">no posts yet</span>}
            {posts.map((p) => (
              <article key={p.id} className="dash-card">
                {editing === p.id ? (
                  <>
                    <input value={d("title", p.title)} maxLength={200} onChange={(e) => setD("title", e.target.value)} placeholder="title" />
                    <textarea rows={8} value={d("body", p.body)} onChange={(e) => setD("body", e.target.value)} placeholder="text" />
                    <div className="dash-actions">
                      <button type="button" onClick={() => savePost(p)}>save</button>
                      <button type="button" onClick={stop}>cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <header>
                      <span>
                        {p.title}
                        {p.files ? `  [${p.files} file${p.files > 1 ? "s" : ""}]` : ""}
                      </span>
                      <div className="dash-actions">
                        <button type="button" onClick={() => { stop(); setEditing(p.id); }}>edit</button>
                        <button type="button" onClick={() => del(`/api/posts/${p.id}`, "post")}>delete</button>
                      </div>
                    </header>
                    <Stamp created={p.created} updated={p.updated} />
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        {tab === "new post" && (
          <form
            ref={formRef}
            onSubmit={(e) => submit(e, "/api/posts", formRef, () => setNames([]), "posted", "posts")}
            className="dash-form"
          >
            <input name="title" placeholder="title" maxLength={200} required autoComplete="off" />
            <input name="code" placeholder="access code" maxLength={128} required autoComplete="off" />
            <textarea name="body" placeholder="text" rows={6} />
            <label className="dash-file">
              <span>{names.length ? names.join(", ") : "attach video / music / images"}</span>
              <input type="file" name="files" multiple accept="video/*,audio/*,image/*" onChange={(e) => setNames(Array.from(e.target.files ?? []).map((f) => f.name))} />
            </label>
            <button type="submit" className="button" disabled={busy}>post</button>
          </form>
        )}

        {tab === "new project" && (
          <form
            ref={projRef}
            onSubmit={(e) => submit(e, "/api/projects", projRef, () => setPnames([]), "project posted", "projects")}
            className="dash-form"
          >
            <input name="name" placeholder="name" maxLength={100} required autoComplete="off" />
            <input name="summary" placeholder="one-line summary" maxLength={300} autoComplete="off" />
            <input name="link" placeholder="link (https://...) optional" maxLength={500} autoComplete="off" />
            <textarea name="body" placeholder="write-up (markdown)" rows={6} />
            <label className="dash-file">
              <span>{pnames.length ? pnames.join(", ") : "attach image"}</span>
              <input type="file" name="files" multiple accept="image/*" onChange={(e) => setPnames(Array.from(e.target.files ?? []).map((f) => f.name))} />
            </label>
            <button type="submit" className="button" disabled={busy}>add project</button>
          </form>
        )}

        <button type="button" className="back dash-out" onClick={logout}>
          &lt; logout
        </button>
      </div>
    </main>
  );
}