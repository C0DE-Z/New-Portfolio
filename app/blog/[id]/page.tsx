import { notFound } from "next/navigation";
import Image from "next/image";
import { WipeReveal, WipeLink } from "@/app/components/wipe";
import { pool, ready, type Media, type Post } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: "Post | Code-Z", robots: { index: false, follow: false } };
  await ready();
  const post = (await pool.query("SELECT title, body FROM posts WHERE id = $1", [id])).rows[0] as
    | Pick<Post, "title" | "body">
    | undefined;
  return {
    title: post ? `${post.title} | Code-Z` : "Post | Code-Z",
    description: post?.body.slice(0, 160) || "A post from Code-Z.",
    alternates: { canonical: `/blog/${id}` },
    robots: { index: false, follow: false },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  await ready();
  const post = (await pool.query("SELECT id, title, body, created_at FROM posts WHERE id = $1", [id])).rows[0] as Post | undefined;
  if (!post) notFound();
  const media = (await pool.query("SELECT id, name, mime FROM media WHERE post_id = $1 ORDER BY created_at", [id])).rows as Media[];
  return (
    <main className="screen">
      <WipeReveal />
      <div className="center doc post">
        <h1 className="prompt">{post.title}</h1>
        <p className="post-date">{post.created_at.toISOString().slice(0, 10)}</p>
        {post.body && <div className="doc-body">{post.body}</div>}
        {media.map((m) => {
          const src = `/api/media/${m.id}`;
          if (m.mime.startsWith("video/")) return <video key={m.id} src={src} controls preload="metadata" className="post-media" />;
          if (m.mime.startsWith("audio/")) return <audio key={m.id} src={src} controls preload="metadata" className="post-audio" />;
          return (
            <Image
              key={m.id}
              src={src}
              alt={m.name}
              width={1200}
              height={800}
              sizes="(max-width: 700px) 90vw, 700px"
              className="post-media"
              style={{ width: "auto", height: "auto" }}
            />
          );
        })}
        <WipeLink href="/code" className="back">
          &lt; back
        </WipeLink>
      </div>
    </main>
  );
}
