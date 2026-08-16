import { getDb } from '../../lib/db.ts';
import { allRoutes, ESCALATION } from '../../lib/llm/provider.ts';
import { ROLE_LABEL } from '../../lib/session.ts';

export const dynamic = 'force-dynamic';

const TASK_LABEL: Record<string, string> = {
  draft_generation: 'Document drafting',
  summarisation: 'Summarisation',
  extraction: 'Extraction from filings',
  proposition_analysis: 'Proposition analysis',
  pleading_analysis: 'Pleading analysis',
};

/**
 * The cost comparison. Figures are the ones the client put on the table in the
 * meeting — five frontier seats today, ₹30–50 lakh/month quoted to comparable
 * firms — set against the on-premise model. Labelled as an estimate, because it is.
 */
const SEATS_TODAY = 5;
const FRONTIER_SEAT_MONTHLY = 20000;
const PLATFORM_USERS = 48;
const PLATFORM_MONTHLY_ESTIMATE = 185000;

export default async function AdminPage() {
  const db = getDb();

  const audit = db
    .prepare(
      `SELECT a.*, u.name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 25`,
    )
    .all() as any[];

  const users = db.prepare('SELECT * FROM users ORDER BY role, name').all() as any[];

  const latency = db
    .prepare(
      `SELECT tier, COUNT(*) n, AVG(latency_ms) avg_ms, MAX(latency_ms) max_ms
         FROM audit_log WHERE latency_ms IS NOT NULL GROUP BY tier ORDER BY tier`,
    )
    .all() as any[];

  const todayCost = SEATS_TODAY * FRONTIER_SEAT_MONTHLY;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">Trust & Control</h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-500">
          Where each request runs, on which model, at what cost, and on whose behalf. Nothing about
          the model layer is hidden — routing is configurable, residency is recorded on every
          request, and the audit log is the evidence for a DPDP enquiry.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
          Model routing
        </h2>
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left">
                <Th>Task</Th>
                <Th>Tier</Th>
                <Th>Model</Th>
                <Th>Deployment</Th>
                <Th>Why</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {allRoutes().map(({ task, route }) => (
                <tr key={task}>
                  <td className="px-3 py-3 text-[13px] font-medium text-ink-800">
                    {TASK_LABEL[task] ?? task}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded border border-accent-100 bg-accent-50 px-1.5 py-0.5 text-[10px] font-medium text-accent-700">
                      {route.tier.replace('tier-', 'Tier ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] text-ink-700">{route.model}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-[12px] text-ink-600">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      {route.deployment}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-ink-400">{route.residency}</span>
                  </td>
                  <td className="max-w-md px-3 py-3 text-[12px] leading-relaxed text-ink-500">
                    {route.rationale}
                  </td>
                </tr>
              ))}
              <tr className="bg-amber-50/50">
                <td className="px-3 py-3 text-[13px] font-medium text-ink-800">
                  Escalation
                  <span className="mt-0.5 block text-[10px] font-normal text-ink-400">
                    Triggered automatically
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                    Tier 3
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-[12px] text-ink-700">
                  {ESCALATION.model}
                </td>
                <td className="px-3 py-3">
                  <span className="text-[12px] text-ink-600">{ESCALATION.deployment}</span>
                  <span className="mt-0.5 block text-[10px] text-ink-400">
                    {ESCALATION.residency}
                  </span>
                </td>
                <td className="max-w-md px-3 py-3 text-[12px] leading-relaxed text-ink-500">
                  {ESCALATION.rationale}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Cost
          </h2>
          <div className="rounded-md border border-ink-200 bg-white p-5">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-400">Today</p>
                <p className="mt-1 text-[20px] font-semibold leading-none text-ink-900">
                  ₹{(todayCost / 1000).toFixed(0)}k
                  <span className="text-[12px] font-normal text-ink-400"> /mo</span>
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
                  {SEATS_TODAY} frontier seats shared by rotation across the department. No
                  individual logins, no shared history.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-400">On this platform</p>
                <p className="mt-1 text-[20px] font-semibold leading-none text-ink-900">
                  ₹{(PLATFORM_MONTHLY_ESTIMATE / 100000).toFixed(2)}L
                  <span className="text-[12px] font-normal text-ink-400"> /mo</span>
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-500">
                  {PLATFORM_USERS} named users, on-premise inference, amortised hardware and
                  support.
                </p>
              </div>
            </div>

            <div className="rounded border border-ink-200 bg-ink-50 px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-ink-600">
                Cost per user falls from{' '}
                <strong className="font-semibold text-ink-900">
                  ₹{(todayCost / SEATS_TODAY / 1000).toFixed(1)}k
                </strong>{' '}
                to{' '}
                <strong className="font-semibold text-ink-900">
                  ₹{(PLATFORM_MONTHLY_ESTIMATE / PLATFORM_USERS / 1000).toFixed(1)}k
                </strong>{' '}
                while going from {SEATS_TODAY} seats to {PLATFORM_USERS}. The saving comes from
                routing: volume work never reaches a frontier model.
              </p>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-400">
              Indicative. Firm figures require the pilot benchmark — hardware sizing and the
              routing mix are measured there, not assumed here.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Latency by tier
          </h2>
          <div className="rounded-md border border-ink-200 bg-white p-5">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <Th>Tier</Th>
                  <Th className="text-right">Requests</Th>
                  <Th className="text-right">Mean</Th>
                  <Th className="text-right">Slowest</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {latency.map((l) => (
                  <tr key={l.tier}>
                    <td className="px-3 py-2.5 text-[12px] text-ink-700">
                      {(l.tier ?? 'unrouted').replace('tier-', 'Tier ')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px] text-ink-600">
                      {l.n}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px] text-ink-800">
                      {Math.round(l.avg_ms).toLocaleString('en-IN')} ms
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[12px] text-ink-500">
                      {l.max_ms.toLocaleString('en-IN')} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 border-t border-ink-100 pt-3 text-[11px] leading-relaxed text-ink-500">
              The complaint that prompted this build was 15–20 minute responses. Tier 0 rows are
              retrieval and ingestion; Tier 1–2 are the on-premise models. Nothing here waits on a
              queue in another jurisdiction.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Audit log
          </h2>
          <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50 text-left">
                  <Th>When</Th>
                  <Th>Who</Th>
                  <Th>Action</Th>
                  <Th>Processed in</Th>
                  <Th className="text-right">Latency</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-ink-400">
                      {new Date(a.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-ink-700">{a.name ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className="block font-mono text-[11px] text-ink-700">{a.action}</span>
                      <span className="block max-w-md truncate text-[11px] text-ink-400">
                        {a.resource}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[11px] text-ink-600">
                      {a.data_residency}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px] text-ink-500">
                      {a.latency_ms === null ? '—' : `${a.latency_ms.toLocaleString('en-IN')} ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Seats ({users.length})
          </h2>
          <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-200 text-[10px] font-semibold text-ink-700">
                  {u.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-ink-800">{u.name}</span>
                  <span className="block text-[10px] text-ink-400">
                    {ROLE_LABEL[u.role as keyof typeof ROLE_LABEL]} · {u.office}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            Every person has their own credential. External panel counsel are scoped to the matters
            they are engaged on and reach nothing else.
          </p>
        </aside>
      </div>
    </>
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
