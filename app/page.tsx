import Link from 'next/link';
import { getDb } from '../lib/db.ts';
import { currentUser, visibleMatterIds } from '../lib/session.ts';

export const dynamic = 'force-dynamic';

const crore = (n: number | null) =>
  n === null ? '—' : `₹${(n / 10000000).toFixed(1)} cr`;

const MATTER_TYPE_LABEL: Record<string, string> = {
  litigation: 'Litigation',
  contract: 'Contract',
  advisory: 'Advisory',
};

export default async function Dashboard() {
  const db = getDb();
  const user = await currentUser();
  const scope = visibleMatterIds(user);

  const where = scope === null ? '' : `WHERE m.id IN (${scope.map(() => '?').join(',') || "''"})`;
  const params = scope ?? [];

  const matters = db
    .prepare(
      `SELECT m.*, u.name AS owner_name, u.initials AS owner_initials,
              (SELECT COUNT(*) FROM documents d WHERE d.matter_id = m.id) AS doc_count
         FROM matters m JOIN users u ON u.id = m.owner_id
         ${where}
        ORDER BY m.next_date IS NULL, m.next_date`,
    )
    .all(...params) as any[];

  const activity = db
    .prepare(
      `SELECT a.*, u.name AS actor_name, u.initials
         FROM activity a JOIN users u ON u.id = a.actor_id
        ORDER BY a.created_at DESC LIMIT 8`,
    )
    .all() as any[];

  const stats = {
    authorities: (db.prepare('SELECT COUNT(*) n FROM authorities').get() as any).n,
    passages: (db.prepare('SELECT COUNT(*) n FROM authority_paras').get() as any).n,
    documents: (db.prepare('SELECT COUNT(*) n FROM documents').get() as any).n,
    docPassages: (db.prepare('SELECT COUNT(*) n FROM doc_chunks').get() as any).n,
    exposure: matters.reduce((s, m) => s + (m.exposure_inr ?? 0), 0),
  };

  const recentAnalyses = db
    .prepare(
      `SELECT a.kind, a.input_text, a.latency_ms, a.model_used, a.created_at, u.name AS actor
         FROM analyses a JOIN users u ON u.id = a.created_by
        ORDER BY a.created_at DESC LIMIT 4`,
    )
    .all() as any[];

  return (
    <>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">
            Good morning, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {matters.length} active {matters.length === 1 ? 'matter' : 'matters'}
            {scope !== null && ' visible to you'} · {crore(stats.exposure)} aggregate exposure
          </p>
        </div>
        <Link
          href="/analyst"
          className="rounded bg-accent-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-700"
        >
          Open Litigation Analyst
        </Link>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Case law indexed"
          value={`${stats.authorities}`}
          hint={`${stats.passages} searchable passages`}
        />
        <StatCard
          label="Matter documents"
          value={`${stats.documents}`}
          hint={`${stats.docPassages} passages, OCR included`}
        />
        <StatCard label="Median analysis time" value="< 1 s" hint="On-premise, Tier 1–2" />
        <StatCard label="Data residency" value="India" hint="Gurugram DC · DPDP compliant" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Matters
          </h2>
          <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left">
                  <Th>Matter</Th>
                  <Th>Forum</Th>
                  <Th className="text-right">Exposure</Th>
                  <Th>Next date</Th>
                  <Th>Owner</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {matters.map((m) => (
                  <tr key={m.id} className="hover:bg-ink-50/60">
                    <td className="px-3 py-3">
                      <Link href={`/matters/${m.id}`} className="group block">
                        <span className="block text-[13px] font-medium leading-snug text-ink-900 group-hover:text-accent-600">
                          {m.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-400">
                          {m.reference} · {MATTER_TYPE_LABEL[m.matter_type]} · {m.doc_count} document
                          {m.doc_count === 1 ? '' : 's'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-ink-600">{m.forum ?? '—'}</td>
                    <td className="px-3 py-3 text-right font-mono text-[12px] text-ink-700">
                      {crore(m.exposure_inr)}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-ink-600">{m.next_date ?? '—'}</td>
                    <td className="px-3 py-3">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-200 text-[10px] font-semibold text-ink-700"
                        title={m.owner_name}
                      >
                        {m.owner_initials}
                      </span>
                    </td>
                  </tr>
                ))}
                {matters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[12px] text-ink-400">
                      No matters are shared with you. Panel counsel see only the matters they are
                      engaged on.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          {recentAnalyses.length > 0 && (
            <div>
              <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                Recent analyses
              </h2>
              <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
                {recentAnalyses.map((a, i) => (
                  <li key={i} className="px-3 py-2.5">
                    <p className="line-clamp-2 text-[12px] leading-snug text-ink-700">
                      {a.input_text.slice(0, 110)}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-ink-400">
                      {a.kind} · {a.latency_ms} ms · {a.actor}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
              Activity
            </h2>
            <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-2.5 px-3 py-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-200 text-[9px] font-semibold text-ink-700">
                    {a.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] leading-snug text-ink-700">
                      <span className="font-medium">{a.actor_name.split(' ')[0]}</span> {a.verb}{' '}
                      {a.entity_label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-ink-400">
                      {new Date(a.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 text-[20px] font-semibold leading-none tracking-tight text-ink-900">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-400">{hint}</p>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-ink-400 ${className}`}
    >
      {children}
    </th>
  );
}
