import { useCallback, useEffect, useRef, useState } from "react";
import type { Audio } from "@/app/trip/lib/settings";

export function useAudio(enabled: boolean, onDenied: () => void) {
  const [msg, setMsg] = useState("");
  const [src, setSrc] = useState<"mic" | "file">("mic");
  const ctxRef = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const elRef = useRef<HTMLAudioElement | null>(null);
  const level = useRef<Audio>({ bass: 0, mid: 0, high: 0 });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    elRef.current?.pause();
    elRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyser.current = null;
    level.current = { bass: 0, mid: 0, high: 0 };
  }, []);

  const setup = () => {
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    an.smoothingTimeConstant = 0.75;
    ctxRef.current = ctx;
    analyser.current = an;
    return { ctx, an };
  };

  const startMic = useCallback(async () => {
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const { ctx, an } = setup();
      ctx.createMediaStreamSource(stream).connect(an);
      setMsg("listening to mic");
    } catch {
      setMsg("mic access denied");
      onDenied();
    }
  }, [stop, onDenied]);

  const startFile = useCallback(
    async (file: File) => {
      stop();
      const el = new Audio(URL.createObjectURL(file));
      el.loop = true;
      elRef.current = el;
      const { ctx, an } = setup();
      ctx.createMediaElementSource(el).connect(an);
      an.connect(ctx.destination);
      try {
        await el.play();
        setMsg(`playing ${file.name}`);
      } catch {
        setMsg("couldn't play that file");
      }
    },
    [stop]
  );

  useEffect(() => {
    if (!enabled) {
      stop();
      setMsg("");
    } else if (src === "mic") {
      startMic();
    }
  }, [enabled, src, startMic, stop]);

  useEffect(() => stop, [stop]);

  return { level, analyser, msg, src, setSrc, startFile };
}
