# M3M Legal AI Prototype

A litigation-focused legal AI platform for the M3M India legal department, built after the
discovery call of 12 August 2026.

The department runs on five shared frontier-model accounts across a team of 10–12 core counsel and
some 40 people in total. Responses have degraded to 15–20 minutes, the DPDP Act is pushing data onto
Indian infrastructure that is short of capacity, thousands of historical contracts sit in physical
scans, and nothing in the current tooling helps with litigation at all.

The ask made in that call, in the client's own words:

> *"A pleading has been filed against me asserting some point of law. I want to research that, and I
> want an analysis that tells me: is this available to me, or is it against me, and how do I counter
> it."*

And immediately after, the question that decides whether any of it is usable:

> *"How would I say that the legal answers given are grounded or not?"*

This repository is the answer to both. The full specification is in [`docs/PRD.md`](docs/PRD.md).

---

## Running it

```bash
npm install
npm run seed     # builds db/m3m.sqlite from schema + seed data
npm run dev      # http://localhost:3000
```

No API keys, no external services, no network. Node 22+.

```bash
npm test         # 23 tests: retrieval quality, verdicts, corpus integrity, anti-hallucination
npm run smoke    # end-to-end walkthrough against a running dev server
npm run build    # production build
```

---

## What "grounded" means here

This is the load-bearing claim, so it is worth being precise. It is a property of the architecture,
not an assertion about model quality.

1. **Retrieval runs before generation.** Every legal answer begins with a BM25/FTS5 search over the
   indexed corpus. The model never answers from parametric memory.

2. **Citations are constructed from retrieval, never emitted by the model.** A citation in the
   output is a reference to a row in the index — a specific passage of a specific judgment that was
   actually retrieved. The model narrates a payload assembled from those rows. *It cannot fabricate a
   citation, because citations are not generated text.* `tests/analyst.test.ts` enforces this: every
   citation the system emits must resolve to a real indexed passage, and the narrative may not name a
   citation retrieval did not return.

3. **The retrieved set is on screen.** The grounding panel shows each passage, its score, its
   provenance, the routing decision and the residency of the request — by default, not behind a
   disclosure.

4. **Unsupported claims are suppressed rather than smoothed.** Ask about company law or trade marks —
   subjects the corpus knows nothing about — and the answer is *no authority found*, not the
   best-scoring real-estate judgment. See "Relevance gating" below.

5. **Currency is explicit.** Every authority carries a good-law status checked at answer time.

---

## Relevance gating

BM25 ranks *within* a result set and says nothing about whether the best hit is any good. Normalising
scores hands the best-of-a-bad-set a perfect score, so an out-of-domain query still returns something
confident. That is the hallucination path, and closing it took three bars in `lib/retrieval.ts`:

| Bar | What it does |
|---|---|
| **Distinctive-term match** | A hit must match at least one of the rarer half of the query's terms. Generic legal vocabulary — *possession*, *construction*, *compensation* — is shared across every practice area and proves nothing. |
| **Coverage floor** | A hit must account for a minimum share of the query's IDF mass, filtering passages that catch one rare word in passing. |
| **Subject-coverage guard** | If most of a short query's distinctive weight sits in terms the index has never seen, the corpus does not cover the subject and nothing is returned. |

Distinctiveness is measured *relative to the query* rather than against a fixed corpus threshold. A
fixed threshold does not survive contact with a corpus this size: set it where "doctrine of
equivalents" is excluded and it also excludes "delay", dropping the governing authority on delayed
possession; set it to keep "delay" and patent queries start matching real-estate judgments on
"construction".

---

## The corpus

34 real Indian judgments across the forums M3M actually litigates in — RERA, consumer (NCDRC/SCDRC),
IBC and NCLT, arbitration, land acquisition and title, and contract.

**What is real:** every judgment, citation, court, bench, year and good-law status. Every holding is
an accurate statement of what the case decided.

**What is not:** the passage text is an *editorial precis* of each holding, not verbatim judgment
text, and the locators (`Held (i)`, `Ratio`) are locators into that precis rather than the judgment's
own paragraph numbering. A production deployment indexes licensed full text and cites true paragraph
numbers. We would rather under-claim than put a fabricated pin cite in front of counsel, and the
interface says so on every screen.

Two decisions are seeded specifically to exercise the currency check, because this is where a
general-purpose chat assistant fails hardest — its training cutoff freezes the law silently:

- **N.N. Global Mercantile v. Indo Unique Flame** (2023) 7 SCC 1 — *overruled* by the seven-Judge
  Bench in *In Re: Interplay* (2024) 6 SCC 1.
- **Pune Municipal Corporation v. Harakchand Solanki** (2014) 3 SCC 183 — *overruled* by *Indore
  Development Authority v. Manoharlal* (2020) 8 SCC 129.

Ask about either and the system returns it as the top hit, strikes it through, and names what
replaced it.

A third, **Vidarbha Industries v. Axis Bank**, is marked *distinguished* — attractive to a
respondent but confined to its own facts by *M. Suresh Kumar Reddy*. It carries reduced weight in the
verdict and a warning.

### The stance layer

`db/seed/authorities.ts` records what each judgment decided; it is neutral and contains nothing
M3M-specific. `db/seed/stances.ts` separately records how each authority bears on M3M's position and
how to meet it. The case record is a matter of fact and must not be bent toward the client; the
stance is advocacy, and the interface labels it as such.

---

## Demo script

A ten-minute walkthrough that hits every claim made in the meeting.

**1 · The seats problem** — Open the user menu, top right. Six named people with roles. Switch to
**S. Krishnan (Panel Counsel)**: the dashboard drops from six matters to one, and
`/matters/m-arb-turnkey` refuses access. Repository search for *"arbitrator appointed by the
employer"* returns nothing for them and the EPC contract for everyone else. Switch back to **Ananya
Sharma**.

**2 · The marquee ask — a pleading filed against us** — *Litigation Analyst → Pleading filed against
us → "Load the NCDRC complaint on file" → Analyse.* Seven grounds extracted from the complaint, each
researched independently, each with a counter-argument outline tied to named authority. Open Ground 6
(forfeiture of 20% earnest money): the system finds *Kailash Nath Associates v. DDA* against M3M and
sets out the defensible position — a genuine pre-estimate supported by actual holding costs. Note the
time in the grounding panel.

**3 · Is it grounded?** — Grounding panel, right-hand side. Every passage that produced the answer,
with scores and provenance. Point out that the citations were built from these rows, not written by
the model, and that CI fails if any emitted citation does not resolve.

**4 · Is it current?** — *Proposition* mode → *"An unstamped agreement cannot be referred to
arbitration."* Top hit is **N.N. Global**, struck through in red, flagged overruled, naming *In Re:
Interplay*. This is the answer to *"will it pick up the recent judgments?"* — and the failure mode a
chat assistant with a training cutoff cannot avoid.

**5 · When it does not know** — *"A shareholder may compel the declaration of dividend in an unlisted
company."* **No authority found.** Nothing invented. This is the most important slide in the deck.

**6 · Where we win** — *"A section 7 IBC application by 38 allottees out of 604 in the project is not
maintainable for want of the statutory threshold."* *Manish Kumar v. Union of India* assists: the
threshold is the lesser of 100 allottees or 10% — 61 here — and they are short on both limbs.

**7 · The enterprise brain** — *Repository.* Scans, uploads, ERP extracts and email in one index. The
Sector 91 title abstract sits at *needs review* on 68% OCR confidence, held back from the index rather
than silently included. Search *"agreement to sell general power of attorney"* — it finds the defect
in the title chain and *Suraj Lamp* at the same time.

**8 · The volume work** — *Drafting Studio → Leave and License → Fill from example.* Switch the
security deposit clause to *forfeiture on early exit*: it is flagged high risk, the note cites
*Kailash Nath* and *Maula Bux*, and *Assemble draft* produces a redline against the approved position
plus the full document. Sub-second, Tier 1, on-premise.

**9 · The commercials** — *Trust & Control.* Routing table: volume work never reaches a frontier
model. Latency by tier. The DPDP audit log with residency on every request. Five shared seats at ₹1.0
lakh/month against 48 named users at ₹1.85 lakh/month.

---

## Architecture

```
app/                    Next.js 15 App Router
  analyst/              Litigation Analyst — proposition and pleading modes
  repository/           Cross-corpus search and the OCR pipeline
  drafting/             Template + clause assembly with redline
  matters/[id]/         Matter workspace, access-checked on read
  admin/                Routing, latency, audit log, cost
  api/                  analyse, draft
lib/
  retrieval.ts          BM25 over FTS5 + relevance gating
  analyst.ts            Verdicts, ground extraction, counter-arguments
  drafting.ts           Assembly and redline
  llm/                  Provider interface, routing, fixture + Anthropic adapter
  session.ts            Identity and matter-scoped access
db/
  schema.sql            SQLite + FTS5
  seed/                 Corpus, stances, workspace, templates
tests/                  node:test — retrieval, analyst, smoke
```

**Stack:** Next.js 15, React 19, TypeScript, Tailwind 4, SQLite via `better-sqlite3` with FTS5.
Genuine BM25 retrieval with no external services is what lets grounding be demonstrated rather than
described.

### The model layer

Routing by task, in `lib/llm/provider.ts`:

| Tier | Model | Deployment | Tasks |
|---|---|---|---|
| 1 | `m3m-draft-8b` | On-premise | Drafting, summarisation, extraction |
| 2 | `m3m-legal-40b` | On-premise | Proposition and pleading analysis |
| 3 | Configurable frontier | India-region cloud | Escalation only, when the corpus has no adequate authority |

Generation runs through a deterministic fixture provider by default: it narrates a payload assembled
from retrieval, has no other knowledge available to it, returns in single-digit milliseconds, and
cannot fail mid-demo. To narrate the same payloads with a live model:

```bash
LLM_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-... npm run dev
```

The live provider runs under a system prompt forbidding it to introduce authority absent from the
payload — and it makes no difference to the citations either way, because those are built from
retrieval before the model is called.

---

## What is simulated

Stated plainly, because a demo that blurs this line is not worth showing to a legal audience.

| Real | Simulated |
|---|---|
| BM25/FTS5 retrieval and relevance scoring | On-premise model inference (deterministic provider stands in) |
| 34 real judgments, holdings and good-law status | OCR — pipeline states are real, the text is pre-extracted |
| Citation construction from retrieval, CI-enforced | ERP/CRM connectivity — fixture data on the real query path |
| Multi-user access control, enforced on read and in search | Latency and cost figures for the on-premise tiers |
| Template and clause assembly with redline | |

Seeded people, matters, projects and counterparties are fictional. The case law is real.

---

## Known limits

- **Corpus licensing.** Public citations only. Production needs a licensed feed (Indian Kanoon, SCC
  Online, Manupatra) — a commercial item to close before pilot.
- **Vocabulary expansion is a hand-built map.** It covers the seeded practice areas. A production
  corpus wants learned expansion or embeddings alongside BM25.
- **The stance layer is hand-authored.** Thirty-four authorities is tractable; thousands is not, and
  at that scale stances become a review workflow rather than a seed file.
- **No hardware benchmark.** Tier sizing and the routing mix are pilot-phase measurements. The cost
  figures on Trust & Control are labelled indicative because they are.
