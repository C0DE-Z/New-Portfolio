"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { WipeReveal, WipeLink, useWipeNav } from "@/app/components/wipe";

type PlanResult = {
  title: string;
  summary: string;
  status: string;
  keywords: string[];
  body: string;
  todos: { text: string; done: boolean }[];
};

export default function CodePage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<{ title: string; body: string } | null>(null);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [go, wipe] = useWipeNav();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const slowDownMessages = ["slow down", "take it easy", "calma", "wait"];
  const deniedMessages = ["if you're lost it's okay", "try help", "I don't think so", "it's okay to be wrong", "don't worry",
     "my back is killing me", "don't lose hope", "try another code", "listen to black midi there pretty cool", "have you ever thought about whats next? nah me neither", 
     "stop smoking, we love you", "why", "do you think about the current economical state of the world? no me neither.", "i cant sleep, can you?", "try trip" ];

     
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = value.trim();
    if (!code || busy) return;
    if (code.toLowerCase() === "trip") {
      go("/trip");
      return;
    }
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
        if (data.type === "plan") {
          setPlan(data as PlanResult);
          setDoc(null);
          setValue("");
          setStatus("");
          setBusy(false);
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
        {plan && (
          <section className="doc plan-result">
            <p className="prompt">{plan.title}</p>
            <p className="plan-status">{plan.status}</p>
            {plan.summary && <p className="proj-summary">{plan.summary}</p>}
            {plan.keywords.length > 0 && (
              <div className="plan-keywords">
                {plan.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
              </div>
            )}
            {plan.body && (
              <div className="md">
                <p className="prompt">storyboard / notes</p>
                <ReactMarkdown>{plan.body}</ReactMarkdown>
              </div>
            )}
            {plan.todos.length > 0 && (
              <section className="plan-todos">
                <p className="prompt">todos · {plan.todos.filter((todo) => todo.done).length}/{plan.todos.length} complete</p>
                <ul>
                  {plan.todos.map((todo, index) => (
                    <li key={`${index}-${todo.text}`} className={todo.done ? "done" : ""}>
                      <span aria-hidden="true">{todo.done ? "[x]" : "[ ]"}</span>
                      <span>{todo.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>
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
              setPlan(null);
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
