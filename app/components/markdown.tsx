import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  img({ src, alt, title }) {
    if (typeof src !== "string" || !src) return alt ? <span>{alt}</span> : null;
    let localUrl: URL;
    try {
      localUrl = new URL(src, "https://c0dez.vercel.app");
    } catch {
      return alt ? <span>{alt}</span> : null;
    }
    if (localUrl.origin !== "https://c0dez.vercel.app" || !localUrl.pathname.startsWith("/")) {
      return alt ? <span>{alt}</span> : null;
    }

    return (
      <Image
        src={`${localUrl.pathname}${localUrl.search}${localUrl.hash}`}
        alt={alt ?? ""}
        title={title}
        width={1200}
        height={800}
        sizes="(max-width: 700px) 90vw, 700px"
        style={{ width: "auto", height: "auto" }}
      />
    );
  },
};

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
