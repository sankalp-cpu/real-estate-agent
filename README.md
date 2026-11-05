# Real Estate agent

A chat-first legal workspace for real estate teams: source-linked matter questions,
case-law research, a document vault, tabular review, template drafting and a guided tour.

## Run locally

Requires Node 22+ and a native build toolchain for `better-sqlite3`.

```bash
npm ci
npm run seed
npm run dev -- --hostname 0.0.0.0
```

Open http://localhost:3000. Seeding **resets** the local synthetic demo database,
`db/real-estate.sqlite`; do not run it against data you need to preserve.

```bash
npm test
npx tsc --noEmit
NEXT_BUILD_DIR=.next-build npm run build
```

`NEXT_BUILD_DIR` keeps a production verification build separate from the dev server.
`npm run smoke` provides the legacy legal-workflow browser checks and requires a
Playwright Chromium installation or `CHROMIUM_PATH`.

## Walkthrough

1. Complete or skip the first-visit tour. Replay it using the sidebar.
2. Ask what the Rao notice claims. Open a page citation to inspect the source.
3. Switch between Filed page and Working copy. Working-copy edits save only in
   this browser; the indexed source remains unchanged.
4. Open Vault to search/filter accessible documents.
5. Open Tabular Review and add standard lease questions. Results are excerpt
   matches with source links, not full-PDF semantic extraction.
6. Open Draft, select Mutual NDA or MOU, fill particulars and create a working draft.
   The full clause library and six templates remain available in the advanced studio.
7. Use Workflows or the Litigation Analyst to analyse a proposition or the seeded
   seven-ground consumer complaint. Overruled and contrary authority stay visible.
8. Inspect Access and Control Room. Switch demo identity in the sidebar to test
   matter scoping. This is a demo cookie, **not production authentication**.

## Corpus and boundaries

The original repository's 34 judgments, six templates, 15 clauses, six matters and
seven documents are retained with generic branding. The observed Golf Estate/Rao
scenario adds one matter and four explicitly synthetic documents.

Public case passages are **editorial summaries**, not verbatim quotations or a live
legal database. All private matter records are synthetic. A lawyer must verify the
source judgments and current law before relying on any output.

The supplied repository differs from the deployed reference. This adaptation closely
follows its visible layout but does not claim a measured 98% match or possession of
its entire dataset. Actual corpus counts are displayed rather than invented totals.
See [implementation notes](docs/IMPLEMENTATION.md) for remaining fidelity limits.

## Replit AI

The direct third-party provider was removed. The new adapter uses Replit's managed
OpenAI-compatible endpoint. The host must securely inject:

- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `LLM_PROVIDER=replit`
- Optional `REPLIT_AI_MODEL` (default `gpt-4.1-mini`)

Never put credential values in this repository. This standalone sandbox does not
automatically receive managed AI credentials. Without configuration the app clearly
uses deterministic fixture mode: retrieval, citations and drafts still work, but
there is **no live model inference**. The adapter has mocked contract tests; live
managed-endpoint behavior remains unverified.

## Structure

- `app/` — Next.js workspace, routes and APIs
- `lib/retrieval.ts` — SQLite FTS/BM25 retrieval and relevance gates
- `lib/analyst.ts` — proposition/pleading analysis with citation constraints
- `lib/drafting.ts` — deterministic templates, clauses and redlines
- `lib/llm/` — provider interface, fixture mode and Replit adapter
- `db/seed/` — synthetic workspace, judgments, stance layer and templates
- `docs/PRD.md` — inherited product requirements, abstracted for a generic developer
- `tests/` — retrieval, analysis, seed and provider tests
