import Link from 'next/link';
import { getDb } from '../../lib/db.ts';
import { currentUser, visibleMatterIds } from '../../lib/session.ts';
import { searchDocuments, searchAuthorities } from '../../lib/retrieval.ts';

export const dynamic = 'force-dynamic';

/** The OCR pipeline, in order. Every ingested document sits at one of these stages. */
const PIPELINE = ['received', 'scanning', 'digitizing', 'indexing', 'indexed'] as const;

const SOURCE_LABEL: Record<string, string> = {
  upload: 'Uploaded',
  scan: 'Physical scan',
  erp: 'ERP connector',
  email: 'Email',
};

export default async function RepositoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q = '', type = '' } = await searchParams;
  const db = getDb();
  const user = await currentUser();
  const scope = visibleMatterIds(user);

  const docResults = q ? searchDocuments(db, q, { limit: 20, matterIds: scope }) : [];
  const authResults = q ? searchAuthorities(db, q, 5) : [];

  const scopeSql =
    scope === null
      ? ''
      : `AND (d.matter_id IS NULL OR d.matter_id IN (${scope.map(() => '?').join(',') || "''"}))`;

  const documents = db
    .prepare(
      `SELECT d.*, m.title AS matter_title, m.reference AS matter_ref, u.initials
         FROM documents d
         LEFT JOIN matters m ON m.id = d.matter_id
         JOIN users u ON u.id = d.uploaded_by
        WHERE (? = '' OR d.doc_type = ?) ${scopeSql}
        ORDER BY d.created_at DESC`,
    )
    .all(type, type, ...(scope ?? [])) as any[];

  const docTypes = db
    .prepare('SELECT doc_type, COUNT(*) n FROM documents GROUP BY doc_type ORDER BY n DESC')
    .all() as Array<{ doc_type: string; n: number }>;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">Repository</h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-500">
          Every contract, pleading, order and notice in one searchable store. Physical scans pass
          through OCR and become full text. Search runs over the corpus and the case law at once,
          scoped to what you are entitled to see.
        </p>
      </header>

      <form method="get" className="mb-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search across every document and judgment — try: unilateral appointment of arbitrator"
          className="min-w-[320px] flex-1 rounded border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-800 outline-none placeholder:text-ink-300 focus:border-accent-500"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded border border-ink-200 bg-white px-2.5 py-2 text-[12px] text-ink-700 outline-none focus:border-accent-500"
        >
          <option value="">All document types</option>
          {docTypes.map((t) => (
            <option key={t.doc_type} value={t.doc_type}>
              {t.doc_type} ({t.n})
            </option>
          ))}
        </select>
        <button className="rounded bg-accent-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-700">
          Search
        </button>
        {q && (
          <Link
            href="/repository"
            className="rounded border border-ink-200 px-3 py-2 text-[12px] text-ink-600 hover:bg-ink-50"
          >
            Clear
          </Link>
        )}
      </form>

      {q && (
        <section className="mb-8">
          <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            {docResults.length + authResults.length} results for “{q}”
          </h2>

          {docResults.length === 0 && authResults.length === 0 && (
            <p className="rounded-md border border-ink-200 bg-white px-4 py-6 text-center text-[13px] text-ink-400">
              Nothing in the repository or the indexed case law matches that. The search reports an
              empty result rather than approximating one.
            </p>
          )}

          <div className="space-y-2.5">
            {docResults.map((r) => (
              <article key={r.chunkId} className="rounded-md border border-ink-200 bg-white p-4">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-ink-300">
                    {(r.score * 100).toFixed(0)}%
                  </span>
                  <h3 className="flex-1 text-[13px] font-medium text-ink-900">{r.title}</h3>
                  <span className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-500">
                    {r.docType}
                  </span>
                </div>
                <p className="mb-2 text-[11px] text-ink-400">
                  p. {r.page} · {r.locator}
                  {r.matterTitle && (
                    <>
                      {' · '}
                      <Link href={`/matters/${r.matterId}`} className="text-accent-600 underline">
                        {r.matterTitle}
                      </Link>
                    </>
                  )}
                </p>
                <p className="passage border-l-2 border-ink-200 pl-3 text-[13px] leading-relaxed text-ink-600">
                  {r.body}
                </p>
              </article>
            ))}

            {authResults.map((r) => (
              <article
                key={r.paraId}
                className={`rounded-md border p-4 ${
                  r.status === 'overruled' ? 'border-red-300 bg-red-50/40' : 'border-ink-200 bg-white'
                }`}
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-ink-300">
                    {(r.score * 100).toFixed(0)}%
                  </span>
                  <h3 className="flex-1 font-serif text-[14px] text-ink-900">{r.caseTitle}</h3>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                      r.status === 'overruled'
                        ? 'border-red-300 bg-red-50 text-red-800'
                        : r.status === 'distinguished'
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {r.status === 'good_law' ? 'Good law' : r.status}
                  </span>
                </div>
                <p className="mb-2 text-[11px] text-ink-400">
                  {r.citation} · {r.court} · {r.locator}
                </p>
                <p className="passage border-l-2 border-ink-200 pl-3 text-[13px] leading-relaxed text-ink-600">
                  {r.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
          {documents.length} documents · ingestion pipeline
        </h2>
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-left">
                <Th>Document</Th>
                <Th>Matter</Th>
                <Th>Source</Th>
                <Th>Pipeline</Th>
                <Th className="text-right">Pages</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-ink-50/60">
                  <td className="px-3 py-3">
                    <span className="block text-[13px] font-medium leading-snug text-ink-900">
                      {d.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-400">
                      {d.doc_type}
                      {d.doc_date ? ` · ${d.doc_date}` : ''}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-ink-600">
                    {d.matter_ref ? (
                      <Link href={`/matters/${d.matter_id}`} className="hover:text-accent-600">
                        {d.matter_ref}
                      </Link>
                    ) : (
                      <span className="text-ink-400">Firm-wide</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[12px] text-ink-600">
                    {SOURCE_LABEL[d.source] ?? d.source}
                  </td>
                  <td className="px-3 py-3">
                    <Pipeline status={d.ocr_status} confidence={d.ocr_confidence} />
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[12px] text-ink-600">
                    {d.page_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Pipeline({ status, confidence }: { status: string; confidence: number | null }) {
  if (status === 'needs_review') {
    return (
      <div>
        <span className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
          Needs review
        </span>
        <p className="mt-1 text-[10px] text-amber-700">
          OCR confidence {((confidence ?? 0) * 100).toFixed(0)}% — held back from the index
        </p>
      </div>
    );
  }

  const reached = PIPELINE.indexOf(status as (typeof PIPELINE)[number]);
  return (
    <div>
      <div className="flex items-center gap-1">
        {PIPELINE.map((stage, i) => (
          <span
            key={stage}
            title={stage}
            className={`h-1.5 w-6 rounded-full ${i <= reached ? 'bg-emerald-600' : 'bg-ink-200'}`}
          />
        ))}
      </div>
      <p className="mt-1 text-[10px] text-ink-400">
        {status === 'indexed' ? 'Indexed' : status}
        {confidence !== null && ` · OCR ${(confidence * 100).toFixed(0)}%`}
      </p>
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
