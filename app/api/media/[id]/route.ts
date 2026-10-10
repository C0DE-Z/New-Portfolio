import { NextRequest } from "next/server";
import { pool, ready } from "../../../db";

export const runtime = "nodejs";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });
  await ready();
  const { rows } = await pool.query("SELECT mime, data FROM media WHERE id = $1", [id]);
  if (!rows[0]) return new Response("Not found", { status: 404 });
  const data = rows[0].data as Buffer;
  const headers: Record<string, string> = {
    "Content-Type": rows[0].mime,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (m && (m[1] || m[2])) {
    let start = m[1] ? Number(m[1]) : data.length - Number(m[2]);
    let end = m[1] && m[2] ? Number(m[2]) : data.length - 1;
    start = Math.max(0, start);
    end = Math.min(end, data.length - 1);
    if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.length}` } });
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${data.length}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(data.length) } });
}
