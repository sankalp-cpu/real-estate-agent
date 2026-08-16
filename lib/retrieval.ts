/**
 * Retrieval — BM25 over FTS5.
 *
 * This module is the foundation of the grounding guarantee. Every citation the
 * system emits is built from a row returned here, so a citation cannot refer to
 * a judgment that is not in the index. See docs/PRD.md §4.
 */

import type { Database } from 'better-sqlite3';

export type AuthorityHit = {
  kind: 'authority';
  authorityId: string;
  paraId: string;
  caseTitle: string;
  citation: string;
  court: string;
  bench: string | null;
  year: number;
  tags: string[];
  holding: string;
  status: 'good_law' | 'distinguished' | 'overruled';
  statusNote: string | null;
  supersededBy: { id: string; caseTitle: string; citation: string } | null;
  sourceUrl: string;
  /** M3M's editorial stance layer — advocacy, not part of the case record. */
  favours: 'm3m' | 'opponent' | 'balanced';
  counterPoint: string | null;
  locator: string;
  body: string;
  score: number;
  /** Share of the query's IDF mass this passage accounts for. See COVERAGE_FLOOR. */
  coverage: number;
};

export type DocumentHit = {
  kind: 'document';
  documentId: string;
  chunkId: string;
  title: string;
  docType: string;
  matterId: string | null;
  matterTitle: string | null;
  page: number;
  locator: string;
  heading: string | null;
  body: string;
  score: number;
};

export type Hit = AuthorityHit | DocumentHit;

/**
 * Legal vocabulary expansion. Counsel do not phrase a query the way a judgment
 * phrases a holding — "one-sided clause" has to reach "unfair", "unreasonable",
 * "unconscionable". Each expansion is OR'd into the FTS query at lower weight.
 */
const EXPANSIONS: Record<string, string[]> = {
  possession: ['possession', 'handover', 'delivery', 'occupation', 'completion'],
  delay: ['delay', 'delayed', 'deferred', 'belated'],
  refund: ['refund', 'return', 'repayment', 'withdraw'],
  compensation: ['compensation', 'damages', 'interest'],
  'one-sided': ['one-sided', 'unfair', 'unreasonable', 'unconscionable', 'onesided'],
  onesided: ['unfair', 'unreasonable', 'unconscionable'],
  unfair: ['unfair', 'unreasonable', 'unconscionable', 'one-sided'],
  clause: ['clause', 'term', 'stipulation', 'provision'],
  allottee: ['allottee', 'buyer', 'purchaser', 'homebuyer', 'consumer'],
  homebuyer: ['homebuyer', 'allottee', 'buyer', 'purchaser'],
  builder: ['builder', 'promoter', 'developer'],
  developer: ['developer', 'promoter', 'builder'],
  promoter: ['promoter', 'developer', 'builder'],
  forfeiture: ['forfeiture', 'forfeit', 'earnest', 'penalty', 'deposit'],
  earnest: ['earnest', 'forfeiture', 'deposit', 'advance'],
  penalty: ['penalty', 'liquidated', 'forfeiture', 'compensation'],
  arbitration: ['arbitration', 'arbitrator', 'arbitral', 'tribunal'],
  arbitrator: ['arbitrator', 'arbitration', 'appointment', 'appoint'],
  unstamped: ['unstamped', 'stamping', 'stamped', 'stamp', 'inadmissible'],
  stamping: ['stamping', 'stamp', 'unstamped', 'inadmissible', 'impound'],
  insolvency: ['insolvency', 'ibc', 'cirp', 'resolution', 'corporate'],
  ibc: ['ibc', 'insolvency', 'code', 'financial', 'creditor'],
  threshold: ['threshold', 'minimum', 'hundred', 'allottees', 'maintainability'],
  default: ['default', 'debt', 'due', 'payable'],
  acquisition: ['acquisition', 'acquire', 'lapse', 'compensation'],
  lapse: ['lapse', 'lapsed', 'deemed', 'acquisition'],
  title: ['title', 'conveyance', 'transfer', 'registered', 'ownership'],
  conveyance: ['conveyance', 'title', 'registered', 'transfer', 'deed'],
  jurisdiction: ['jurisdiction', 'forum', 'bar', 'maintainable'],
  consumer: ['consumer', 'complaint', 'deficiency', 'service'],
  rera: ['rera', 'regulatory', 'registration', 'promoter'],
  waiver: ['waiver', 'estoppel', 'acquiescence', 'accepted'],
  'force majeure': ['force', 'majeure', 'supervening', 'unforeseen'],
  specific: ['specific', 'performance', 'enforcement'],
  implied: ['implied', 'efficacy', 'business', 'term'],
};

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'of', 'to', 'in', 'on', 'for',
  'and', 'or', 'that', 'this', 'it', 'as', 'by', 'with', 'at', 'from', 'has', 'have', 'had',
  'not', 'no', 'any', 'all', 'can', 'may', 'shall', 'will', 'would', 'i', 'we', 'my', 'our',
  'me', 'us', 'whether', 'what', 'which', 'who', 'does', 'do', 'did', 'if', 'so', 'such',
  'there', 'their', 'they', 'them', 'he', 'she', 'his', 'her', 'you', 'your', 'against',
  'under', 'upon', 'been', 'about', 'into', 'than', 'then', 'when', 'where', 'how',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    // Bare numerals — years, paragraph numbers, amounts — carry no retrieval signal
    // and, being absent from a judgment corpus, distort the distinctiveness stats.
    .filter((t) => t.length > 2 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

/**
 * Builds an FTS5 MATCH expression. Original terms are weighted above expansions
 * so a literal match still outranks a synonym match.
 */
export function buildMatchExpression(query: string): { expr: string; terms: string[] } {
  const terms = tokenize(query);
  if (terms.length === 0) return { expr: '', terms: [] };

  const seen = new Set<string>();
  const parts: string[] = [];

  for (const term of terms) {
    if (!seen.has(term)) {
      seen.add(term);
      parts.push(`"${term}"*`);
    }
    for (const syn of EXPANSIONS[term] ?? []) {
      const s = syn.replace(/[^a-z0-9]/g, '');
      if (s.length > 2 && !seen.has(s)) {
        seen.add(s);
        parts.push(`"${s}"*`);
      }
    }
  }

  return { expr: parts.join(' OR '), terms };
}

/** bm25() returns negative numbers, better being more negative. Normalise to 0..1. */
function normalise(raw: number, best: number): number {
  if (best === 0) return 0;
  return Math.max(0, Math.min(1, raw / best));
}

/**
 * Relevance gating.
 *
 * BM25 ranks within a result set; it says nothing about whether the best hit is
 * any good in absolute terms. Without a floor, a query on a subject the corpus
 * knows nothing about still returns a confident top hit, because normalisation
 * hands the best-of-a-bad-set a score of 1.0. That is the failure mode docs/PRD.md
 * §4.4 commits against, so it is enforced here rather than left to the model.
 *
 * The floor is inverse document frequency, applied to the *distinctive* terms of
 * the query only. Generic legal vocabulary — "possession", "construction",
 * "claim", "compensation" — appears throughout the corpus and matching it proves
 * nothing: a land-acquisition query and a flat-delay query share most of it. The
 * terms that carry a question are the rare ones ("treasury", "unstamped",
 * "allottees", "equivalents"), and a hit qualifies only if it accounts for a
 * meaningful share of *their* IDF mass.
 *
 * Without this, "patent claim construction, doctrine of equivalents" retrieves
 * real-estate judgments on the strength of "claim" and "construction" alone.
 *
 * A hit therefore has to clear two bars, and both are needed:
 *
 *   1. It must match at least one distinctive term. This is what rejects an
 *      out-of-domain query outright — nothing in the corpus shares a rare term
 *      with "doctrine of equivalents", so nothing is returned, and the analyst
 *      reports no authority rather than the best of a bad set.
 *
 *   2. It must account for a minimum share of the query's overall IDF mass, which
 *      filters passages that catch one rare word in passing but are otherwise
 *      about something else.
 *
 * Deliberately not a single proportional threshold on distinctive mass: query
 * length varies by an order of magnitude here — a typed proposition is a sentence,
 * a ground lifted from a filed pleading is a paragraph — and any fixed share is
 * either too strict for the long ones or too loose for the short ones.
 */
const GENERIC_COVERAGE_FLOOR = 0.18;
/**
 * Distinctiveness is relative to the query, not to a fixed corpus threshold: the
 * distinctive terms are the rarer half of whatever terms the query supplies.
 *
 * A fixed threshold does not survive contact with a real corpus this size. Set it
 * where "doctrine of equivalents" is excluded and it also excludes "delay", which
 * drops the governing authority on delayed possession; set it to keep "delay" and
 * a patent query starts matching real-estate judgments on "construction". Ranking
 * the query's own terms sidesteps the choice — every query has a rarer half, and
 * it is the half that carries the question being asked.
 */
const DISTINCTIVE_SHARE_OF_QUERY = 0.5;
/**
 * Subject-coverage guard, applied once per query rather than per hit.
 *
 * If this share or more of the query's distinctive weight sits in terms the index
 * has never seen, the corpus does not cover the subject and the honest answer is
 * nothing at all. "Doctrine of equivalents" fails here because "patent" and
 * "equivalents" are absent outright — which is a stronger and more legible signal
 * than any per-passage score, and it is what stops a stray match on "doctrine"
 * from carrying a patent question into a bench of real-estate judgments.
 *
 * Only applied to short queries. A ground lifted from a filed pleading carries
 * dates, party labels and procedural vocabulary that a corpus of judgments will
 * not contain — "under protest", "antecedent", "thereby" — and reading those as
 * evidence of an uncovered subject discards a ground the corpus answers perfectly
 * well. Above the cut-off the per-passage bars carry the weight instead.
 */
const MAX_ABSENT_DISTINCTIVE_SHARE = 0.5;
const SUBJECT_GUARD_MAX_TERMS = 10;

type TermStats = {
  idf: Map<string, number>;
  distinctive: Set<string>;
  distinctiveMass: number;
  totalMass: number;
  /** True when the index has no material on the subject the query asks about. */
  subjectAbsent: boolean;
};

function termStats(
  db: Database,
  terms: string[],
  table: 'authority_paras_fts' | 'doc_chunks_fts',
): TermStats {
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n || 1;
  const countStmt = db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${table} MATCH ?`);

  const idf = new Map<string, number>();
  const absent = new Set<string>();
  let totalMass = 0;

  for (const t of terms) {
    let df = 0;
    try {
      df = (countStmt.get(`"${t}"*`) as { n: number }).n;
    } catch {
      df = 0;
    }
    if (df === 0) absent.add(t);
    const w = Math.max(Math.log(total / (1 + df)), 0);
    idf.set(t, w);
    totalMass += w;
  }

  // The rarer half of the query's own terms.
  const ranked = [...new Set(terms)].sort((a, b) => (idf.get(b) ?? 0) - (idf.get(a) ?? 0));
  const cut = Math.max(1, Math.ceil(ranked.length * DISTINCTIVE_SHARE_OF_QUERY));
  const distinctive = new Set(ranked.slice(0, cut));
  const distinctiveMass = [...distinctive].reduce((s, t) => s + (idf.get(t) ?? 0), 0);
  const absentMass = [...distinctive]
    .filter((t) => absent.has(t))
    .reduce((s, t) => s + (idf.get(t) ?? 0), 0);

  return {
    idf,
    distinctive,
    distinctiveMass,
    totalMass,
    subjectAbsent:
      ranked.length <= SUBJECT_GUARD_MAX_TERMS &&
      distinctiveMass > 0 &&
      absentMass / distinctiveMass >= MAX_ABSENT_DISTINCTIVE_SHARE,
  };
}

/** Absolute IDF mass of the given terms present in this hit's text. */
function matchedMass(haystack: string, terms: Iterable<string>, stats: TermStats): number {
  const text = haystack.toLowerCase();
  let matched = 0;
  for (const t of terms) {
    const w = Math.max(stats.idf.get(t) ?? 0, 0);
    if (w > 0 && text.includes(t)) matched += w;
  }
  return matched;
}

/** Share of a term set's IDF mass that this hit's text accounts for. */
function coverageOf(
  haystack: string,
  terms: Iterable<string>,
  stats: TermStats,
  mass: number,
): number {
  return mass === 0 ? 0 : matchedMass(haystack, terms, stats) / mass;
}

/**
 * Both bars described above. Where the query has no distinctive terms at all — an
 * unusually generic question — the first bar is vacuous and only coverage applies,
 * so the search still returns something.
 */
function passesGate(haystack: string, terms: string[], stats: TermStats): boolean {
  if (stats.subjectAbsent) return false;
  if (stats.distinctiveMass > 0 && matchedMass(haystack, stats.distinctive, stats) === 0) {
    return false;
  }
  return coverageOf(haystack, terms, stats, stats.totalMass) >= GENERIC_COVERAGE_FLOOR;
}

export function searchAuthorities(
  db: Database,
  query: string,
  limit = 12,
): AuthorityHit[] {
  const { expr, terms } = buildMatchExpression(query);
  if (!expr) return [];

  const rows = db
    .prepare(
      `SELECT p.id       AS paraId,
              p.para_no  AS locator,
              p.body     AS body,
              a.id       AS authorityId,
              a.case_title, a.citation, a.court, a.bench, a.year,
              a.subject_tags, a.holding_summary, a.status, a.status_note,
              a.superseded_by, a.source_url, a.favours, a.counter_point,
              bm25(authority_paras_fts) AS raw
         FROM authority_paras_fts
         JOIN authority_paras p ON p.rowid = authority_paras_fts.rowid
         JOIN authorities a ON a.id = p.authority_id
        WHERE authority_paras_fts MATCH ?
        ORDER BY raw
        LIMIT ?`,
    )
    .all(expr, limit * 3) as any[];

  if (rows.length === 0) return [];

  const supersedeStmt = db.prepare(
    `SELECT id, case_title, citation FROM authorities WHERE id = ?`,
  );

  const stats = termStats(db, terms, 'authority_paras_fts');

  // Tag boost: a hit whose authority is tagged with a query term is more likely
  // to be on point than a passage that merely happens to share vocabulary.
  const scored = rows
    .map((r) => {
      const haystack = `${r.body} ${r.case_title} ${r.holding_summary} ${r.subject_tags}`;
      const tags: string[] = r.subject_tags.split(',');
      const tagMatches = terms.filter((t) =>
        tags.some((tag) => tag.includes(t) || t.includes(tag)),
      ).length;
      return {
        row: r,
        haystack,
        coverage: coverageOf(haystack, terms, stats, stats.totalMass),
        adjusted: r.raw * (1 + 0.18 * tagMatches),
      };
    })
    .filter((s) => passesGate(s.haystack, terms, stats));

  if (scored.length === 0) return [];

  scored.sort((a, b) => a.adjusted - b.adjusted);
  const best = scored[0].adjusted;

  // One passage per authority — the strongest. Counsel wants the case, then the
  // best passage in it, not five near-identical passages from one judgment.
  const seen = new Set<string>();
  const hits: AuthorityHit[] = [];

  for (const { row: r, adjusted, coverage } of scored) {
    if (seen.has(r.authorityId)) continue;
    seen.add(r.authorityId);

    const superseded = r.superseded_by
      ? (supersedeStmt.get(r.superseded_by) as any)
      : null;

    hits.push({
      kind: 'authority',
      authorityId: r.authorityId,
      paraId: r.paraId,
      caseTitle: r.case_title,
      citation: r.citation,
      court: r.court,
      bench: r.bench,
      year: r.year,
      tags: r.subject_tags.split(','),
      holding: r.holding_summary,
      status: r.status,
      statusNote: r.status_note,
      supersededBy: superseded
        ? { id: superseded.id, caseTitle: superseded.case_title, citation: superseded.citation }
        : null,
      sourceUrl: r.source_url,
      favours: r.favours,
      counterPoint: r.counter_point,
      locator: r.locator,
      body: r.body,
      score: normalise(adjusted, best),
      coverage: Number(coverage.toFixed(3)),
    });

    if (hits.length >= limit) break;
  }

  return hits;
}

export function searchDocuments(
  db: Database,
  query: string,
  opts: { limit?: number; matterIds?: string[] | null } = {},
): DocumentHit[] {
  const { expr, terms } = buildMatchExpression(query);
  if (!expr) return [];
  const limit = opts.limit ?? 12;

  let sql = `SELECT c.id AS chunkId, c.page_no, c.para_no, c.heading, c.body,
                    d.id AS documentId, d.title, d.doc_type, d.matter_id,
                    m.title AS matterTitle,
                    bm25(doc_chunks_fts) AS raw
               FROM doc_chunks_fts
               JOIN doc_chunks c ON c.rowid = doc_chunks_fts.rowid
               JOIN documents d ON d.id = c.document_id
               LEFT JOIN matters m ON m.id = d.matter_id
              WHERE doc_chunks_fts MATCH ?`;

  const params: unknown[] = [expr];

  // Matter-scoped access: a panel counsel's search must not reach outside their matters.
  if (opts.matterIds) {
    if (opts.matterIds.length === 0) return [];
    sql += ` AND (d.matter_id IS NULL OR d.matter_id IN (${opts.matterIds.map(() => '?').join(',')}))`;
    params.push(...opts.matterIds);
  }

  sql += ` ORDER BY raw LIMIT ?`;
  params.push(limit * 3);

  const rows = db.prepare(sql).all(...params) as any[];
  if (rows.length === 0) return [];

  const stats = termStats(db, terms, 'doc_chunks_fts');
  const gated = rows.filter((r) =>
    passesGate(`${r.body} ${r.title} ${r.heading ?? ''}`, terms, stats),
  );
  if (gated.length === 0) return [];
  const best = gated[0].raw;

  return gated.slice(0, limit).map((r) => ({
    kind: 'document' as const,
    documentId: r.documentId,
    chunkId: r.chunkId,
    title: r.title,
    docType: r.doc_type,
    matterId: r.matter_id,
    matterTitle: r.matterTitle,
    page: r.page_no,
    locator: r.para_no,
    heading: r.heading,
    body: r.body,
    score: normalise(r.raw, best),
  }));
}

/** Resolve a citation back to its indexed passage. Used by the anti-hallucination test. */
export function resolveParaId(db: Database, paraId: string) {
  return db
    .prepare(
      `SELECT p.id, p.para_no, p.body, a.case_title, a.citation, a.status
         FROM authority_paras p JOIN authorities a ON a.id = p.authority_id
        WHERE p.id = ?`,
    )
    .get(paraId) as
    | { id: string; para_no: string; body: string; case_title: string; citation: string; status: string }
    | undefined;
}
