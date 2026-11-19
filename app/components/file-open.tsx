"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSiteUI } from "@/app/components/site-ui";

export default function FileOpen({ href, name }: { href: string; name: string }) {
  const router = useRouter();
  const { developerMode, transition, reducedMotion, withDeveloperFlag, runExperimentalTransition } = useSiteUI();
  const busy = useRef(false);
  const destination = withDeveloperFlag(href);

  useEffect(() => {
    router.prefetch(destination);
  }, [router, destination]);

  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.currentTarget.target === "_blank"
    ) return;
    e.preventDefault();
    if (reducedMotion) {
      router.push(destination);
      return;
    }
    if (developerMode && transition.mode !== "wipe") {
      runExperimentalTransition(() => router.push(destination));
      return;
    }
    busy.current = true;
    window.dispatchEvent(new Event("warp-in"));
    setTimeout(() => {
      router.push(destination);
      busy.current = false;
    }, 850);
  };

  return (
    <a href={destination} onClick={open}>
      {name}
    </a>
  );
}
