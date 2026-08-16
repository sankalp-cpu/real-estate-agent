'use client';

import { useState } from 'react';
import type { PropositionAnalysis, PleadingAnalysis, Verdict } from '../../lib/analyst.ts';
import { AuthorityCard } from '../components/AuthorityCard.tsx';
import { GroundingPanel } from '../components/GroundingPanel.tsx';

type Analysis = PropositionAnalysis | PleadingAnalysis;

const VERDICT_STYLE: Record<Verdict['stance'], { chip: string; label: string }> = {
  available: { chip: 'border-emerald-300 bg-emerald-50 text-emerald-900', label: 'Available to M3M' },
  against: { chip: 'border-red-300 bg-red-50 text-red-900', label: 'Runs against M3M' },
  contested: { chip: 'border-amber-300 bg-amber-50 text-amber-900', label: 'Genuinely contested' },
  no_authority: { chip: 'border-ink-300 bg-ink-100 text-ink-800', label: 'No authority found' },
};

export function AnalystClient({
  presets,
  samplePleading,
  matters,
}: {
  presets: string[];
  samplePleading: string;
  matters: Array<{ id: string; title: string; reference: string }>;
}) {
  const [mode, setMode] = useState<'proposition' | 'pleading'>('proposition');
  const [text, setText] = useState('');
  const [matterId, setMatterId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, text, matterId: matterId || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analysis failed.');
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        {/* ---- Input -------------------------------------------------- */}
        <section className="rounded-md border border-ink-200 bg-white">
          <div className="flex border-b border-ink-200">
            {(
              [
                ['proposition', 'Proposition', 'Test a point of law against the authorities'],
                ['pleading', 'Pleading filed against us', 'Extract each ground and counter it'],
              ] as const
            ).map(([key, label, hint]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key);
                  setText('');
                  setResult(null);
                }}
                className={`flex-1 px-4 py-3 text-left transition-colors ${
                  mode === key
                    ? 'border-b-2 border-accent-500 bg-accent-50/40'
                    : 'hover:bg-ink-50'
                }`}
              >
                <span
                  className={`block text-[13px] font-medium ${
                    mode === key ? 'text-ink-900' : 'text-ink-500'
                  }`}
                >
                  {label}
                </span>
                <span className="block text-[11px] text-ink-400">{hint}</span>
              </button>
            ))}
          </div>

          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={mode === 'pleading' ? 10 : 4}
              placeholder={
                mode === 'proposition'
                  ? 'State the proposition. For example: a clause capping delay compensation at Rs 10 per square foot per month limits our liability to the allottee.'
                  : 'Paste the pleading filed against M3M. Each numbered ground will be researched independently.'
              }
              className="w-full resize-y rounded border border-ink-200 bg-ink-50/40 px-3 py-2.5 font-sans text-[13px] leading-relaxed text-ink-800 outline-none placeholder:text-ink-300 focus:border-accent-500 focus:bg-white"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={run}
                disabled={busy || text.trim().length < 12}
                className="rounded bg-accent-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-ink-300"
              >
                {busy ? 'Analysing…' : 'Analyse'}
              </button>

              <select
                value={matterId}
                onChange={(e) => setMatterId(e.target.value)}
                className="rounded border border-ink-200 bg-white px-2.5 py-2 text-[12px] text-ink-700 outline-none focus:border-accent-500"
              >
                <option value="">File to a matter (optional)</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.reference} — {m.title}
                  </option>
                ))}
              </select>

              {mode === 'pleading' && (
                <button
                  onClick={() => setText(samplePleading)}
                  className="rounded border border-ink-200 px-2.5 py-2 text-[12px] text-ink-600 hover:bg-ink-50"
                >
                  Load the NCDRC complaint on file
                </button>
              )}
            </div>

            {mode === 'proposition' && (
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-400">
                  Try one of these
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setText(p)}
                      className="rounded border border-ink-200 bg-ink-50 px-2 py-1 text-left text-[11px] leading-snug text-ink-600 hover:border-accent-500 hover:bg-white hover:text-ink-900"
                    >
                      {p.length > 84 ? p.slice(0, 84) + '…' : p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-[12px] text-red-700">{error}</p>}
          </div>
        </section>

        {/* ---- Result ------------------------------------------------- */}
        {result && (
          <div className="mt-6">
            {result.kind === 'proposition' ? (
              <PropositionResult analysis={result} />
            ) : (
              <PleadingResult analysis={result} />
            )}
          </div>
        )}
      </div>

      <div>
        {result && (
          <GroundingPanel
            authorities={result.retrieval}
            documents={result.kind === 'proposition' ? result.documentHits : []}
            telemetry={result.telemetry}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function VerdictBanner({ verdict }: { verdict: Verdict }) {
  const style = VERDICT_STYLE[verdict.stance];
  return (
    <div className={`rounded-md border px-4 py-3.5 ${style.chip}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider">{style.label}</span>
        <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-medium">
          {verdict.confidence} confidence
        </span>
        {verdict.stance !== 'no_authority' && (
          <span className="ml-auto font-mono text-[10px] opacity-70">
            for {verdict.assistingWeight} · against {verdict.adverseWeight}
          </span>
        )}
      </div>
      <p className="text-[13px] leading-relaxed">{verdict.headline}</p>
    </div>
  );
}

function Narrative({ text }: { text: string }) {
  return (
    <div className="prose-legal mt-4 rounded-md border border-ink-200 bg-white p-5 text-[13px] text-ink-700">
      {text.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        if (t.startsWith('## ')) return <h2 key={i}>{t.slice(3)}</h2>;
        return <p key={i}>{t}</p>;
      })}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[11px] text-ink-400">{subtitle}</p>}
      <div className="mt-2.5 space-y-3">{children}</div>
    </section>
  );
}

function PropositionResult({ analysis }: { analysis: PropositionAnalysis }) {
  return (
    <>
      <VerdictBanner verdict={analysis.verdict} />
      <Narrative text={analysis.narrative} />

      {analysis.currencyWarnings.length > 0 && (
        <Section
          title="Currency check"
          subtitle="Retrieved authority that is no longer good law, or that has been confined."
        >
          {analysis.currencyWarnings.map((w) => (
            <div
              key={w.authorityId}
              className={`rounded-md border px-4 py-3 ${
                w.status === 'overruled'
                  ? 'border-red-300 bg-red-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <p
                className={`text-[13px] font-medium ${
                  w.status === 'overruled' ? 'text-red-900' : 'text-amber-900'
                }`}
              >
                {w.caseTitle}, {w.citation} — {w.status}
              </p>
              <p
                className={`mt-1 text-[12px] leading-relaxed ${
                  w.status === 'overruled' ? 'text-red-800' : 'text-amber-800'
                }`}
              >
                {w.note}
              </p>
            </div>
          ))}
        </Section>
      )}

      {analysis.adverse.length > 0 && (
        <Section title="Against M3M" subtitle="What the other side will cite.">
          {analysis.adverse.map((h) => (
            <AuthorityCard key={h.paraId} hit={h} />
          ))}
        </Section>
      )}

      {analysis.assisting.length > 0 && (
        <Section title="Assisting M3M">
          {analysis.assisting.map((h) => (
            <AuthorityCard key={h.paraId} hit={h} />
          ))}
        </Section>
      )}

      {analysis.balanced.length > 0 && (
        <Section title="Cuts both ways">
          {analysis.balanced.map((h) => (
            <AuthorityCard key={h.paraId} hit={h} />
          ))}
        </Section>
      )}
    </>
  );
}

function PleadingResult({ analysis }: { analysis: PleadingAnalysis }) {
  const [open, setOpen] = useState<number | null>(analysis.grounds[0]?.index ?? null);

  return (
    <>
      <VerdictBanner verdict={analysis.overallVerdict} />

      <Section
        title={`${analysis.grounds.length} grounds asserted`}
        subtitle="Each ground researched independently against the corpus. Open a ground for the counter-argument."
      >
        {analysis.grounds.map((g) => {
          const style = VERDICT_STYLE[g.verdict.stance];
          const isOpen = open === g.index;
          return (
            <div key={g.index} className="overflow-hidden rounded-md border border-ink-200 bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : g.index)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-50"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-ink-100 text-[10px] font-semibold text-ink-600">
                  {g.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-snug text-ink-800">
                    {g.text.length > 190 ? g.text.slice(0, 190) + '…' : g.text}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${style.chip}`}
                >
                  {style.label}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-ink-100 bg-ink-50/40 px-4 py-4">
                  {/* The chip above already states the stance; repeating the full
                      verdict sentence on every ground just adds scrolling. */}
                  <p className="mb-3 font-mono text-[11px] text-ink-400">
                    {g.adverse.length} against · {g.assisting.length} assisting ·{' '}
                    {g.verdict.confidence} confidence
                  </p>

                  {g.counterPoints.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-[10px] uppercase tracking-wider text-ink-400">
                        Counter-argument outline
                      </p>
                      <ol className="space-y-2.5">
                        {g.counterPoints.map((c, i) => (
                          <li key={c.authorityId} className="flex gap-2.5">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[9px] font-semibold text-white">
                              {i + 1}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[12px] font-medium text-ink-800">
                                {c.caseTitle}, {c.citation}
                              </span>
                              <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-600">
                                {c.point}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {g.adverse.length > 0 && (
                    <details className="group">
                      <summary className="cursor-pointer text-[11px] text-accent-600 hover:text-accent-700">
                        Authority behind this ground ({g.adverse.length})
                      </summary>
                      <div className="mt-2.5 space-y-3">
                        {g.adverse.map((h) => (
                          <AuthorityCard key={h.paraId} hit={h} showCounterPoint={false} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Section>

      <Narrative text={analysis.narrative} />
    </>
  );
}
