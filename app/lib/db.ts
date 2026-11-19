import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool; ready?: Promise<unknown>; readyV?: number };

export const pool = (globalForDb.pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 }));

const SCHEMA_V = 6;

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
      "CREATE TABLE IF NOT EXISTS media (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), post_id UUID NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, size INT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    await pool.query("CREATE INDEX IF NOT EXISTS media_post_id_idx ON media (post_id)");
    await pool.query(
      "CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', link TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    await pool.query(
      "CREATE TABLE IF NOT EXISTS devlogs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), project_id UUID NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"
    );
    await pool.query("CREATE INDEX IF NOT EXISTS devlogs_project_id_idx ON devlogs (project_id)");
    await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
    await pool.query("ALTER TABLE devlogs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ");
    await pool.query(
      "CREATE TABLE IF NOT EXISTS plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug TEXT UNIQUE, project_id UUID, salt TEXT, hash TEXT, name TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'idea', keywords JSONB NOT NULL DEFAULT '[]'::jsonb, storyboard TEXT NOT NULL DEFAULT '', todos JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ)"
    );
    await pool.query("ALTER TABLE plans ADD COLUMN IF NOT EXISTS slug TEXT");
    await pool.query("ALTER TABLE plans ALTER COLUMN slug DROP NOT NULL");
    await pool.query("ALTER TABLE plans ADD COLUMN IF NOT EXISTS project_id UUID");
    await pool.query("ALTER TABLE plans ADD COLUMN IF NOT EXISTS salt TEXT");
    await pool.query("ALTER TABLE plans ADD COLUMN IF NOT EXISTS hash TEXT");
    await pool.query(
      "WITH candidates AS (SELECT plans.id AS plan_id, projects.id AS project_id, COUNT(*) OVER (PARTITION BY projects.id) AS matches FROM plans JOIN projects ON lower(plans.name) = lower(projects.name) WHERE plans.project_id IS NULL) UPDATE plans SET project_id = candidates.project_id FROM candidates WHERE plans.id = candidates.plan_id AND candidates.matches = 1 AND NOT EXISTS (SELECT 1 FROM plans linked WHERE linked.project_id = candidates.project_id)"
    );
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS plans_project_id_key ON plans (project_id) WHERE project_id IS NOT NULL");
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
  })().catch((error) => {
    globalForDb.ready = undefined;
    globalForDb.readyV = undefined;
    throw error;
  }));
}

export type Project = { id: string; slug: string; name: string; summary: string; body: string; link: string | null; created_at: Date };
export type Devlog = { id: string; project_id: string; body: string; created_at: Date };
export type PlanTodo = { text: string; done: boolean };
export type Plan = {
  id: string;
  project_id: string | null;
  name: string;
  summary: string;
  status: string;
  keywords: string[];
  storyboard: string;
  todos: PlanTodo[];
  created_at: Date;
};

export type Post = { id: string; title: string; body: string; created_at: Date };
export type Media = { id: string; post_id: string; name: string; mime: string; size: number };
