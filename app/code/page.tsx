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

  const slowDownMessages = ["slow down", "take it easy", "calma", "wait"];
  const deniedMessages = ["if you're lost it's okay", "try help", "I don't think so", "it's okay to be wrong", "don't worry",
     "my back is killing me", "don't lose hope", "try another code", "listen to black midi there pretty cool", "have you ever thought about whats next? nah me neither", 
     "Stop smoking, we love you", "why", "do you think about the current economical state of the world? no me neither.", "i cant sleep, can you?" ];

     
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || busy) return;
    if (code.toLowerCase() === "login") {
      go("/login");
      return;
    }
    if (/^(hey+|hello+|hi+|hiya|howdy|yo+|sup|greetings|good (morning|afternoon|evening)|hola|heya|hallo)[\s!.,?]*$/i.test(code)) {
      setStatus("hey, type a code if you have one.. its okay if you dont");
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
        if (data.type === "page") {
          go(data.path);
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
        const messages = res.status === 429 ? slowDownMessages : deniedMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setStatus(randomMessage);
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
      <div className="center rounded">
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

