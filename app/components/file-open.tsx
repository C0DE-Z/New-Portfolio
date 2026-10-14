"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function FileOpen({ href, name }: { href: string; name: string }) {
  const router = useRouter();
  const busy = useRef(false);

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (busy.current || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    busy.current = true;
    window.dispatchEvent(new Event("warp-in"));
    setTimeout(() => {
      router.push(href);
      busy.current = false;
    }, 850);
  };

  return (
    <a href={href} onClick={open}>
      {name}
    </a>
  );
}
