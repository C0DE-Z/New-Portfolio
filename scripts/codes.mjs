import { createHash, randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const id = (code) => createHash("sha256").update(code).digest("hex").slice(0, 8);
const [cmd, code, type, a, b] = process.argv.slice(2);

await pool.query(
  "CREATE TABLE IF NOT EXISTS codes (id TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, type TEXT NOT NULL, url TEXT, title TEXT, body TEXT)"
);

const upsert = async (code, p) => {
  const salt = randomBytes(16).toString("hex");
  await pool.query(
    "UPSERT INTO codes (id, salt, hash, type, url, title, body) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [id(code), salt, scryptSync(code, salt, 32).toString("hex"), p.type, p.url ?? null, p.title ?? null, p.body ?? null]
  );
  console.log(`saved ${id(code)} (${p.type})`);
};

if (cmd === "add" && code && type === "link" && a) {
  new URL(a);
  await upsert(code, { type: "link", url: a });
} else if (cmd === "add" && code && type === "text" && a && b) {
  const body = b.startsWith("@") ? readFileSync(b.slice(1), "utf8") : b;
  await upsert(code, { type: "text", title: a, body });
} else if (cmd === "remove" && code) {
  const r = await pool.query("DELETE FROM codes WHERE id = $1", [id(code)]);
  console.log(r.rowCount ? "removed" : "not found");
} else if (cmd === "list") {
  const { rows } = await pool.query("SELECT id, type, url, title FROM codes ORDER BY id");
  rows.forEach((e) => console.log(`${e.id}  ${e.type}  ${e.url ?? e.title}`));
} else if (cmd === "import" && code) {
  const list = JSON.parse(readFileSync(code, "utf8"));
  for (const e of list) {
    await pool.query(
      "UPSERT INTO codes (id, salt, hash, type, url, title, body) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [e.id, e.salt, e.hash, e.type ?? "link", e.url ?? null, e.title ?? null, e.body ?? null]
    );
  }
  console.log(`imported ${list.length}`);
} else {
  console.log(
    [
      "node --env-file=.env.local scripts/codes.mjs add <code> link <url>",
      "node --env-file=.env.local scripts/codes.mjs add <code> text <title> <text | @file.txt>",
      "node --env-file=.env.local scripts/codes.mjs remove <code>",
      "node --env-file=.env.local scripts/codes.mjs list",
    ].join("\n")
  );
}
await pool.end();
