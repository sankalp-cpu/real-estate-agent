-- M3M Legal AI Platform — schema
-- SQLite with FTS5. The FTS tables are what make "grounded" a demonstrable
-- property: every citation the system emits resolves to a row indexed here.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- People and access
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('head_of_legal','counsel','paralegal','panel_counsel','admin')),
  designation   TEXT NOT NULL,
  office        TEXT NOT NULL,
  initials      TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Matters
-- ---------------------------------------------------------------------------

CREATE TABLE matters (
  id            TEXT PRIMARY KEY,
  reference     TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  matter_type   TEXT NOT NULL CHECK (matter_type IN ('litigation','contract','advisory')),
  forum         TEXT,
  counterparty  TEXT,
  project       TEXT,
  status        TEXT NOT NULL CHECK (status IN ('active','on_hold','closed')),
  exposure_inr  INTEGER,
  next_date     TEXT,
  summary       TEXT,
  owner_id      TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
);

-- Matter-scoped access. Panel counsel see only the matters they are on.
CREATE TABLE matter_access (
  matter_id     TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level  TEXT NOT NULL CHECK (access_level IN ('owner','contributor','viewer')),
  PRIMARY KEY (matter_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Documents and the OCR pipeline
-- ---------------------------------------------------------------------------

CREATE TABLE documents (
  id            TEXT PRIMARY KEY,
  matter_id     TEXT REFERENCES matters(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  doc_type      TEXT NOT NULL CHECK (doc_type IN ('pleading','contract','judgment','notice','order','correspondence','policy')),
  source        TEXT NOT NULL CHECK (source IN ('upload','scan','erp','email')),
  -- Pipeline: received -> scanning -> digitizing -> indexing -> indexed
  ocr_status    TEXT NOT NULL CHECK (ocr_status IN ('received','scanning','digitizing','indexing','indexed','needs_review')),
  ocr_confidence REAL,
  page_count    INTEGER NOT NULL DEFAULT 1,
  filed_by      TEXT,
  doc_date      TEXT,
  uploaded_by   TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
);

CREATE TABLE doc_chunks (
  id            TEXT PRIMARY KEY,
  document_id   TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_no       INTEGER NOT NULL,
  para_no       TEXT NOT NULL,
  heading       TEXT,
  body          TEXT NOT NULL
);

CREATE VIRTUAL TABLE doc_chunks_fts USING fts5(
  body,
  heading,
  content = 'doc_chunks',
  content_rowid = 'rowid',
  tokenize = 'porter unicode61'
);

CREATE TRIGGER doc_chunks_ai AFTER INSERT ON doc_chunks BEGIN
  INSERT INTO doc_chunks_fts(rowid, body, heading) VALUES (new.rowid, new.body, new.heading);
END;
CREATE TRIGGER doc_chunks_ad AFTER DELETE ON doc_chunks BEGIN
  INSERT INTO doc_chunks_fts(doc_chunks_fts, rowid, body, heading) VALUES ('delete', old.rowid, old.body, old.heading);
END;

-- ---------------------------------------------------------------------------
-- Case law
-- ---------------------------------------------------------------------------

CREATE TABLE authorities (
  id              TEXT PRIMARY KEY,
  case_title      TEXT NOT NULL,
  citation        TEXT NOT NULL,
  court           TEXT NOT NULL,
  bench           TEXT,
  year            INTEGER NOT NULL,
  decided_on      TEXT,
  subject_tags    TEXT NOT NULL,           -- comma-separated
  holding_summary TEXT NOT NULL,
  -- The currency check. A general chat model cannot do this: its cutoff freezes the law silently.
  status          TEXT NOT NULL CHECK (status IN ('good_law','distinguished','overruled')),
  status_note     TEXT,
  superseded_by   TEXT REFERENCES authorities(id),
  source_url      TEXT NOT NULL,
  -- Stance layer: M3M's editorial view, kept separate from the neutral case
  -- record above and labelled as advocacy in the interface. See db/seed/stances.ts.
  favours         TEXT NOT NULL DEFAULT 'balanced' CHECK (favours IN ('m3m','opponent','balanced')),
  counter_point   TEXT
);

CREATE TABLE authority_paras (
  id            TEXT PRIMARY KEY,
  authority_id  TEXT NOT NULL REFERENCES authorities(id) ON DELETE CASCADE,
  para_no       TEXT NOT NULL,
  body          TEXT NOT NULL
);

CREATE VIRTUAL TABLE authority_paras_fts USING fts5(
  body,
  content = 'authority_paras',
  content_rowid = 'rowid',
  tokenize = 'porter unicode61'
);

CREATE TRIGGER authority_paras_ai AFTER INSERT ON authority_paras BEGIN
  INSERT INTO authority_paras_fts(rowid, body) VALUES (new.rowid, new.body);
END;
CREATE TRIGGER authority_paras_ad AFTER DELETE ON authority_paras BEGIN
  INSERT INTO authority_paras_fts(authority_paras_fts, rowid, body) VALUES ('delete', old.rowid, old.body);
END;

-- ---------------------------------------------------------------------------
-- Drafting
-- ---------------------------------------------------------------------------

CREATE TABLE templates (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  doc_type      TEXT NOT NULL,
  jurisdiction  TEXT NOT NULL,
  version       TEXT NOT NULL,
  is_current    INTEGER NOT NULL DEFAULT 1,
  description   TEXT NOT NULL,
  variables     TEXT NOT NULL,             -- JSON array of {key,label,example}
  body          TEXT NOT NULL,             -- {{placeholder}} + [[clause:slot]] markers
  usage_count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clauses (
  id            TEXT PRIMARY KEY,
  slot          TEXT NOT NULL,             -- which template slot this can fill
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  -- 'standard' is M3M's approved position; anything else redlines against it.
  variant       TEXT NOT NULL CHECK (variant IN ('standard','alternative','counterparty_favourable')),
  risk_level    TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  risk_note     TEXT,
  usage_count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE drafts (
  id            TEXT PRIMARY KEY,
  matter_id     TEXT REFERENCES matters(id) ON DELETE SET NULL,
  template_id   TEXT REFERENCES templates(id),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  variables     TEXT NOT NULL,             -- JSON of filled values
  clause_choices TEXT NOT NULL,            -- JSON of slot -> clause_id
  status        TEXT NOT NULL CHECK (status IN ('draft','in_review','approved')),
  created_by    TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Analyses (the litigation engine's output, persisted)
-- ---------------------------------------------------------------------------

CREATE TABLE analyses (
  id            TEXT PRIMARY KEY,
  matter_id     TEXT REFERENCES matters(id) ON DELETE SET NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('proposition','pleading')),
  input_text    TEXT NOT NULL,
  result_json   TEXT NOT NULL,
  model_used    TEXT NOT NULL,
  tier          TEXT NOT NULL,
  latency_ms    INTEGER NOT NULL,
  cost_inr      REAL NOT NULL,
  created_by    TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Collaboration and governance
-- ---------------------------------------------------------------------------

CREATE TABLE comments (
  id            TEXT PRIMARY KEY,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  author_id     TEXT NOT NULL REFERENCES users(id),
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE activity (
  id            TEXT PRIMARY KEY,
  actor_id      TEXT NOT NULL REFERENCES users(id),
  verb          TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  entity_label  TEXT NOT NULL,
  matter_id     TEXT REFERENCES matters(id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL
);

-- DPDP: every request records where it was processed.
CREATE TABLE audit_log (
  id              TEXT PRIMARY KEY,
  user_id         TEXT REFERENCES users(id),
  action          TEXT NOT NULL,
  resource        TEXT NOT NULL,
  model_used      TEXT,
  tier            TEXT,
  data_residency  TEXT NOT NULL,
  latency_ms      INTEGER,
  created_at      TEXT NOT NULL
);

CREATE INDEX idx_documents_matter ON documents(matter_id);
CREATE INDEX idx_doc_chunks_document ON doc_chunks(document_id);
CREATE INDEX idx_authority_paras_authority ON authority_paras(authority_id);
CREATE INDEX idx_activity_created ON activity(created_at DESC);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_analyses_matter ON analyses(matter_id);
CREATE INDEX idx_clauses_slot ON clauses(slot);
