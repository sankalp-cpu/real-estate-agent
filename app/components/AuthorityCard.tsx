import type { AuthorityHit } from '../../lib/retrieval.ts';

const STATUS_STYLE = {
  good_law: { chip: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Good law' },
  distinguished: { chip: 'bg-amber-50 text-amber-800 border-amber-300', label: 'Distinguished' },
  overruled: { chip: 'bg-red-50 text-red-800 border-red-300', label: 'Overruled' },
} as const;

const FAVOURS_STYLE = {
  m3m: { chip: 'bg-accent-50 text-accent-700 border-accent-100', label: 'Assists M3M' },
  opponent: { chip: 'bg-ink-100 text-ink-700 border-ink-200', label: 'Against M3M' },
  balanced: { chip: 'bg-ink-50 text-ink-500 border-ink-200', label: 'Cuts both ways' },
} as const;

export function AuthorityCard({
  hit,
  showCounterPoint = true,
}: {
  hit: AuthorityHit;
  showCounterPoint?: boolean;
}) {
  const status = STATUS_STYLE[hit.status];
  const favours = FAVOURS_STYLE[hit.favours];
  const isDead = hit.status === 'overruled';

  return (
    <article
      className={`rounded-md border bg-white ${
        isDead ? 'border-red-300 bg-red-50/30' : 'border-ink-200'
      }`}
    >
      <div className="border-b border-ink-100 px-4 py-3">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${status.chip}`}>
            {status.label}
          </span>
          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${favours.chip}`}>
            {favours.label}
          </span>
          <span className="ml-auto font-mono text-[10px] text-ink-300" title="Retrieval relevance">
            {(hit.score * 100).toFixed(0)}% match
          </span>
        </div>

        <h4
          className={`font-serif text-[15px] leading-snug ${
            isDead ? 'text-red-900 line-through decoration-red-300' : 'text-ink-900'
          }`}
        >
          {hit.caseTitle}
        </h4>
        <p className="mt-0.5 text-[11px] text-ink-400">
          {hit.citation} · {hit.court}
          {hit.bench ? ` · ${hit.bench}` : ''} · {hit.year}
        </p>
      </div>

      {isDead && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2.5">
          <p className="text-[12px] leading-relaxed text-red-900">
            <strong className="font-semibold">Do not rely on this decision.</strong> {hit.statusNote}
          </p>
        </div>
      )}
      {hit.status === 'distinguished' && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
          <p className="text-[12px] leading-relaxed text-amber-900">
            <strong className="font-semibold">Cite with care.</strong> {hit.statusNote}
          </p>
        </div>
      )}

      <div className="px-4 py-3">
        <p className="text-[13px] leading-relaxed text-ink-700">{hit.holding}</p>
      </div>

      <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-3">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">
          Retrieved passage · {hit.locator}
        </p>
        <blockquote className="passage border-l-2 border-ink-300 pl-3 text-[13px] text-ink-700">
          {hit.body}
        </blockquote>
        <a
          href={hit.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-[11px] text-accent-600 underline underline-offset-2 hover:text-accent-700"
        >
          Open full judgment ↗
        </a>
      </div>

      {showCounterPoint && hit.counterPoint && (
        <div className="border-t border-ink-100 px-4 py-3">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">
            How to take the point
            <span className="ml-1.5 normal-case tracking-normal text-ink-300">
              — M3M position, not part of the case record
            </span>
          </p>
          <p className="text-[13px] leading-relaxed text-ink-700">{hit.counterPoint}</p>
        </div>
      )}
    </article>
  );
}

export function SupersededNotice({ hit }: { hit: AuthorityHit }) {
  if (!hit.supersededBy) return null;
  return (
    <p className="mt-1.5 text-[12px] text-red-800">
      Superseded by <span className="font-medium">{hit.supersededBy.caseTitle}</span>,{' '}
      {hit.supersededBy.citation}
    </p>
  );
}
