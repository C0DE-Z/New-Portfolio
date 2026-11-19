"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type TransitionMode = "wipe" | "ascii" | "terminal" | "scanline" | "scramble" | "minimal";
type TransitionDirection = "left" | "right" | "down";
type DisplaySettings = {
  dyslexiaFont: boolean;
  largerText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  strongFocus: boolean;
};

const DISPLAY_KEY = "code-z:display-settings";
const TRANSITION_KEY = "code-z:transition-settings";
const DEFAULT_DISPLAY: DisplaySettings = {
  dyslexiaFont: false,
  largerText: false,
  highContrast: false,
  reducedMotion: false,
  strongFocus: false,
};

type TransitionSettings = {
  mode: TransitionMode;
  duration: number;
  intensity: number;
  direction: TransitionDirection;
};

const DEFAULT_TRANSITION: TransitionSettings = {
  mode: "wipe",
  duration: 520,
  intensity: 2,
  direction: "left",
};

type Overlay = TransitionSettings & { phase: "cover" | "reveal" };

type SiteUIContextValue = {
  ready: boolean;
  developerMode: boolean;
  transition: TransitionSettings;
  display: DisplaySettings;
  reducedMotion: boolean;
  setTransition: (value: TransitionSettings) => void;
  setDisplay: (value: DisplaySettings) => void;
  withDeveloperFlag: (href: string) => string;
  runExperimentalTransition: (navigate?: () => void) => void;
};

const SiteUIContext = createContext<SiteUIContextValue | null>(null);

export function useSiteUI() {
  const context = useContext(SiteUIContext);
  if (!context) throw new Error("useSiteUI must be used within SiteUI");
  return context;
}

function isTransitionMode(value: unknown): value is TransitionMode {
  return ["wipe", "ascii", "terminal", "scanline", "scramble", "minimal"].includes(String(value));
}

function readDisplaySettings(): DisplaySettings {
  try {
    const value = JSON.parse(localStorage.getItem(DISPLAY_KEY) ?? "null");
    if (!value || typeof value !== "object") return DEFAULT_DISPLAY;
    return {
      dyslexiaFont: value.dyslexiaFont === true,
      largerText: value.largerText === true,
      highContrast: value.highContrast === true,
      reducedMotion: value.reducedMotion === true,
      strongFocus: value.strongFocus === true,
    };
  } catch {
    return DEFAULT_DISPLAY;
  }
}

function readTransitionSettings(): TransitionSettings {
  try {
    const value = JSON.parse(localStorage.getItem(TRANSITION_KEY) ?? "null");
    if (!value || typeof value !== "object") return DEFAULT_TRANSITION;
    return {
      mode: isTransitionMode(value.mode) ? value.mode : DEFAULT_TRANSITION.mode,
      duration: Number.isFinite(value.duration) ? Math.min(1200, Math.max(250, value.duration)) : DEFAULT_TRANSITION.duration,
      intensity: Number.isFinite(value.intensity) ? Math.min(3, Math.max(1, value.intensity)) : DEFAULT_TRANSITION.intensity,
      direction: ["left", "right", "down"].includes(value.direction) ? value.direction : DEFAULT_TRANSITION.direction,
    };
  } catch {
    return DEFAULT_TRANSITION;
  }
}

export default function SiteUI({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [developerMode, setDeveloperMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [display, setDisplay] = useState(DEFAULT_DISPLAY);
  const [transition, setTransition] = useState(DEFAULT_TRANSITION);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const timers = useRef<number[]>([]);
  const pendingTransition = useRef<{ from: string; fallback: number } | null>(null);
  const reducedMotion = display.reducedMotion || systemReducedMotion;
  const isTripRoute = pathname.startsWith("/trip");

  useEffect(() => {
    setDeveloperMode(new URLSearchParams(window.location.search).has("dev"));
  }, [pathname]);

  useEffect(() => {
    setDeveloperMode(new URLSearchParams(window.location.search).has("dev"));
    setDisplay(readDisplaySettings());
    setTransition(readTransitionSettings());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    setReady(true);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dyslexia-friendly", display.dyslexiaFont);
    root.classList.toggle("larger-text", display.largerText);
    root.classList.toggle("high-contrast", display.highContrast);
    root.classList.toggle("reduce-motion", reducedMotion);
    root.classList.toggle("strong-focus", display.strongFocus);
    document.dispatchEvent(new Event("portfolio:preferences"));
    try {
      localStorage.setItem(DISPLAY_KEY, JSON.stringify(display));
    } catch {
      // Preferences still apply for this visit when browser storage is unavailable.
    }
  }, [display, reducedMotion]);

  useEffect(() => {
    try {
      localStorage.setItem(TRANSITION_KEY, JSON.stringify(transition));
    } catch {
      // Transition choices remain active until this page is reloaded.
    }
  }, [transition]);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const finishTransition = useCallback(() => {
    if (pendingTransition.current) {
      window.clearTimeout(pendingTransition.current.fallback);
      pendingTransition.current = null;
    }
    setOverlay((value) => (value ? { ...value, phase: "reveal" } : null));
    timers.current.push(window.setTimeout(() => setOverlay(null), transition.duration / 2));
  }, [transition.duration]);

  useEffect(() => {
    if (pendingTransition.current && pendingTransition.current.from !== pathname) finishTransition();
  }, [pathname, finishTransition]);

  const withDeveloperFlag = useCallback(
    (href: string) => {
      if (!developerMode) return href;
      const target = new URL(href, window.location.origin);
      if (target.origin !== window.location.origin) return href;
      target.searchParams.set("dev", "1");
      return `${target.pathname}${target.search}${target.hash}`;
    },
    [developerMode],
  );

  const runExperimentalTransition = useCallback(
    (navigate?: () => void) => {
      if (reducedMotion) {
        navigate?.();
        return;
      }

      const current = transition.mode === "wipe" ? { ...transition, mode: "ascii" as const } : transition;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
      setOverlay({ ...current, phase: "cover" });
      timers.current.push(
        window.setTimeout(() => {
          if (!navigate) return finishTransition();
          const pending = { from: pathname, fallback: 0 };
          pending.fallback = window.setTimeout(finishTransition, 2000);
          pendingTransition.current = pending;
          navigate();
        }, current.duration / 2),
      );
    },
    [finishTransition, pathname, reducedMotion, transition],
  );

  const contextValue = useMemo(
    () => ({
      ready,
      developerMode,
      transition,
      display,
      reducedMotion,
      setTransition,
      setDisplay,
      withDeveloperFlag,
      runExperimentalTransition,
    }),
    [ready, developerMode, transition, display, reducedMotion, withDeveloperFlag, runExperimentalTransition],
  );

  const disableDeveloperMode = () => {
    const target = new URL(window.location.href);
    target.searchParams.delete("dev");
    setDeveloperMode(false);
    router.replace(`${target.pathname}${target.search}${target.hash}`, { scroll: false });
  };

  return (
    <SiteUIContext.Provider value={contextValue}>
      <a className="skip-link" href="#main-content">
        skip to content
      </a>
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <aside className={`site-tools${isTripRoute ? " site-tools-trip" : ""}`}>
          <button
            type="button"
            className="site-tools-toggle"
            aria-expanded={settingsOpen}
            aria-controls="site-tools-panel"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            {settingsOpen ? "close" : "prefs"}
          </button>
          {settingsOpen && (
            <section id="site-tools-panel" className="site-tools-panel" aria-labelledby="site-tools-title">
              <h2 id="site-tools-title">display / access</h2>
              <label>
                <input
                  type="checkbox"
                  checked={display.dyslexiaFont}
                  onChange={(event) => setDisplay({ ...display, dyslexiaFont: event.target.checked })}
                />
                dyslexia-friendly font
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={display.largerText}
                  onChange={(event) => setDisplay({ ...display, largerText: event.target.checked })}
                />
                larger text
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={display.highContrast}
                  onChange={(event) => setDisplay({ ...display, highContrast: event.target.checked })}
                />
                higher contrast
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={display.reducedMotion}
                  onChange={(event) => setDisplay({ ...display, reducedMotion: event.target.checked })}
                />
                reduce motion
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={display.strongFocus}
                  onChange={(event) => setDisplay({ ...display, strongFocus: event.target.checked })}
                />
                brighter keyboard focus
              </label>
              <p className="site-tools-note">Device motion preferences are also respected.</p>
              {developerMode && (
                <section className="transition-lab" aria-labelledby="transition-lab-title">
                  <h3 id="transition-lab-title">transition lab / dev</h3>
                  <label>
                    style
                    <select
                      value={transition.mode}
                      onChange={(event) =>
                        setTransition({ ...transition, mode: event.target.value as TransitionMode })
                      }
                    >
                      <option value="wipe">current / default wipe</option>
                      <option value="ascii">ASCII reveal</option>
                      <option value="terminal">terminal</option>
                      <option value="scanline">scanline</option>
                      <option value="scramble">character field</option>
                      <option value="minimal">minimal</option>
                    </select>
                  </label>
                  <label>
                    duration: {transition.duration} ms
                    <input
                      type="range"
                      min="250"
                      max="1200"
                      step="50"
                      value={transition.duration}
                      onChange={(event) =>
                        setTransition({ ...transition, duration: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    intensity: {transition.intensity}
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="1"
                      value={transition.intensity}
                      onChange={(event) =>
                        setTransition({ ...transition, intensity: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    direction
                    <select
                      value={transition.direction}
                      onChange={(event) =>
                        setTransition({ ...transition, direction: event.target.value as TransitionDirection })
                      }
                    >
                      <option value="left">left to right</option>
                      <option value="right">right to left</option>
                      <option value="down">top to bottom</option>
                    </select>
                  </label>
                  <div className="site-tools-actions">
                    <button type="button" onClick={() => runExperimentalTransition()}>
                      preview
                    </button>
                    <button type="button" onClick={disableDeveloperMode}>
                      exit dev
                    </button>
                  </div>
                </section>
              )}
              <a className="site-tools-privacy" href={developerMode ? "/privacy?dev=1" : "/privacy"}>
                privacy policy
              </a>
            </section>
          )}
      </aside>
      {overlay && (
        <div
          className="dev-transition"
          data-mode={overlay.mode}
          data-phase={overlay.phase}
          data-direction={overlay.direction}
          style={
            {
              animationDuration: `${overlay.duration / 2}ms`,
              "--transition-opacity": 0.28 + overlay.intensity * 0.22,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          {overlay.mode === "terminal" && (
            <span className="dev-transition-terminal">
              &gt; loading / route
              <br />
              &gt; [##########]
              <br />
              &gt; rendering...
            </span>
          )}
          {overlay.mode === "scramble" && (
            <span className="dev-transition-glyphs">{"01 / 0x7F / # + { } // 001"}</span>
          )}
        </div>
      )}
    </SiteUIContext.Provider>
  );
}
