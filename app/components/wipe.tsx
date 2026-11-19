"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSiteUI } from "@/app/components/site-ui";

const GLYPHS = "01/\\|:;.-=+#";
const CELL_W = 9;
const CELL_H = 16;
const DURATION = 550;

function runWipe(canvas: HTMLCanvasElement, mode: "cover" | "reveal", done?: () => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return done?.();
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  const cols = Math.ceil(w / CELL_W);
  const rows = Math.ceil(h / CELL_H);
  const start = performance.now();

  const step = (now: number) => {
    const p = Math.min((now - start) / DURATION, 1);
    ctx.clearRect(0, 0, w, h);
    ctx.font = `${CELL_H - 2}px NerdMono, Consolas, monospace`;
    ctx.textBaseline = "top";
    const edge = p * (cols + 12);
    for (let x = 0; x < cols; x++) {
      const dist = edge - x;
      const covered = mode === "cover" ? dist > 0 : dist < 0;
      const onEdge = Math.abs(dist) <= 12;
      if (!covered && !onEdge) continue;
      for (let y = 0; y < rows; y++) {
        if (onEdge && !covered && Math.random() > 0.5) continue;
        ctx.fillStyle = onEdge ? "#2a2a2a" : "#111111";
        ctx.fillRect(x * CELL_W, y * CELL_H, CELL_W, CELL_H);
        ctx.fillStyle = onEdge ? "#777777" : "#222222";
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], x * CELL_W, y * CELL_H);
      }
    }
    canvas.style.background = "transparent";
    if (p < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}

export function WipeReveal() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { ready, developerMode, transition, reducedMotion } = useSiteUI();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!ready) return;
    if (reducedMotion || (developerMode && transition.mode !== "wipe")) {
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = "block";
    document.fonts.ready.then(() => runWipe(canvas, "reveal", () => {
      canvas.style.display = "none";
    }));
  }, [ready, developerMode, reducedMotion, transition.mode]);
  return <canvas ref={ref} className="wipe" style={{ display: "none", background: "#111111" }} aria-hidden="true" />;
}

export function WipeLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const { withDeveloperFlag } = useSiteUI();
  const [go, canvas] = useWipeNav();
  const destination = withDeveloperFlag(href);

  useEffect(() => {
    router.prefetch(destination);
  }, [router, destination]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.currentTarget.target === "_blank" ||
      e.currentTarget.hasAttribute("download")
    ) return;
    e.preventDefault();
    go(destination);
  };

  return (
    <>
      <a href={destination} className={className} onClick={onClick}>
        {children}
      </a>
      {canvas}
    </>
  );
}

export function useWipeNav() {
  const router = useRouter();
  const { developerMode, transition, reducedMotion, withDeveloperFlag, runExperimentalTransition } = useSiteUI();
  const ref = useRef<HTMLCanvasElement>(null);
  const busy = useRef(false);
  const go = (href: string) => {
    const destination = withDeveloperFlag(href);
    const navigate = () => router.push(destination);
    if (reducedMotion) return navigate();
    if (developerMode && transition.mode !== "wipe") {
      runExperimentalTransition(navigate);
      return;
    }
    const canvas = ref.current;
    if (!canvas || busy.current) return navigate();
    busy.current = true;
    canvas.style.display = "block";
    runWipe(canvas, "cover", () => {
      navigate();
      busy.current = false;
    });
  };
  const canvas = <canvas ref={ref} className="wipe" style={{ display: "none" }} aria-hidden="true" />;
  return [go, canvas] as const;
}
