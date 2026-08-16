# M3M Legal AI Platform — Product Requirements Document

**Version:** 0.1 (prototype spec)
**Date:** August 2026
**Owner:** 360 Labs
**Client:** M3M India — Legal Department
**Source:** Discovery call, 12 August 2026

---

## 1. Problem

M3M's legal department runs on five shared Claude accounts serving a core team of 10–12 counsel and
roughly 40 people across offices. The tooling works for isolated drafting tasks and has become a
bottleneck for everything else.

Five problems, taken directly from the discovery call:

| # | Problem | Evidence from the call |
|---|---|---|
| 1 | **Seats and cost** | Five accounts rotated across the team — no per-user logins, no shared history, no collaboration. Comparable firms are quoted ₹30–50 lakh/month for enterprise cloud subscriptions. |
| 2 | **Latency** | Responses that used to be fast now take 15–20 minutes. Attributed to global compute shortage compounded by the migration of Indian customer data onto under-provisioned domestic infrastructure. |
| 3 | **DPDP Act compliance** | Sensitive matter data — pleadings, contracts, homebuyer records — is being processed on foreign infrastructure. The DPDP Act pushes this onto Indian servers, which is also what created the latency problem. |
| 4 | **No centralized brain** | Thousands of historical contracts sit in physical scans and loose PDFs. No searchable repository, no canonical template set, no clause library, no reusable skills or agents. Nobody knows which MSA template is current. |
| 5 | **No litigation capability** | The marquee gap. Everything built to date is contract-side. Nothing helps with the actual work of an in-house litigation team. |

Problem 5 is what the client asked for, in their own words:

> *"There are times when we are faced with a legal proposition on which we have no prior order. On
> that proposition — what has the Supreme Court said, what has the High Court said, what has any other
> State High Court said. A pleading has been filed against me asserting some point of law. I want to
> research that, and I want an analysis that tells me: is this available to me, or is it against me,
> and how do I counter it."*

And immediately after, the question that decides whether any of this is usable:

> *"How would I say that the legal answers given are grounded or not?"*

That question is the real product requirement. A legal research tool that produces a plausible
citation to a case that does not exist, or to a judgment that has since been overruled, is worse than
no tool at all — it carries the risk into a filing. **Verifiable grounding is the feature, not a
footnote.**

---

## 2. Users and roles

| Role | Who | Primary need |
|---|---|---|
| **Head of Legal / GC** | Senior stakeholder | Litigation strategy, risk visibility across matters, cost control |
| **In-house counsel** | 10–12 core team | Precedent research, pleading analysis, drafting, matter ownership |
| **Paralegal / legal executive** | Support staff | Document intake, OCR, repository upkeep, first-cut drafts |
| **Panel / external counsel** | ~40 across offices | Scoped access to specific matters only |
| **Administrator** | IT / legal ops | Seats, permissions, model routing, audit, data residency |

Access is **matter-scoped**: panel counsel engaged on one NCDRC matter sees that matter and nothing
else. This is both a confidentiality requirement and a DPDP data-minimisation requirement.

---

## 3. Product pillars

### 3.1 Litigation Intelligence *(hero capability)*

The capability that does not exist today and that the client explicitly asked for.

**Proposition analysis.** Counsel states a proposition of law. The system returns the authorities that
support it, the authorities that cut against it, an applicability verdict, and pin cites to specific
paragraphs. Contrary authority is surfaced by default, not on request — counsel needs to know what the
other side will cite.

**Pleading analysis.** Counsel uploads or pastes the pleading filed against M3M. The system extracts
each point of law asserted, researches each one independently, and returns — for every point — the
supporting authorities, the contrary authorities, and a **counter-argument outline with pin cites**
that counsel can take into a draft reply.

**Good-law flagging.** Every authority carries a status: good law, distinguished, or overruled. An
overruled judgment is flagged in red and the superseding decision is named. This directly answers
*"will it pick up the recent judgments and tell me what is current?"* — and it is where general-purpose
chat assistants fail hardest, because their training cutoff silently freezes the law.

**Practice areas at launch:** RERA and delayed possession, consumer (NCDRC/SCDRC), IBC and NCLT,
arbitration, land acquisition and title. These are the forums M3M actually litigates in.

### 3.2 Enterprise Brain — repository and grounding

**OCR ingestion.** Physical contract scans and image PDFs pass through an OCR pipeline —
upload → scan → digitize → chunk → index — becoming full-text searchable. The pipeline state is visible
per document, so nobody wonders whether a scan made it in.

**Centralized repository.** Every contract, pleading, order and notice in one searchable store,
organised by matter, project, counterparty and forum. Search runs across the entire corpus, scoped by
the user's permissions.

**Structured-data grounding.** Connectors to ERP/CRM so that questions with a factual answer — booking
dates, payment schedules, possession commitments — resolve against actual company records rather than
the model's impression of them. The system generates and runs a query, then answers from the result
set.

### 3.3 Drafting Studio

Templated documents are the volume work, and the call put a number on it: 80–85% of standard document
generation needs nothing more than a small model working from good examples.

Templates at launch: MOU, NDA, MSA, Leave & License, Builder–Buyer Agreement, Brokerage / Channel
Partner Agreement, EPC contract, Section 138 notice, RERA notice.

Each draft is assembled from a versioned template plus a **clause library** with risk levels, filled
from matter variables. Counsel can swap any clause for an alternative and see a **redline against the
company standard** — so deviation from the approved position is visible rather than buried.

### 3.4 Workspace

Per-user logins replacing five shared accounts. Matter-centric organisation. Assignment, comments,
activity timeline, shared history. The work of a legal department is collaborative; the current tooling
treats it as five people typing alone.

### 3.5 Trust and Control

**Model routing.** Not every task needs a frontier model. Templated drafting and summarisation route to
a small on-premise model; litigation reasoning escalates. The routing decision, the model used, the
latency and the cost are shown on every response — no black box.

**Data residency.** Deployment on Indian infrastructure or M3M's own servers. Every record carries its
residency, and the audit log records where each request was processed. DPDP compliance becomes
demonstrable rather than asserted.

**Audit log.** Who asked what, against which documents, processed where, when. Required for DPDP and
useful for privilege.

---

## 4. What "grounded" means here

The client asked the question directly. This is the answer, and it is a commitment about system
architecture, not a quality aspiration.

1. **Retrieval precedes generation.** Every legal answer begins with a search over the indexed corpus.
   The model never answers from parametric memory alone.

2. **Citations are constructed from retrieval, never emitted by the model.** A citation in the output
   is a reference to a row in the index — a specific paragraph of a specific judgment that was actually
   retrieved. *The system cannot fabricate a citation, because citations are not generated text.* This
   is a structural guarantee, not a filter applied afterwards.

3. **The retrieved set is shown.** A grounding panel displays the passages retrieved, their relevance
   scores and their provenance. Counsel can read the source paragraph and judge for themselves.

4. **Unsupported claims are suppressed, not smoothed.** Where retrieval returns nothing adequate, the
   system says so. "No authority on this point in the indexed corpus" is a valid and useful answer.
   Confident prose over an empty result set is the failure mode that gets a firm sanctioned.

5. **Currency is explicit.** Good-law status is a property of every authority, checked at answer time.

6. **Factual questions resolve against records.** Numbers come from ERP/CRM queries whose results are
   shown, not from the model's recollection of a document.

The test that enforces this runs in CI: every citation the system emits must resolve to a real indexed
passage, or the build fails.

---

## 5. Model strategy

The intelligence needed for legal work is narrow and deep. A frontier general-purpose model is
simultaneously an expert physician, accountant and sports therapist — M3M is paying for all of it, and
waiting for all of it, to get a legal answer.

| Tier | Model | Deployment | Tasks |
|---|---|---|---|
| **1** | Small domain model (~7–13B) | On-premise | Template fill, summarisation, extraction, classification |
| **2** | Legal domain model (~40–50B) | On-premise | Precedent research, pleading analysis, counter-argument construction |
| **3** | Frontier model | India-region cloud | Novel propositions, multi-issue strategy, escalation only |

The routing rules are explicit and configurable, and the split is where the economics come from:
volume work never touches Tier 3, and Tier 1–2 run on hardware M3M controls — which fixes latency and
DPDP residency in the same move.

**Expected effect on the two headline complaints:** on-premise inference removes the queue that turned
responses into 15–20 minute waits, and on-premise processing removes the cross-border transfer that
DPDP is tightening around.

---

## 6. Non-goals

- **Not legal advice.** Every output is work product for a qualified professional to review. The
  interface says so, persistently.
- **No e-filing.** No automated submission to any court, tribunal or registry in v1.
- **No unattended drafting.** Every draft is reviewed before it leaves the building.
- **Not a case management or billing system.** It integrates with one; it does not replace one.
- **Not a replacement for licensed legal databases** in v1 — it indexes what M3M is licensed to index.

---

## 7. Phased plan

| Phase | Scope | Outcome |
|---|---|---|
| **Prototype** *(this repo)* | Litigation Analyst, repository, drafting studio, workspace, admin — on a curated demo corpus | Demonstrable, hands-on system for M3M to evaluate |
| **Pilot** | One practice area end to end. Real M3M corpus ingested. On-premise models deployed and benchmarked. 10–12 users. | Measured latency, cost and quality against the current baseline |
| **Production** | All practice areas, full user base, ERP/CRM connectors, licensed case-law feed, SSO, DR | Departmental system of record |

---

## 8. Success metrics

| Metric | Baseline (today) | Target |
|---|---|---|
| p50 response latency | Minutes; 15–20 min observed at worst | < 5 seconds (Tier 1–2) |
| Precedent research turnaround | Hours to days, manual | < 10 minutes to a cited analysis |
| Time to first draft (standard document) | Hours | < 15 minutes |
| Standard documents from approved template | Unmeasured | > 80% |
| Named users with access | 5 shared accounts | Full department, individually credentialed |
| Citation accuracy | Unverifiable | 100% resolvable to source (CI-enforced) |
| Cost per user / month | Rising, opaque | Materially below per-seat frontier subscription |

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| **Hallucinated or overruled citations** | Citations constructed from retrieval; good-law status on every authority; CI test on citation resolution |
| **Case-law licensing** | Prototype uses public citations only. Production requires a licensed feed (Indian Kanoon / SCC Online / Manupatra) — commercial item to close before pilot |
| **OCR quality on old scans** | Confidence scoring per document; low-confidence pages queued for human verification rather than silently indexed |
| **On-premise hardware sizing** | Benchmarked during pilot before any capex commitment |
| **Small-model quality ceiling** | Tier 3 escalation path always available; routing thresholds tuned against pilot data |
| **Change management** | Interface deliberately mirrors the tool the team already uses; phased rollout starting with the core litigation team |
| **Over-reliance by users** | Persistent review-required framing; grounding panel makes verification the default interaction, not an extra step |

---

## 10. Prototype scope

What is built in this repository, and what is deliberately simulated.

**Real:**
- BM25/FTS5 retrieval over an indexed corpus — genuine search, genuine relevance scoring
- ~30 real Indian judgments with accurate holdings and paragraph-level extracts
- Citation construction from retrieval, with the CI test that enforces it
- Good-law flagging, including two genuinely overruled authorities
- Multi-user workspace, matters, permissions, audit log
- Template and clause assembly with redline

**Simulated, and labelled as such in the interface:**
- On-premise model inference (a deterministic provider stands in for the local model; an Anthropic
  adapter is available behind an environment flag)
- OCR (pipeline states are real; the text is pre-extracted)
- ERP/CRM connectivity (fixture data on the real query path)

**Corpus disclaimer:** the seeded corpus is a demonstration subset. Every judgment in it is real and
every holding is accurate, but it is not a substitute for a licensed database and the interface carries
a persistent *verify before filing* notice.
