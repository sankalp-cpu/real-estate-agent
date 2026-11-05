import { getDb } from '../../lib/db.ts';
import { listTemplates, clausesForSlot, slotsIn, SLOT_LABEL, type Clause } from '../../lib/drafting.ts';
import { DraftingClient } from './DraftingClient.tsx';

export const dynamic = 'force-dynamic';

export default async function DraftingPage() {
  const db = getDb();
  const templates = listTemplates(db);

  // Clause options per slot, per template — resolved on the server so the client
  // has everything it needs to switch clauses without a round trip.
  const clausesBySlot: Record<string, Record<string, Clause[]>> = {};
  for (const t of templates) {
    clausesBySlot[t.id] = {};
    for (const slot of slotsIn(t.body)) {
      clausesBySlot[t.id][slot] = clausesForSlot(db, slot);
    }
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="page-heading">Draft</h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-500">
          Standard documents assembled from the approved template and the clause library, filled
          from matter variables. Every clause carries a risk level, and any departure from the
          approved position is redlined before the draft leaves the building. Assembly is
          deterministic — the same inputs produce the same document every time.
        </p>
      </header>

      <DraftingClient
        templates={templates}
        clausesBySlot={clausesBySlot}
        slotLabels={SLOT_LABEL}
      />
    </>
  );
}
