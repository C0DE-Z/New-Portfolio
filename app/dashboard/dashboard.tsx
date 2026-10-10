"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WipeReveal, useWipeNav } from "../wipe";

type Item = { id: string; title: string; date: string; files: number };

export default function Dashboard({ posts }: { posts: Item[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [go, wipe] = useWipeNav();

  const post = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("uploading...");
    try {
      const res = await fetch("/api/posts", { method: "POST", body: new FormData(e.currentTarget) });
      if (res.ok) {
        formRef.current?.reset();
        setNames([]);
        setStatus("posted");
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

  const remove = async (id: string) => {
    if (!confirm("delete this post?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setStatus(res.ok ? "deleted" : "failed");
    router.refresh();
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
        <form ref={formRef} onSubmit={post} className="dash-form">
          <input name="title" placeholder="title" maxLength={200} required autoComplete="off" />
          <input name="code" placeholder="access code" maxLength={128} required autoComplete="off" />
          <textarea name="body" placeholder="text" rows={6} />
          <label className="dash-file">
            <span>{names.length ? names.join(", ") : "attach video / music / images"}</span>
            <input
              type="file"
              name="files"
              multiple
              accept="video/*,audio/*,image/*"
              onChange={(e) => setNames(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
          </label>
          <button type="submit" className="button" disabled={busy}>
            post
          </button>
        </form>
        <p className="entry-status">{status}&nbsp;</p>
        <ul className="dash-list">
          {posts.map((p) => (
            <li key={p.id}>
              <span>
                {p.date}  {p.title}
                {p.files ? `  [${p.files}]` : ""}
              </span>
              <button type="button" onClick={() => remove(p.id)}>
                delete
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="back dash-out" onClick={logout}>
          &lt; logout
        </button>
      </div>
    </main>
  );
}

