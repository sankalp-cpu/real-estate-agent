import { getDb } from '../../lib/db.ts';
import { currentUser, visibleMatterIds } from '../../lib/session.ts';
import { PLEADING_TEXT } from '../../db/seed/workspace.ts';
import { AnalystClient } from './AnalystClient.tsx';

export const dynamic = 'force-dynamic';

/**
 * Preset propositions spanning the four practice areas in the corpus, chosen so a
 * walkthrough can show each verdict the engine can return — including the two
 * where the top hit is no longer good law.
 */
const PRESETS = [
  'A clause capping delay compensation at Rs 10 per square foot per month limits our liability to the allottee.',
  'A section 7 IBC application by 38 allottees out of 604 in the project is not maintainable for want of the statutory threshold.',
  'A landowner cannot claim the earlier acquisition lapsed where compensation was deposited in the treasury.',
  'An unstamped agreement cannot be referred to arbitration.',
  'The arbitration clause in the buyer agreement bars the consumer complaint.',
  'We may forfeit 20 per cent of the sale consideration as earnest money on cancellation by the allottee.',
  'A shareholder may compel the declaration of dividend in an unlisted company.',
];

export default async function AnalystPage() {
  const db = getDb();
  const user = await currentUser();
  const scope = visibleMatterIds(user);

  const matters = (
    scope === null
      ? db.prepare('SELECT id, title, reference FROM matters ORDER BY reference').all()
      : scope.length === 0
        ? []
        : db
            .prepare(
              `SELECT id, title, reference FROM matters WHERE id IN (${scope
                .map(() => '?')
                .join(',')}) ORDER BY reference`,
            )
            .all(...scope)
  ) as Array<{ id: string; title: string; reference: string }>;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">
          Litigation Analyst
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-500">
          Put a proposition of law and see what the Supreme Court and the High Courts have said —
          what supports it, what cuts against it, and whether the leading case is still good law. Or
          paste the pleading filed against the developer and get each ground researched and answered.
        </p>
      </header>

      <AnalystClient presets={PRESETS} samplePleading={PLEADING_TEXT} matters={matters} />
    </>
  );
}
