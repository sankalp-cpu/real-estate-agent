/**
 * Builds db/m3m.sqlite from scratch. Idempotent: drops and rebuilds.
 *
 *   npm run seed
 */

import path from 'node:path';
import { createDb, DB_PATH } from '../../lib/db.ts';
import { AUTHORITIES, sourceUrlFor } from './authorities.ts';
import { STANCES } from './stances.ts';
import { USERS, MATTERS, DOCUMENTS } from './workspace.ts';
import { TEMPLATES, CLAUSES } from './templates.ts';

const now = '2026-08-16T06:00:00Z';

function seed(targetPath: string) {
  const db = createDb(targetPath);

  const insertUser = db.prepare(
    `INSERT INTO users (id, name, email, role, designation, office, initials)
     VALUES (@id, @name, @email, @role, @designation, @office, @initials)`,
  );
  for (const u of USERS) insertUser.run(u);

  const insertMatter = db.prepare(
    `INSERT INTO matters (id, reference, title, matter_type, forum, counterparty, project,
                          status, exposure_inr, next_date, summary, owner_id, created_at)
     VALUES (@id, @reference, @title, @matterType, @forum, @counterparty, @project,
             @status, @exposureInr, @nextDate, @summary, @ownerId, @createdAt)`,
  );
  const insertAccess = db.prepare(
    `INSERT INTO matter_access (matter_id, user_id, access_level) VALUES (?, ?, ?)`,
  );
  for (const m of MATTERS) {
    const { access, ...row } = m;
    insertMatter.run(row);
    for (const a of access) insertAccess.run(m.id, a.userId, a.level);
  }

  const insertDoc = db.prepare(
    `INSERT INTO documents (id, matter_id, title, doc_type, source, ocr_status, ocr_confidence,
                            page_count, filed_by, doc_date, uploaded_by, created_at)
     VALUES (@id, @matterId, @title, @docType, @source, @ocrStatus, @ocrConfidence,
             @pageCount, @filedBy, @docDate, @uploadedBy, @createdAt)`,
  );
  const insertChunk = db.prepare(
    `INSERT INTO doc_chunks (id, document_id, page_no, para_no, heading, body)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const d of DOCUMENTS) {
    const { chunks, ...row } = d;
    insertDoc.run(row);
    chunks.forEach((c, i) =>
      insertChunk.run(`${d.id}-c${i}`, d.id, c.page, c.para, c.heading ?? null, c.body),
    );
  }

  const insertAuthority = db.prepare(
    `INSERT INTO authorities (id, case_title, citation, court, bench, year, decided_on,
                              subject_tags, holding_summary, status, status_note, superseded_by,
                              source_url, favours, counter_point)
     VALUES (@id, @caseTitle, @citation, @court, @bench, @year, @decidedOn,
             @tags, @holding, @status, @statusNote, @supersededBy,
             @sourceUrl, @favours, @counterPoint)`,
  );
  const insertPara = db.prepare(
    `INSERT INTO authority_paras (id, authority_id, para_no, body) VALUES (?, ?, ?, ?)`,
  );
  // Two passes: superseded_by is a self-referential FK, so insert rows first
  // with a null reference and patch afterwards.
  for (const a of AUTHORITIES) {
    const stance = STANCES[a.id];
    if (!stance) {
      throw new Error(
        `No stance recorded for authority "${a.id}" (${a.caseTitle}). ` +
          `Every authority needs an entry in db/seed/stances.ts.`,
      );
    }
    insertAuthority.run({
      id: a.id,
      caseTitle: a.caseTitle,
      citation: a.citation,
      court: a.court,
      bench: a.bench,
      year: a.year,
      decidedOn: a.decidedOn,
      tags: a.tags.join(','),
      holding: a.holding,
      status: a.status,
      statusNote: a.statusNote ?? null,
      supersededBy: null,
      sourceUrl: sourceUrlFor(a),
      favours: stance.favours,
      counterPoint: stance.counterPoint,
    });
    a.paras.forEach((p, i) =>
      insertPara.run(`${a.id}-p${i}`, a.id, p.locator, p.body),
    );
  }
  const patchSuperseded = db.prepare(`UPDATE authorities SET superseded_by = ? WHERE id = ?`);
  for (const a of AUTHORITIES) {
    if (a.supersededBy) patchSuperseded.run(a.supersededBy, a.id);
  }

  const insertTemplate = db.prepare(
    `INSERT INTO templates (id, name, doc_type, jurisdiction, version, is_current, description,
                            variables, body, usage_count)
     VALUES (@id, @name, @docType, @jurisdiction, @version, @isCurrent, @description,
             @variables, @body, @usageCount)`,
  );
  for (const t of TEMPLATES) {
    insertTemplate.run({
      ...t,
      isCurrent: t.isCurrent ? 1 : 0,
      variables: JSON.stringify(t.variables),
    });
  }

  const insertClause = db.prepare(
    `INSERT INTO clauses (id, slot, title, body, variant, risk_level, risk_note, usage_count)
     VALUES (@id, @slot, @title, @body, @variant, @riskLevel, @riskNote, @usageCount)`,
  );
  for (const c of CLAUSES) insertClause.run({ ...c, riskNote: c.riskNote ?? null });

  // Activity feed — gives the dashboard something true to show on first load.
  const insertActivity = db.prepare(
    `INSERT INTO activity (id, actor_id, verb, entity_type, entity_id, entity_label, matter_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const activity: Array<[string, string, string, string, string, string | null, string]> = [
    ['u-para', 'uploaded', 'document', 'doc-ncdrc-complaint', 'Consumer Complaint No. 1184 of 2026', 'm-ncdrc-skyline', '2026-08-14T09:22:00Z'],
    ['u-counsel-1', 'opened', 'matter', 'm-ibc-notice', 'Threatened Section 7 application', 'm-ibc-notice', '2026-08-14T11:40:00Z'],
    ['u-admin', 'connected', 'document', 'doc-erp-extract', 'ERP extract — Skyline collections', 'm-ncdrc-skyline', '2026-08-15T03:30:00Z'],
    ['u-counsel-2', 'flagged', 'clause', 'cl-dr-unilateral', 'Unilateral arbitrator appointment clause', 'm-arb-turnkey', '2026-08-15T07:15:00Z'],
    ['u-para', 'queued', 'document', 'doc-sector91-title', 'Title chain abstract — Sector 91', 'm-land-sector91', '2026-08-15T10:05:00Z'],
    ['u-head', 'reviewed', 'matter', 'm-rera-compliance', 'RERA compliance review', 'm-rera-compliance', '2026-08-15T12:50:00Z'],
  ];
  activity.forEach((a, i) => insertActivity.run(`act-${i}`, ...a));

  const insertComment = db.prepare(
    `INSERT INTO comments (id, entity_type, entity_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const comments: Array<[string, string, string, string, string]> = [
    ['matter', 'm-ncdrc-skyline', 'u-head', 'Ananya — before the 8 September date I want the Clause 11.4 position settled. If the token rate will not hold, we should be arguing quantum, not entitlement.', '2026-08-15T05:20:00Z'],
    ['matter', 'm-ncdrc-skyline', 'u-counsel-1', 'Agreed. Running the pleading through the analyst now. The forfeiture clause at 20% is the weaker point — Kailash Nath is squarely against us on a bare forfeiture without proof of loss.', '2026-08-15T06:05:00Z'],
    ['matter', 'm-arb-turnkey', 'u-counsel-2', 'The stamping objection is not the problem it was. Interplay (7 judges) makes it curable. The unilateral appointment point under Perkins is the real exposure — the clause is in roughly forty legacy contracts.', '2026-08-15T07:18:00Z'],
    ['matter', 'm-ibc-notice', 'u-counsel-1', '38 allottees against 604 total. Threshold under Section 7(1) is the lesser of 100 or 10% — 10% of 604 is 61. They are short on both limbs. Manish Kumar upheld the threshold.', '2026-08-15T09:44:00Z'],
  ];
  comments.forEach((c, i) => insertComment.run(`cm-${i}`, ...c));

  const insertAudit = db.prepare(
    `INSERT INTO audit_log (id, user_id, action, resource, model_used, tier, data_residency, latency_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const audits: Array<[string, string, string, string | null, string | null, string, number | null, string]> = [
    ['u-counsel-1', 'analysis.proposition', 'Delay compensation ceiling under a one-sided clause', 'm3m-legal-40b (on-prem)', 'tier-2', 'IN — Gurugram DC', 2140, '2026-08-15T06:02:00Z'],
    ['u-counsel-1', 'analysis.pleading', 'Consumer Complaint No. 1184 of 2026', 'm3m-legal-40b (on-prem)', 'tier-2', 'IN — Gurugram DC', 4820, '2026-08-15T06:11:00Z'],
    ['u-counsel-2', 'draft.generate', 'Leave and License — Nexlayer Technologies', 'm3m-draft-8b (on-prem)', 'tier-1', 'IN — Gurugram DC', 640, '2026-08-15T07:22:00Z'],
    ['u-para', 'document.ingest', 'Title chain abstract — Sector 91', 'ocr-pipeline', 'tier-0', 'IN — Gurugram DC', 18400, '2026-08-15T10:05:00Z'],
    ['u-head', 'repository.search', 'unilateral arbitrator appointment', null, 'tier-0', 'IN — Gurugram DC', 38, '2026-08-15T12:48:00Z'],
    ['u-admin', 'admin.routing_change', 'Tier 3 escalation threshold', null, null, 'IN — Gurugram DC', null, '2026-08-15T13:02:00Z'],
  ];
  audits.forEach((a, i) => insertAudit.run(`aud-${i}`, ...a));

  const counts = {
    users: USERS.length,
    matters: MATTERS.length,
    documents: DOCUMENTS.length,
    docChunks: db.prepare('SELECT COUNT(*) AS n FROM doc_chunks').get() as { n: number },
    authorities: AUTHORITIES.length,
    authorityParas: db.prepare('SELECT COUNT(*) AS n FROM authority_paras').get() as { n: number },
    templates: TEMPLATES.length,
    clauses: CLAUSES.length,
  };

  db.close();
  return counts;
}

const target = process.argv[2] ? path.resolve(process.argv[2]) : DB_PATH;
const counts = seed(target);

console.log(`Seeded ${target}`);
console.log(`  users            ${counts.users}`);
console.log(`  matters          ${counts.matters}`);
console.log(`  documents        ${counts.documents} (${counts.docChunks.n} indexed passages)`);
console.log(`  authorities      ${counts.authorities} (${counts.authorityParas.n} indexed passages)`);
console.log(`  templates        ${counts.templates}`);
console.log(`  clauses          ${counts.clauses}`);

export { seed };
