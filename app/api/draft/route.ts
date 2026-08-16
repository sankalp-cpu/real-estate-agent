import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDb } from '../../../lib/db.ts';
import {
  getTemplate,
  clausesForSlot,
  slotsIn,
  assemble,
  redline,
  type Clause,
} from '../../../lib/drafting.ts';
import { getProvider, route } from '../../../lib/llm/index.ts';
import { currentUser } from '../../../lib/session.ts';

export async function POST(req: Request) {
  const { templateId, variables, clauseIds } = (await req.json()) as {
    templateId: string;
    variables: Record<string, string>;
    clauseIds: Record<string, string>;
  };

  const db = getDb();
  const template = getTemplate(db, templateId);
  if (!template) return NextResponse.json({ error: 'Unknown template.' }, { status: 404 });

  // Resolve the chosen clause per slot, defaulting to M3M's approved position.
  const choices: Record<string, Clause> = {};
  for (const slot of slotsIn(template.body)) {
    const options = clausesForSlot(db, slot);
    choices[slot] =
      options.find((c) => c.id === clauseIds?.[slot]) ??
      options.find((c) => c.variant === 'standard') ??
      options[0];
  }

  const started = performance.now();
  const draft = assemble(template, variables ?? {}, choices);
  const rows = redline(db, template, choices, variables ?? {});
  const decision = route('draft_generation');

  // Narration is a short covering note, not the document: the document is
  // assembled deterministically so it is identical every time it is produced.
  const generated = await getProvider().generate({
    task: 'draft_generation',
    payload: {
      headline: `${template.name} ${template.version} assembled.`,
      sections: [
        {
          heading: 'Covering note',
          paragraphs: [
            `Assembled from ${template.name} ${template.version} (${template.jurisdiction}).`,
            draft.missingVariables.length
              ? `${draft.missingVariables.length} variables were left blank and appear in the draft in square brackets: ${draft.missingVariables.join(', ')}.`
              : 'All template variables were supplied.',
            rows.some((r) => r.deviates)
              ? `This draft departs from the approved position in ${rows.filter((r) => r.deviates).length} clause${rows.filter((r) => r.deviates).length === 1 ? '' : 's'}. See the redline before circulating.`
              : 'Every clause is M3M\'s approved position. No redline required.',
          ],
        },
        ...(rows.some((r) => r.deviates && r.selected.risk_note)
          ? [
              {
                heading: 'Risk',
                paragraphs: rows
                  .filter((r) => r.deviates && r.selected.risk_note)
                  .map((r) => `${r.selected.title} — ${r.selected.risk_note}`),
              },
            ]
          : []),
      ],
    },
  });

  const user = await currentUser();
  db.prepare(
    `INSERT INTO audit_log (id, user_id, action, resource, model_used, tier, data_residency, latency_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    user.id,
    'draft.generate',
    template.name,
    generated.model,
    generated.tier,
    generated.residency,
    Math.round(performance.now() - started),
    new Date().toISOString(),
  );

  return NextResponse.json({
    body: draft.body,
    missingVariables: draft.missingVariables,
    redline: rows,
    note: generated.text,
    telemetry: {
      model: generated.model,
      tier: generated.tier,
      residency: generated.residency,
      totalMs: Math.round(performance.now() - started),
      costInr: generated.costInr,
      rationale: decision.rationale,
    },
  });
}
