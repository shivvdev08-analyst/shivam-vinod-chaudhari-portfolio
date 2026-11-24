-- Portfolio server schema — Neon Postgres (free tier).
-- Run via POST /api/admin/setup (owner session required) or psql.
-- Idempotent: safe to run more than once. No secrets in this file.
-- pgvector is available on Neon for future VERITAS embeddings; it is NOT
-- enabled here, so setup cannot fail on the extension.

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT ,
  category TEXT NOT NULL DEFAULT ,
  status TEXT NOT NULL DEFAULT ,
  team TEXT NOT NULL DEFAULT ,
  stack JSONB NOT NULL DEFAULT []::jsonb,
  github_url TEXT NOT NULL DEFAULT ,
  body JSONB NOT NULL DEFAULT {}::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT ,
  status TEXT NOT NULL DEFAULT draft,
  category TEXT NOT NULL DEFAULT ,
  tags JSONB NOT NULL DEFAULT []::jsonb,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT academic,
  place TEXT NOT NULL DEFAULT ,
  story TEXT NOT NULL DEFAULT ,
  tags JSONB NOT NULL DEFAULT []::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  media_url TEXT NOT NULL DEFAULT ,
  media_kind TEXT NOT NULL DEFAULT ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT ,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT new,
  is_spam BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  kind TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT ,
  referrer TEXT NOT NULL DEFAULT ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS analytics_events_kind_created_idx ON analytics_events (kind, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor TEXT NOT NULL DEFAULT owner,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  ip TEXT NOT NULL DEFAULT ,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_created_idx ON login_attempts (created_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
