import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDb } from '../../../lib/db.ts';
import { analyseProposition, analysePleading } from '../../../lib/analyst.ts';
import { currentUser, visibleMatterIds, canReachMatter } from '../../../lib/session.ts';

export async function POST(req: Request) {
  const { mode, text, matterId } = (await req.json()) as {
    mode: 'proposition' | 'pleading';
    text: string;
    matterId?: string | null;
  };

  if (typeof text !== 'string' || text.trim().length < 12 || text.length > 100000) {
    return NextResponse.json(
      { error: 'Enter a proposition or paste a pleading to analyse.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const user = await currentUser();
  if (matterId && !canReachMatter(user, matterId)) {
    return NextResponse.json({ error: 'This matter is not accessible.' }, { status: 403 });
  }
  if (matterId && !db.prepare('SELECT id FROM matters WHERE id=?').get(matterId)) {
    return NextResponse.json({ error: 'Unknown matter.' }, { status: 404 });
  }
  const scope = visibleMatterIds(user);

  const analysis =
    mode === 'pleading'
      ? await analysePleading(db, text, { matterIds: scope })
      : await analyseProposition(db, text, { matterIds: scope });

  // Persist for the matter timeline, and record the request in the DPDP audit log.
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO analyses (id, matter_id, kind, input_text, result_json, model_used, tier,
                           latency_ms, cost_inr, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    matterId ?? null,
    analysis.kind,
    text,
    JSON.stringify(analysis),
    analysis.telemetry.model,
    analysis.telemetry.tier,
    analysis.telemetry.totalMs,
    analysis.telemetry.costInr,
    user.id,
    now,
  );

  db.prepare(
    `INSERT INTO audit_log (id, user_id, action, resource, model_used, tier, data_residency, latency_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    randomUUID(),
    user.id,
    `analysis.${analysis.kind}`,
    text.slice(0, 120),
    analysis.telemetry.model,
    analysis.telemetry.tier,
    analysis.telemetry.residency,
    analysis.telemetry.totalMs,
    now,
  );

  return NextResponse.json(analysis);
}
