import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool; ready?: Promise<unknown>; readyV?: number };

export const pool = (globalForDb.pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }));

const SCHEMA_V = 3;

export function ready() {
  if (globalForDb.readyV !== SCHEMA_V) {
    globalForDb.readyV = SCHEMA_V;
    globalForDb.ready = undefined;
  }
  return (globalForDb.ready ??= (async () => {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS codes (id TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, type TEXT NOT NULL, url TEXT, title TEXT, body TEXT)"
    );
    await pool.query(
      "CREATE TABLE IF NOT EXISTS posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS salt TEXT");
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS hash TEXT");
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
    await pool.query(
      "CREATE TABLE IF NOT EXISTS media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), post_id UUID NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, size INT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), INDEX (post_id))"
    );
    await pool.query(
      "CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    await pool.query(
      "CREATE TABLE IF NOT EXISTS devlogs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), INDEX (project_id))"
    );
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
    await pool.query("ALTER TABLE devlogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
    await pool.query("CREATE TABLE IF NOT EXISTS seeded (k TEXT PRIMARY KEY)");
    const first = await pool.query("INSERT INTO seeded (k) VALUES ('projects-v1') ON CONFLICT DO NOTHING RETURNING k");
    if (first.rowCount) {
      const seed: [string, string, string][] = [
        ["absolute-lib", "absolute lib", "https://github.com/Team4308/absolutelib"],
        ["z", "z", "https://z.codezey.dev"],
        ["ecstasis", "ecstasis", "https://github.com/C0DE-Z/Ecstasis"],
        ["loud", "loud", "https://github.com/C0DE-Z/loud"],
      ];
      for (const [slug, name, link] of seed) {
        await pool.query("INSERT INTO projects (slug, name, link) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING", [slug, name, link]);
      }
    }
  })());
}

export type Project = { id: string; slug: string; name: string; summary: string; body: string; link: string | null; created_at: Date };
export type Devlog = { id: string; project_id: string; body: string; created_at: Date };

export type Post = { id: string; title: string; body: string; created_at: Date };
export type Media = { id: string; post_id: string; name: string; mime: string; size: number };

