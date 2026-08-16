import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '../../../lib/db.ts';
import { currentUser, canReachMatter, ROLE_LABEL } from '../../../lib/session.ts';

export const dynamic = 'force-dynamic';

const crore = (n: number | null) => (n === null ? '—' : `₹${(n / 10000000).toFixed(1)} cr`);

export default async function MatterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const user = await currentUser();

  const matter = db.prepare('SELECT * FROM matters WHERE id = ?').get(id) as any;
  if (!matter) notFound();

  // Matter-scoped access is enforced on read, not merely hidden in navigation.
  if (!canReachMatter(user, id)) {
    return (
      <div className="mx-auto max-w-lg rounded-md border border-ink-200 bg-white px-6 py-10 text-center">
        <h1 className="text-[16px] font-semibold text-ink-900">Not available to you</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          You are signed in as {user.name} ({ROLE_LABEL[user.role]}), and this matter has not been
          shared with you. Panel counsel see only the matters they are engaged on.
        </p>
        <Link href="/" className="mt-4 inline-block text-[13px] text-accent-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const owner = db.prepare('SELECT * FROM users WHERE id = ?').get(matter.owner_id) as any;

  const team = db
    .prepare(
      `SELECT u.*, ma.access_level FROM matter_access ma JOIN users u ON u.id = ma.user_id
        WHERE ma.matter_id = ?
        ORDER BY CASE ma.access_level WHEN 'owner' THEN 0 WHEN 'contributor' THEN 1 ELSE 2 END`,
    )
    .all(id) as any[];

  const documents = db
    .prepare('SELECT * FROM documents WHERE matter_id = ? ORDER BY doc_date DESC')
    .all(id) as any[];

  const comments = db
    .prepare(
      `SELECT c.*, u.name, u.initials FROM comments c JOIN users u ON u.id = c.author_id
        WHERE c.entity_type = 'matter' AND c.entity_id = ?
        ORDER BY c.created_at`,
    )
    .all(id) as any[];

  const analyses = db
    .prepare(
      `SELECT a.*, u.name AS actor FROM analyses a JOIN users u ON u.id = a.created_by
        WHERE a.matter_id = ? ORDER BY a.created_at DESC LIMIT 10`,
    )
    .all(id) as any[];

  return (
    <>
      <nav className="mb-3 text-[12px] text-ink-400">
        <Link href="/" className="hover:text-accent-600">
          Dashboard
        </Link>
        <span className="mx-1.5">/</span>
        <span>{matter.reference}</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-ink-900">
          {matter.title}
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-500">
          {matter.forum ?? 'No forum'} · {matter.counterparty ?? 'No counterparty'}
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Exposure" value={crore(matter.exposure_inr)} />
        <Fact label="Next date" value={matter.next_date ?? '—'} />
        <Fact label="Project" value={matter.project ?? '—'} />
        <Fact label="Owner" value={owner.name} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <section className="rounded-md border border-ink-200 bg-white p-5">
            <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
              Summary
            </h2>
            <p className="text-[13px] leading-relaxed text-ink-700">{matter.summary}</p>
          </section>

          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                Documents ({documents.length})
              </h2>
              <Link href="/repository" className="text-[11px] text-accent-600 hover:underline">
                Open repository
              </Link>
            </div>
            <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
              {documents.map((d) => (
                <li key={d.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[9px] uppercase text-ink-500">
                    {d.doc_type}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug text-ink-800">{d.title}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">
                      {d.page_count} pages · {d.ocr_status}
                      {d.ocr_confidence !== null &&
                        ` · OCR ${(d.ocr_confidence * 100).toFixed(0)}%`}
                      {d.doc_date && ` · ${d.doc_date}`}
                    </span>
                  </span>
                  {d.ocr_status === 'needs_review' && (
                    <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-800">
                      Review
                    </span>
                  )}
                </li>
              ))}
              {documents.length === 0 && (
                <li className="px-4 py-6 text-center text-[12px] text-ink-400">
                  No documents filed to this matter.
                </li>
              )}
            </ul>
          </section>

          {analyses.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                Analyses on this matter
              </h2>
              <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
                {analyses.map((a) => (
                  <li key={a.id} className="px-4 py-3">
                    <p className="text-[12px] leading-snug text-ink-700">
                      {a.input_text.slice(0, 200)}
                      {a.input_text.length > 200 && '…'}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-ink-400">
                      {a.kind} · {a.latency_ms} ms · {a.model_used} · {a.actor}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
              Discussion
            </h2>
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3 rounded-md border border-ink-200 bg-white p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-200 text-[10px] font-semibold text-ink-700">
                    {c.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="mb-0.5 block text-[11px] text-ink-400">
                      <span className="font-medium text-ink-700">{c.name}</span> ·{' '}
                      {new Date(c.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="block text-[13px] leading-relaxed text-ink-700">{c.body}</span>
                  </span>
                </li>
              ))}
              {comments.length === 0 && (
                <li className="rounded-md border border-ink-200 bg-white px-4 py-6 text-center text-[12px] text-ink-400">
                  No discussion yet.
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside>
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Team
          </h2>
          <ul className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
            {team.map((t) => (
              <li key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-200 text-[10px] font-semibold text-ink-700">
                  {t.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-ink-800">{t.name}</span>
                  <span className="block text-[10px] text-ink-400">{t.designation}</span>
                </span>
                <span className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[9px] text-ink-500">
                  {t.access_level}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
            Access is per person and per matter. External panel counsel reach this matter and
            nothing else — a confidentiality requirement and a DPDP data-minimisation one.
          </p>
        </aside>
      </div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 text-[13px] font-medium leading-snug text-ink-900">{value}</p>
    </div>
  );
}
