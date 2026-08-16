'use client';

import { useState } from 'react';
import type { AuthorityHit, DocumentHit } from '../../lib/retrieval.ts';
import type { Telemetry } from '../../lib/analyst.ts';

/**
 * The answer to the question the client asked in the meeting: "how would I say
 * that the legal answers given are grounded or not?"
 *
 * It shows the retrieved set, the score for each passage, where each came from,
 * and the routing and residency of the request. Nothing here is generated — it is
 * the evidence the answer was built from, and it is on screen by default rather
 * than behind a disclosure.
 */
export function GroundingPanel({
  authorities,
  documents = [],
  telemetry,
}: {
  authorities: AuthorityHit[];
  documents?: DocumentHit[];
  telemetry: Telemetry;
}) {
  const [tab, setTab] = useState<'passages' | 'documents' | 'trace'>('passages');

  return (
    <aside className="sticky top-6 rounded-md border border-ink-200 bg-white">
      <div className="border-b border-ink-200 px-4 py-3">
        <h3 className="text-[13px] font-semibold text-ink-900">Grounding</h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">
          Every citation above is a reference to one of these passages. Citations are built from
          retrieval, not written by the model.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px border-b border-ink-200 bg-ink-100">
        <Stat label="Total time" value={`${telemetry.totalMs} ms`} />
        <Stat label="Model" value={telemetry.model.replace(/ \(.*\)/, '')} />
        <Stat label="Retrieval" value={`${telemetry.retrievalMs} ms`} />
        <Stat label="Tier" value={telemetry.tier.replace('tier-', 'Tier ')} />
        <Stat label="Corpus searched" value={`${telemetry.passagesSearched} passages`} />
        <Stat label="Residency" value={telemetry.residency} />
      </dl>

      <div className="flex border-b border-ink-200">
        {(
          [
            ['passages', `Passages (${authorities.length})`],
            ['documents', `Matter files (${documents.length})`],
            ['trace', 'Trace'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-2 py-2 text-[11px] transition-colors ${
              tab === key
                ? 'border-b-2 border-accent-500 font-medium text-ink-900'
                : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {tab === 'passages' && (
          <ul className="divide-y divide-ink-100">
            {authorities.map((h) => (
              <li key={h.paraId} className="px-4 py-3">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-ink-300">
                    {(h.score * 100).toFixed(0)}%
                  </span>
                  <span className="flex-1 text-[11px] font-medium leading-snug text-ink-800">
                    {h.caseTitle}
                  </span>
                </div>
                <p className="mb-1 text-[10px] text-ink-400">
                  {h.citation} · {h.locator}
                  {h.status !== 'good_law' && (
                    <span
                      className={`ml-1.5 font-medium ${
                        h.status === 'overruled' ? 'text-red-700' : 'text-amber-700'
                      }`}
                    >
                      {h.status}
                    </span>
                  )}
                </p>
                <p className="passage line-clamp-3 text-[12px] text-ink-500">{h.body}</p>
              </li>
            ))}
            {authorities.length === 0 && <Empty>No passages met the relevance threshold.</Empty>}
          </ul>
        )}

        {tab === 'documents' && (
          <ul className="divide-y divide-ink-100">
            {documents.map((d) => (
              <li key={d.chunkId} className="px-4 py-3">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-ink-300">
                    {(d.score * 100).toFixed(0)}%
                  </span>
                  <span className="flex-1 text-[11px] font-medium leading-snug text-ink-800">
                    {d.title}
                  </span>
                </div>
                <p className="mb-1 text-[10px] text-ink-400">
                  p. {d.page} · {d.locator}
                  {d.matterTitle ? ` · ${d.matterTitle}` : ''}
                </p>
                <p className="passage line-clamp-3 text-[12px] text-ink-500">{d.body}</p>
              </li>
            ))}
            {documents.length === 0 && (
              <Empty>No matter documents matched. The analysis rests on case law alone.</Empty>
            )}
          </ul>
        )}

        {tab === 'trace' && (
          <ol className="divide-y divide-ink-100">
            {telemetry.trace.map((t, i) => (
              <li key={i} className="px-4 py-2.5 font-mono text-[11px] leading-relaxed text-ink-600">
                {t}
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <dt className="text-[9px] uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="mt-0.5 truncate text-[12px] font-medium text-ink-800" title={value}>
        {value}
      </dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <li className="px-4 py-6 text-center text-[12px] text-ink-400">{children}</li>;
}
