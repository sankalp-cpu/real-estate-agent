import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Database from 'better-sqlite3';
import { seed } from '../db/seed/index.ts';
import { searchAuthorities, searchDocuments, resolveParaId } from '../lib/retrieval.ts';

let db: Database.Database;
let dbPath: string;

before(() => {
  dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rea-')), 'test.sqlite');
  seed(dbPath);
  db = new Database(dbPath, { readonly: true });
});

after(() => {
  db?.close();
  fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
});

const titles = (q: string, n = 6) =>
  searchAuthorities(db, q, n).map((h) => h.caseTitle);

test('delayed possession query retrieves the governing authorities', () => {
  const found = titles('delay in handing over possession compensation to allottee');
  assert.ok(
    found.some((t) => t.includes('Arifur Rahman Khan')),
    `expected Arifur Rahman Khan in top hits, got: ${found.join(' | ')}`,
  );
  assert.ok(
    found.some((t) => t.includes('Newtech Promoters')),
    `expected Newtech Promoters in top hits, got: ${found.join(' | ')}`,
  );
});

test('one-sided clause query reaches the unfair-terms line of authority', () => {
  const found = titles('one-sided clause in apartment buyer agreement is unfair and not binding');
  assert.ok(
    found.some((t) => t.includes('Govindan Raghavan')),
    `expected Pioneer Urban v. Govindan Raghavan, got: ${found.join(' | ')}`,
  );
});

test('Section 7 threshold query retrieves Manish Kumar', () => {
  const found = titles('minimum number of allottees required to file an application under section 7');
  assert.ok(
    found.some((t) => t.includes('Manish Kumar')),
    `expected Manish Kumar v. Union of India, got: ${found.join(' | ')}`,
  );
});

test('unstamped arbitration query surfaces N.N. Global AND flags it as overruled', () => {
  const hits = searchAuthorities(db, 'unstamped arbitration agreement is unenforceable', 6);
  const nnGlobal = hits.find((h) => h.caseTitle.includes('N.N. Global'));

  assert.ok(nnGlobal, 'expected N.N. Global to be retrieved');
  assert.equal(nnGlobal.status, 'overruled');
  assert.ok(nnGlobal.supersededBy, 'overruled authority must name what superseded it');
  assert.match(nnGlobal.supersededBy.caseTitle, /Interplay/);
});

test('acquisition lapse query flags Pune Municipal Corporation as overruled', () => {
  const hits = searchAuthorities(db, 'acquisition lapses where compensation not deposited in court', 6);
  const pune = hits.find((h) => h.caseTitle.includes('Pune Municipal'));

  assert.ok(pune, 'expected Pune Municipal Corporation to be retrieved');
  assert.equal(pune.status, 'overruled');
  assert.match(pune.supersededBy!.caseTitle, /Indore Development Authority/);
});

test('vocabulary expansion bridges counsel phrasing to judgment phrasing', () => {
  // "homebuyer" and "builder" appear nowhere in the Newtech passages, which speak
  // of "allottee" and "promoter". Expansion has to carry the query across.
  const found = titles('homebuyer refund from builder on delay');
  assert.ok(found.length > 0, 'expansion should have produced hits');
  assert.ok(
    found.some((t) => t.includes('Newtech') || t.includes('Ireo') || t.includes('Govindan')),
    `expected RERA/consumer authority, got: ${found.join(' | ')}`,
  );
});

test('a query outside the corpus returns nothing rather than a confident wrong answer', () => {
  // This is the guarantee in docs/PRD.md §4.4. The corpus holds no company-law or
  // IP authority; returning the best of a bad set would be the hallucination path.
  assert.equal(
    searchAuthorities(db, 'shareholder right to compel declaration of dividend', 6).length,
    0,
  );
  assert.equal(
    searchAuthorities(db, 'limitation period for filing a trademark opposition', 6).length,
    0,
  );
  assert.equal(searchAuthorities(db, 'patent claim construction doctrine of equivalents', 6).length, 0);
});

test('every retrieved citation resolves back to a real indexed passage', () => {
  const hits = searchAuthorities(db, 'delay possession refund one-sided clause forfeiture', 12);
  assert.ok(hits.length > 0);
  for (const h of hits) {
    const row = resolveParaId(db, h.paraId);
    assert.ok(row, `citation ${h.paraId} did not resolve to an indexed passage`);
    assert.equal(row.body, h.body);
    assert.equal(row.citation, h.citation);
  }
});

test('document search is scoped by matter access', () => {
  const unscoped = searchDocuments(db, 'arbitrator appointed by the employer', { limit: 10 });
  assert.ok(
    unscoped.some((h) => h.matterId === 'm-arb-turnkey'),
    'expected the EPC contract to be reachable without scoping',
  );

  // A panel counsel confined to the NCDRC matter must not reach the EPC contract.
  const scoped = searchDocuments(db, 'arbitrator appointed by the employer', {
    limit: 10,
    matterIds: ['m-ncdrc-skyline'],
  });
  assert.ok(
    scoped.every((h) => h.matterId === 'm-ncdrc-skyline' || h.matterId === null),
    `scoped search leaked matters: ${scoped.map((h) => h.matterId).join(', ')}`,
  );
});

test('document search finds the one-sided clause in the scanned buyer agreement', () => {
  const hits = searchDocuments(db, 'compensation of Rs 10 per square foot per month for delay', {
    limit: 5,
  });
  assert.ok(
    hits.some((h) => h.locator === 'Clause 11.4' && h.documentId === 'doc-aba-skyline'),
    `expected Clause 11.4 of the scanned ABA, got: ${hits.map((h) => h.locator).join(', ')}`,
  );
});

test('an empty or stopword-only query retrieves nothing', () => {
  assert.equal(searchAuthorities(db, '', 5).length, 0);
  assert.equal(searchAuthorities(db, 'the and of to is', 5).length, 0);
});
