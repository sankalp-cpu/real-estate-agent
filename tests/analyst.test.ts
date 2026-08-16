import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Database from 'better-sqlite3';
import { seed } from '../db/seed/index.ts';
import {
  analyseProposition,
  analysePleading,
  extractGrounds,
  citationIdsIn,
} from '../lib/analyst.ts';
import { resolveParaId } from '../lib/retrieval.ts';
import { PLEADING_TEXT } from '../db/seed/workspace.ts';
import { AUTHORITIES } from '../db/seed/authorities.ts';
import { STANCES } from '../db/seed/stances.ts';

let db: Database.Database;
let dbPath: string;

before(() => {
  dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'm3m-')), 'test.sqlite');
  seed(dbPath);
  db = new Database(dbPath, { readonly: true });
});

after(() => {
  db?.close();
  fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// The anti-hallucination guarantee — docs/PRD.md §4
// ---------------------------------------------------------------------------

test('every citation emitted by a proposition analysis resolves to an indexed passage', async () => {
  const queries = [
    'a clause capping delay compensation limits our liability to the allottee',
    'forfeiture of 20 percent earnest money on cancellation is enforceable',
    'a section 7 application by 38 of 604 allottees is not maintainable',
    'the arbitration clause bars the consumer complaint',
    'an unstamped contract cannot be referred to arbitration',
  ];

  for (const q of queries) {
    const analysis = await analyseProposition(db, q);
    const ids = citationIdsIn(analysis);
    for (const id of ids) {
      assert.ok(
        resolveParaId(db, id),
        `analysis of "${q}" emitted citation ${id}, which is not in the index`,
      );
    }
  }
});

test('every citation emitted by a pleading analysis resolves to an indexed passage', async () => {
  const analysis = await analysePleading(db, PLEADING_TEXT);
  const ids = citationIdsIn(analysis);
  assert.ok(ids.length > 0, 'the pleading analysis should have produced citations');
  for (const id of ids) {
    assert.ok(resolveParaId(db, id), `emitted citation ${id} is not in the index`);
  }
});

test('the narrative never cites a judgment the retrieval step did not return', async () => {
  // The provider narrates a payload built from retrieval. If a citation appears in
  // the prose that was not retrieved, the separation has broken.
  //
  // The test keys on citations rather than case titles: a retrieved holding may
  // legitimately *name* another case in its own text — Indore Development Authority
  // names Pune Municipal Corporation because it overrules it — without that being a
  // citation the system has emitted.
  for (const q of [
    'delay in possession and one-sided compensation clause',
    'forfeiture of earnest money on cancellation',
    'unstamped agreement and arbitration',
  ]) {
    const analysis = await analyseProposition(db, q);
    const retrievedCitations = new Set(analysis.retrieval.map((h) => h.citation));

    for (const a of AUTHORITIES) {
      if (analysis.narrative.includes(a.citation) && !retrievedCitations.has(a.citation)) {
        assert.fail(
          `narrative for "${q}" cited ${a.citation} (${a.caseTitle}), which retrieval did not return`,
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// Verdicts
// ---------------------------------------------------------------------------

test('a proposition with no authority in the corpus returns no_authority, not a guess', async () => {
  const analysis = await analyseProposition(
    db,
    'whether a shareholder may compel the declaration of dividend in an unlisted company',
  );
  assert.equal(analysis.verdict.stance, 'no_authority');
  assert.equal(analysis.assisting.length, 0);
  assert.equal(analysis.adverse.length, 0);
  assert.match(analysis.narrative, /No authority on this point/i);
});

test('a proposition supported by authority is reported as available', async () => {
  const analysis = await analyseProposition(
    db,
    'a landowner cannot claim the acquisition lapsed where compensation was deposited in the treasury and possession taken',
  );
  assert.equal(analysis.verdict.stance, 'available');
  assert.ok(
    analysis.assisting.some((h) => h.caseTitle.includes('Indore Development Authority')),
    'Indore Development Authority should be the assisting authority',
  );
});

test('a proposition contradicted by authority is reported as against', async () => {
  const analysis = await analyseProposition(
    db,
    'a clause capping delay compensation at Rs 10 per square foot per month caps our liability to the allottee',
  );
  assert.equal(analysis.verdict.stance, 'against');
  assert.ok(analysis.adverse.length > 0);
  assert.ok(analysis.verdict.adverseWeight > analysis.verdict.assistingWeight);
});

test('overruled authority carries no weight in the verdict but still raises a warning', async () => {
  const analysis = await analyseProposition(
    db,
    'an unstamped arbitration agreement is void and unenforceable',
  );
  const overruled = analysis.currencyWarnings.find((w) => w.caseTitle.includes('N.N. Global'));
  assert.ok(overruled, 'N.N. Global should raise a currency warning');
  assert.equal(overruled.status, 'overruled');
  assert.match(overruled.supersededBy!.caseTitle, /Interplay/);

  // It must not appear as live authority in any bucket.
  const buckets = [...analysis.assisting, ...analysis.adverse, ...analysis.balanced];
  assert.ok(
    !buckets.some((h) => h.caseTitle.includes('N.N. Global')),
    'overruled authority must not be presented as live',
  );
});

// ---------------------------------------------------------------------------
// Pleading analysis
// ---------------------------------------------------------------------------

test('grounds are extracted from the filed pleading and the prayer is discarded', () => {
  const grounds = extractGrounds(PLEADING_TEXT);
  assert.equal(grounds.length, 7, 'the seeded complaint pleads seven grounds');
  assert.ok(grounds.every((g) => g.text.length > 80));
  assert.ok(
    !grounds.some((g) => /PRAYER|pray that this Commission/i.test(g.text)),
    'the prayer must not be treated as a ground',
  );
  assert.match(grounds[0].text, /failed to hand over possession/);
});

test('each ground produces a counter-argument tied to a real authority', async () => {
  const analysis = await analysePleading(db, PLEADING_TEXT);
  assert.equal(analysis.grounds.length, 7);

  for (const g of analysis.grounds) {
    assert.ok(g.counterPoints.length > 0, `${g.label} produced no counter-argument`);
    for (const c of g.counterPoints) {
      assert.ok(c.point.length > 40, `${g.label} counter-point is too thin to be useful`);
      const authority = AUTHORITIES.find((a) => a.id === c.authorityId);
      assert.ok(authority, `counter-point cites unknown authority ${c.authorityId}`);
      assert.equal(c.citation, authority.citation);
    }
  }
});

test('the forfeiture ground is correctly identified as running against M3M', async () => {
  const analysis = await analysePleading(db, PLEADING_TEXT);
  const forfeiture = analysis.grounds.find((g) => /forfeiture of the entire earnest money/i.test(g.text));
  assert.ok(forfeiture, 'expected a ground on forfeiture');
  assert.equal(forfeiture.verdict.stance, 'against');
  assert.ok(
    forfeiture.counterPoints.some((c) => c.caseTitle.includes('Kailash Nath')),
    'Kailash Nath is the governing authority on forfeiture without proof of loss',
  );
});

// ---------------------------------------------------------------------------
// Corpus integrity
// ---------------------------------------------------------------------------

test('every authority carries a stance and every overruled authority names its successor', () => {
  for (const a of AUTHORITIES) {
    assert.ok(STANCES[a.id], `${a.caseTitle} has no stance recorded`);
    assert.ok(STANCES[a.id].counterPoint.length > 60, `${a.caseTitle} has a thin counter-point`);
    if (a.status === 'overruled') {
      assert.ok(a.statusNote, `${a.caseTitle} is overruled but carries no note`);
      assert.ok(a.supersededBy, `${a.caseTitle} is overruled but names no successor`);
      assert.ok(
        AUTHORITIES.some((x) => x.id === a.supersededBy),
        `${a.caseTitle} names a successor that is not in the corpus`,
      );
    }
  }
});

test('telemetry reports the routing decision and on-premise residency', async () => {
  const analysis = await analyseProposition(db, 'delay in possession compensation');
  assert.equal(analysis.telemetry.tier, 'tier-2');
  assert.match(analysis.telemetry.model, /m3m-legal-40b/);
  assert.match(analysis.telemetry.residency, /^IN —/);
  assert.ok(analysis.telemetry.retrievalMs >= 0);
  assert.ok(analysis.telemetry.passagesSearched > 0);
});
