"use client";
import { useEffect, useRef, useState } from "react";
import { WipeReveal, WipeLink, useWipeNav } from "../wipe";

export default function CodePage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<{ title: string; body: string } | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [go, wipe] = useWipeNav();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || busy) return;
    if (code.toLowerCase() === "login") {
      go("/login");
      return;
    }
    if (/^(hey+|hello+|hi+|hiya|howdy|yo+|sup|greetings|good (morning|afternoon|evening)|hola|heya|hallo)[\s!.,?]*$/i.test(code)) {
      setStatus("hello");
      setValue("");
      return;
    }
    setBusy(true);
    setStatus("...");
    try {
      const res = await fetch("/api/stash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: code }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.type === "post") {
          go(`/blog/${data.id}`);
          return;
        }
        if (data.type === "link") {
          window.location.href = data.url;
          return;
        }
        setDoc({ title: data.title, body: data.body });
        setValue("");
        setStatus("");
      } else {
        setStatus(res.status === 429 ? "slow down" : "denied");
        setValue("");
      }
    } catch {
      setStatus("error");
    }
    setBusy(false);
  };

  return (
    <main className="screen" onClick={() => ref.current?.focus()}>
      <WipeReveal />
      {wipe}
      <div className="center">
        {doc && (
          <div className="doc">
            <p className="prompt">{doc.title}</p>
            <div className="doc-body">{doc.body}</div>
          </div>
        )}
        <form onSubmit={submit} className="entry">
          <span className="entry-text">{value}</span>
          <span className="entry-cursor">_</span>
          <input
            ref={ref}
            className="entry-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setStatus("");
              setDoc(null);
            }}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            aria-label="code"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </form>
        <p className="entry-status">{status}&nbsp;</p>
        <WipeLink href="/" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}


