# Real Estate agent adaptation

## Running

Node 22+, a C++ build toolchain for better-sqlite3, then:

    npm ci
    npm run seed
    npm run dev -- --hostname 0.0.0.0

Seeding resets the local demo database. Do not run it against data that must be preserved.

## What changed

- Chat-first white workspace with a grey sidebar, matter selection and first-visit/replayable tour.
- Matter Q&A returns indexed excerpts with working source readers.
- Vault with scoped document search, sorting, previews and working-copy text export.
- Tabular review with question columns, source references and CSV export.
- Workflow entry points into legal analysis, notice response and drafting.
- Existing legal retrieval engine, 34-authority corpus, 6 templates and 15 clauses retained.
- Generic company naming in schema, metadata, fixtures, templates, prompts and documentation.
- Replit-managed OpenAI-compatible provider replaces the direct third-party adapter.
- Access and Control Room show actual demo scope and audit records.

## Fidelity and intentional limits

This is a close visual adaptation, not a verified 98% replica. The supplied source differs
substantially from the deployed reference. The original six matters and seven documents are
retained with generic branding. Four explicitly synthetic Golf Estate documents reconstruct
the observed Rao notice flow, using the amounts/dates seen in the reference. They are not
the full deployed corpus. No fictitious 200-document lease portfolio is claimed.

Tabular review matches indexed excerpts; it is not semantic AI extraction across full PDFs.
Document editing persists a working copy in browser localStorage and never modifies the filed
source. Text and CSV export are supported; DOCX/PDF ingestion, scanned images and OCR are not
implemented. Vault does not pretend that uploads or sample ingestion are available.

Demo identity uses a selectable cookie, not secure login. Matter scoping is enforced server-side,
but production requires authenticated identities and a proper permission model.
Replit AI must be provisioned by the host and configured via secrets; the current standalone
sandbox is explicitly in fixture mode. Live provider integration has mocked contract tests,
not a live managed-endpoint verification. No fabricated financial answers, live legal updates,
certified residency, cost tracking or tamper-evident logs are claimed.
