"use client";
import { useEffect, useRef, useState } from "react";
import { WipeReveal, WipeLink, useWipeNav } from "@/app/components/wipe";

export default function LoginPage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const [go, wipe] = useWipeNav();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || busy) return;
    setBusy(true);
    setStatus("...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });
      if (res.ok) {
        go("/dashboard");
        return;
      }
      setStatus(res.status === 429 ? "slow down" : "denied");
    } catch {
      setStatus("error");
    }
    setValue("");
    setBusy(false);
  };

  return (
    <main className="screen" onClick={() => ref.current?.focus()}>
      <WipeReveal />
      {wipe}
      <div className="center">
        <p className="prompt">login</p>
        <form onSubmit={submit} className="entry">
          <span className="entry-text">{"*".repeat(value.length)}</span>
          <span className="entry-cursor">_</span>
          <input
            ref={ref}
            type="password"
            className="entry-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setStatus("");
            }}
            autoComplete="off"
            spellCheck={false}
            aria-label="password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </form>
        <p className="entry-status">{status}&nbsp;</p>
        <WipeLink href="/code" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
