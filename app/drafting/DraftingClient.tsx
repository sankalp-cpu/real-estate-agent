'use client';

import { useState } from 'react';
import type { Template, Clause, RedlineRow } from '../../lib/drafting.ts';

const RISK_STYLE = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  medium: 'border-amber-300 bg-amber-50 text-amber-800',
  high: 'border-red-300 bg-red-50 text-red-800',
} as const;

const VARIANT_LABEL = {
  standard: 'Approved position',
  alternative: 'Alternative',
  counterparty_favourable: 'Counterparty-favourable',
} as const;

type Result = {
  body: string;
  missingVariables: string[];
  redline: RedlineRow[];
  note: string;
  telemetry: { model: string; tier: string; residency: string; totalMs: number; rationale: string };
};

export function DraftingClient({
  templates,
  clausesBySlot,
  slotLabels,
}: {
  templates: Template[];
  clausesBySlot: Record<string, Record<string, Clause[]>>;
  slotLabels: Record<string, string>;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const template = templates.find((t) => t.id === templateId)!;
  const slots = clausesBySlot[templateId] ?? {};

  const [variables, setVariables] = useState<Record<string, string>>({});
  const [clauseIds, setClauseIds] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  function selectTemplate(id: string) {
    setTemplateId(id);
    setVariables({});
    setClauseIds({});
    setResult(null);
  }

  function prefill() {
    const next: Record<string, string> = {};
    for (const v of template.variables) next[v.key] = v.example;
    setVariables(next);
  }

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ templateId, variables, clauseIds }),
      });
      setResult(await res.json());
    } finally {
      setBusy(false);
    }
  }

  const chosen = (slot: string) =>
    clauseIds[slot] ?? slots[slot]?.find((c) => c.variant === 'standard')?.id ?? slots[slot]?.[0]?.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* ---- Configure ---------------------------------------------- */}
      <div className="space-y-4">
        <section className="rounded-md border border-ink-200 bg-white">
          <h2 className="border-b border-ink-200 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Template
          </h2>
          <div className="p-3">
            <select
              value={templateId}
              onChange={(e) => selectTemplate(e.target.value)}
              className="w-full rounded border border-ink-200 bg-white px-2.5 py-2 text-[13px] text-ink-800 outline-none focus:border-accent-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.version}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-500">{template.description}</p>
            <p className="mt-1.5 text-[10px] text-ink-400">
              {template.jurisdiction} · used {template.usage_count} times
            </p>
          </div>
        </section>

        <section className="rounded-md border border-ink-200 bg-white">
          <div className="flex items-center justify-between border-b border-ink-200 px-4 py-2.5">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
              Matter variables
            </h2>
            <button
              onClick={prefill}
              className="text-[11px] text-accent-600 hover:text-accent-700 hover:underline"
            >
              Fill from example
            </button>
          </div>
          <div className="space-y-2 p-3">
            {template.variables.map((v) => (
              <label key={v.key} className="block">
                <span className="mb-0.5 block text-[11px] text-ink-500">{v.label}</span>
                <input
                  value={variables[v.key] ?? ''}
                  onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                  placeholder={v.example}
                  className="w-full rounded border border-ink-200 bg-ink-50/40 px-2 py-1.5 text-[12px] text-ink-800 outline-none placeholder:text-ink-300 focus:border-accent-500 focus:bg-white"
                />
              </label>
            ))}
          </div>
        </section>

        <button
          onClick={generate}
          disabled={busy}
          className="w-full rounded bg-accent-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-accent-700 disabled:bg-ink-300"
        >
          {busy ? 'Assembling…' : 'Assemble draft'}
        </button>
      </div>

      {/* ---- Clauses and output -------------------------------------- */}
      <div className="min-w-0 space-y-5">
        <section>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Clause library
          </h2>
          <div className="space-y-3">
            {Object.entries(slots).map(([slot, options]) => (
              <div key={slot} className="rounded-md border border-ink-200 bg-white">
                <h3 className="border-b border-ink-100 px-4 py-2 text-[12px] font-medium text-ink-700">
                  {slotLabels[slot] ?? slot}
                </h3>
                <div className="divide-y divide-ink-100">
                  {options.map((c) => {
                    const selected = chosen(slot) === c.id;
                    return (
                      <label
                        key={c.id}
                        className={`flex cursor-pointer gap-3 px-4 py-3 ${
                          selected ? 'bg-accent-50/50' : 'hover:bg-ink-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={slot}
                          checked={selected}
                          onChange={() => setClauseIds({ ...clauseIds, [slot]: c.id })}
                          className="mt-1 accent-[#255a75]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[12px] font-medium text-ink-800">{c.title}</span>
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[9px] font-medium ${
                                RISK_STYLE[c.risk_level]
                              }`}
                            >
                              {c.risk_level} risk
                            </span>
                            <span className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[9px] text-ink-500">
                              {VARIANT_LABEL[c.variant]}
                            </span>
                          </span>
                          <span className="passage line-clamp-2 block text-[12px] leading-relaxed text-ink-500">
                            {c.body}
                          </span>
                          {c.risk_note && (
                            <span
                              className={`mt-1.5 block text-[11px] leading-relaxed ${
                                c.risk_level === 'high' ? 'text-red-700' : 'text-ink-500'
                              }`}
                            >
                              {c.risk_note}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {result && (
          <>
            {result.redline.some((r) => r.deviates) && (
              <section>
                <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                  Redline against the approved position
                </h2>
                <div className="space-y-2.5">
                  {result.redline
                    .filter((r) => r.deviates)
                    .map((r) => (
                      <div key={r.slot} className="rounded-md border border-amber-300 bg-amber-50 p-4">
                        <p className="mb-2 text-[12px] font-medium text-amber-900">
                          {slotLabels[r.slot] ?? r.slot} — departs from the approved position
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">
                              Approved
                            </p>
                            <p className="passage text-[12px] leading-relaxed text-ink-600 line-through decoration-ink-300">
                              {r.standard?.body.slice(0, 240)}…
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">
                              This draft
                            </p>
                            <p className="passage text-[12px] leading-relaxed text-ink-800">
                              {r.selected.body.slice(0, 240)}…
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-2.5 flex items-baseline justify-between">
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                  Draft
                </h2>
                <span className="font-mono text-[10px] text-ink-400">
                  {result.telemetry.totalMs} ms · {result.telemetry.model} ·{' '}
                  {result.telemetry.residency}
                </span>
              </div>

              <div className="mb-3 rounded-md border border-ink-200 bg-white p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-400">
                  Covering note
                </p>
                {result.note
                  .split('\n')
                  .filter((l) => l.trim() && !l.startsWith('## '))
                  .map((l, i) => (
                    <p key={i} className="mb-1 text-[12px] leading-relaxed text-ink-600">
                      {l}
                    </p>
                  ))}
                <p className="mt-2 border-t border-ink-100 pt-2 text-[11px] leading-relaxed text-ink-400">
                  Routed to {result.telemetry.tier.replace('tier-', 'Tier ')}:{' '}
                  {result.telemetry.rationale}
                </p>
              </div>

              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-ink-200 bg-white p-5 font-serif text-[13px] leading-relaxed text-ink-800">
                {result.body}
              </pre>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
