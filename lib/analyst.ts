/**
 * The Litigation Analyst.
 *
 * The shape of every answer — which authorities appear, what they say, what is
 * cited — is decided here, from retrieval. The model narrates the result; it does
 * not choose it. That separation is what makes the grounding claim in docs/PRD.md §4
 * a property of the system rather than a promise about the model.
 */

import type { Database } from 'better-sqlite3';
import {
  searchAuthorities,
  searchDocuments,
  type AuthorityHit,
  type DocumentHit,
} from './retrieval.ts';
import { getProvider, type GenerateResult, type NarrationPayload } from './llm/index.ts';

export type Citation = AuthorityHit;

export type Verdict = {
  stance: 'available' | 'against' | 'contested' | 'no_authority';
  headline: string;
  confidence: 'high' | 'moderate' | 'low';
  assistingWeight: number;
  adverseWeight: number;
};

export type CurrencyWarning = {
  authorityId: string;
  caseTitle: string;
  citation: string;
  status: 'overruled' | 'distinguished';
  note: string;
  supersededBy: { id: string; caseTitle: string; citation: string } | null;
};

export type Telemetry = {
  model: string;
  tier: string;
  deployment: string;
  residency: string;
  retrievalMs: number;
  generationMs: number;
  totalMs: number;
  costInr: number;
  passagesSearched: number;
  passagesRetrieved: number;
  trace: string[];
};

export type PropositionAnalysis = {
  kind: 'proposition';
  input: string;
  verdict: Verdict;
  assisting: Citation[];
  adverse: Citation[];
  balanced: Citation[];
  currencyWarnings: CurrencyWarning[];
  narrative: string;
  documentHits: DocumentHit[];
  retrieval: Citation[];
  telemetry: Telemetry;
};

export type GroundFinding = {
  index: number;
  label: string;
  text: string;
  verdict: Verdict;
  assisting: Citation[];
  adverse: Citation[];
  currencyWarnings: CurrencyWarning[];
  /** Ordered counter-argument points, each tied to an authority in the corpus. */
  counterPoints: Array<{ authorityId: string; caseTitle: string; citation: string; point: string }>;
};

export type PleadingAnalysis = {
  kind: 'pleading';
  input: string;
  grounds: GroundFinding[];
  overallVerdict: Verdict;
  narrative: string;
  retrieval: Citation[];
  telemetry: Telemetry;
};

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

/** Overruled authority carries no weight in the verdict; it survives only as a warning. */
function weightOf(hit: Citation): number {
  if (hit.status === 'overruled') return 0;
  const currency = hit.status === 'distinguished' ? 0.4 : 1;
  const apex = hit.court.startsWith('Supreme Court') ? 1 : 0.75;
  return hit.score * currency * apex;
}

function buildVerdict(hits: Citation[]): Verdict {
  const live = hits.filter((h) => h.status !== 'overruled');
  if (live.length === 0) {
    return {
      stance: 'no_authority',
      headline:
        'No authority on this point was found in the indexed corpus. Treat the question as open and research it outside the system before relying on it.',
      confidence: 'low',
      assistingWeight: 0,
      adverseWeight: 0,
    };
  }

  const assisting = live.filter((h) => h.favours === 'm3m').reduce((s, h) => s + weightOf(h), 0);
  const adverse = live.filter((h) => h.favours === 'opponent').reduce((s, h) => s + weightOf(h), 0);
  const total = assisting + adverse;

  const round = (n: number) => Number(n.toFixed(2));

  if (total < 0.25) {
    return {
      stance: 'contested',
      headline:
        'The authority retrieved bears on the question but does not resolve it in either direction. The point turns on the facts and on how the claim is framed.',
      confidence: 'low',
      assistingWeight: round(assisting),
      adverseWeight: round(adverse),
    };
  }

  const share = assisting / total;
  const strong = live.some((h) => h.score > 0.7);

  if (share >= 0.65) {
    return {
      stance: 'available',
      headline:
        'The weight of retrieved authority supports this position. It is available to M3M, subject to the qualifications noted below.',
      confidence: strong ? 'high' : 'moderate',
      assistingWeight: round(assisting),
      adverseWeight: round(adverse),
    };
  }
  if (share <= 0.35) {
    return {
      stance: 'against',
      headline:
        'The weight of retrieved authority runs against this position. Contesting it on principle is unlikely to succeed; the arguable ground is quantum, characterisation or maintainability.',
      confidence: strong ? 'high' : 'moderate',
      assistingWeight: round(assisting),
      adverseWeight: round(adverse),
    };
  }
  return {
    stance: 'contested',
    headline:
      'The retrieved authority cuts both ways. The outcome will turn on which characterisation of the facts the tribunal accepts.',
    confidence: 'moderate',
    assistingWeight: round(assisting),
    adverseWeight: round(adverse),
  };
}

function currencyWarnings(hits: Citation[]): CurrencyWarning[] {
  return hits
    .filter((h) => h.status !== 'good_law')
    .map((h) => ({
      authorityId: h.authorityId,
      caseTitle: h.caseTitle,
      citation: h.citation,
      status: h.status as 'overruled' | 'distinguished',
      note: h.statusNote ?? '',
      supersededBy: h.supersededBy,
    }));
}

const corpusSize = (db: Database) =>
  (db.prepare('SELECT COUNT(*) AS n FROM authority_paras').get() as { n: number }).n;

// ---------------------------------------------------------------------------
// Proposition analysis
// ---------------------------------------------------------------------------

export async function analyseProposition(
  db: Database,
  proposition: string,
  opts: { matterIds?: string[] | null } = {},
): Promise<PropositionAnalysis> {
  const t0 = performance.now();
  const hits = searchAuthorities(db, proposition, 10);
  const documentHits = searchDocuments(db, proposition, { limit: 5, matterIds: opts.matterIds ?? null });
  const retrievalMs = Math.round(performance.now() - t0);

  const verdict = buildVerdict(hits);
  const assisting = hits.filter((h) => h.favours === 'm3m' && h.status !== 'overruled');
  const adverse = hits.filter((h) => h.favours === 'opponent' && h.status !== 'overruled');
  const balanced = hits.filter((h) => h.favours === 'balanced' && h.status !== 'overruled');
  const warnings = currencyWarnings(hits);

  // The narrative is a counsel's note, and the authority cards beside it are the
  // evidence. Anything enumerated on a card is deliberately not restated here —
  // a note that repeats its own exhibits is one nobody reads twice.
  const cite = (h: Citation) => `${h.caseTitle}, ${h.citation}`;

  const payload: NarrationPayload = {
    headline: verdict.headline,
    escalate: verdict.stance === 'no_authority',
    sections: [
      {
        heading: 'Note',
        paragraphs: [
          verdict.stance === 'no_authority'
            ? `The proposition put was: ${proposition} Nothing in the indexed corpus bears on it.`
            : `The proposition put was: ${proposition}`,
          ...(adverse.length
            ? [
                `Against the proposition, the governing authority is ${cite(adverse[0])}` +
                  (adverse.length > 1
                    ? `, with ${adverse.length - 1} further ${
                        adverse.length === 2 ? 'decision' : 'decisions'
                      } to the same effect.`
                    : '.'),
              ]
            : []),
          ...(assisting.length
            ? [
                `In support, ${cite(assisting[0])}` +
                  (assisting.length > 1
                    ? ` and ${assisting.length - 1} further ${
                        assisting.length === 2 ? 'decision' : 'decisions'
                      }.`
                    : '.'),
              ]
            : []),
          ...(balanced.length
            ? [
                `${cite(balanced[0])}${
                  balanced.length > 1 ? ` and ${balanced.length - 1} others` : ''
                } cut both ways, depending on how the claim is characterised.`,
              ]
            : []),
          `Searched ${corpusSize(db)} indexed passages; ${hits.length} met the relevance threshold.`,
        ],
      },
      ...(warnings.length
        ? [
            {
              heading: 'Currency',
              paragraphs: warnings.map(
                (w) =>
                  `${w.caseTitle}, ${w.citation} is ${w.status}. ${w.note}` +
                  (w.supersededBy
                    ? ` See ${w.supersededBy.caseTitle}, ${w.supersededBy.citation}.`
                    : ''),
              ),
            },
          ]
        : []),
      ...(hits.some((h) => h.counterPoint && h.status !== 'overruled')
        ? [
            {
              heading: 'Recommended approach',
              paragraphs: [...adverse, ...assisting, ...balanced]
                .filter((h) => h.counterPoint)
                .slice(0, 3)
                .map((h) => `On ${h.caseTitle} — ${h.counterPoint}`),
            },
          ]
        : []),
    ],
  };

  const generated = await getProvider().generate({ task: 'proposition_analysis', payload });

  return {
    kind: 'proposition',
    input: proposition,
    verdict,
    assisting,
    adverse,
    balanced,
    currencyWarnings: warnings,
    narrative: generated.text,
    documentHits,
    retrieval: hits,
    telemetry: telemetryFrom(generated, retrievalMs, corpusSize(db), hits.length),
  };
}

// ---------------------------------------------------------------------------
// Pleading analysis
// ---------------------------------------------------------------------------

/**
 * Splits a filed pleading into the discrete points of law it asserts.
 * Numbered paragraphs are the convention in Indian pleadings; anything that is
 * not a numbered ground (cause title, prayer, verification) is discarded.
 */
export function extractGrounds(text: string): Array<{ index: number; label: string; text: string }> {
  const lines = text.split('\n');
  const grounds: Array<{ index: number; label: string; text: string }> = [];
  let current: { index: number; label: string; text: string } | null = null;
  let inPrayer = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (/^(PRAYER|VERIFICATION|AFFIDAVIT)\b/i.test(line)) {
      inPrayer = true;
      if (current) grounds.push(current);
      current = null;
      continue;
    }
    if (inPrayer) continue;

    const m = line.match(/^(\d+)\.\s+(.*)$/);
    if (m) {
      if (current) grounds.push(current);
      current = { index: Number(m[1]), label: `Ground ${m[1]}`, text: m[2] };
    } else if (current && line.length > 0) {
      current.text += ' ' + line;
    }
  }
  if (current) grounds.push(current);

  // A ground has to be substantial enough to research. Cause-title fragments are not.
  return grounds.filter((g) => g.text.length > 80);
}

export async function analysePleading(
  db: Database,
  pleadingText: string,
  opts: { matterIds?: string[] | null } = {},
): Promise<PleadingAnalysis> {
  const t0 = performance.now();
  const grounds = extractGrounds(pleadingText);

  const findings: GroundFinding[] = grounds.map((g) => {
    const hits = searchAuthorities(db, g.text, 8);
    const verdict = buildVerdict(hits);
    const assisting = hits.filter((h) => h.favours === 'm3m' && h.status !== 'overruled');
    const adverse = hits.filter((h) => h.favours === 'opponent' && h.status !== 'overruled');

    // The counter-argument. Ordered so that the points answering the strongest
    // adverse authority come first — that is the order counsel has to plead in.
    const counterPoints = [...adverse, ...hits.filter((h) => h.favours !== 'opponent')]
      .filter((h) => h.counterPoint && h.status !== 'overruled')
      .slice(0, 4)
      .map((h) => ({
        authorityId: h.authorityId,
        caseTitle: h.caseTitle,
        citation: h.citation,
        point: h.counterPoint as string,
      }));

    return {
      index: g.index,
      label: g.label,
      text: g.text,
      verdict,
      assisting,
      adverse,
      currencyWarnings: currencyWarnings(hits),
      counterPoints,
    };
  });

  const retrievalMs = Math.round(performance.now() - t0);
  const allHits = findings.flatMap((f) => [...f.assisting, ...f.adverse]);
  const overallVerdict = buildVerdict(allHits);

  const payload: NarrationPayload = {
    headline: `Analysis of ${findings.length} grounds asserted in the pleading filed against M3M.`,
    sections: [
      {
        heading: 'Summary',
        paragraphs: [
          overallVerdict.headline,
          `Grounds on which the authority runs against M3M: ${
            findings.filter((f) => f.verdict.stance === 'against').map((f) => f.label).join(', ') || 'none'
          }.`,
          `Grounds on which M3M has authority to rely: ${
            findings.filter((f) => f.verdict.stance === 'available').map((f) => f.label).join(', ') || 'none'
          }.`,
          `Grounds genuinely contested: ${
            findings.filter((f) => f.verdict.stance === 'contested').map((f) => f.label).join(', ') || 'none'
          }.`,
        ],
      },
      ...findings.map((f) => ({
        heading: `${f.label} — ${f.verdict.stance.replace('_', ' ')}`,
        paragraphs: [
          f.text.length > 400 ? f.text.slice(0, 400) + '…' : f.text,
          f.verdict.headline,
          ...f.counterPoints.map((c) => `Answer — ${c.caseTitle}, ${c.citation}: ${c.point}`),
        ],
      })),
    ],
  };

  const generated = await getProvider().generate({ task: 'pleading_analysis', payload });

  return {
    kind: 'pleading',
    input: pleadingText,
    grounds: findings,
    overallVerdict,
    narrative: generated.text,
    retrieval: allHits,
    telemetry: telemetryFrom(generated, retrievalMs, corpusSize(db), allHits.length),
  };
}

function telemetryFrom(
  g: GenerateResult,
  retrievalMs: number,
  passagesSearched: number,
  passagesRetrieved: number,
): Telemetry {
  return {
    model: g.model,
    tier: g.tier,
    deployment: g.deployment,
    residency: g.residency,
    retrievalMs,
    generationMs: g.latencyMs,
    totalMs: retrievalMs + g.latencyMs,
    costInr: g.costInr,
    passagesSearched,
    passagesRetrieved,
    trace: [`retrieval: BM25 over ${passagesSearched} indexed passages in ${retrievalMs}ms`, ...g.trace],
  };
}

/**
 * Every citation the system emits must resolve to a real indexed passage.
 * Exercised by tests/analyst.test.ts — the anti-hallucination guarantee.
 */
export function citationIdsIn(analysis: PropositionAnalysis | PleadingAnalysis): string[] {
  if (analysis.kind === 'proposition') {
    return [...analysis.assisting, ...analysis.adverse, ...analysis.balanced].map((c) => c.paraId);
  }
  return analysis.grounds.flatMap((g) => [...g.assisting, ...g.adverse].map((c) => c.paraId));
}
