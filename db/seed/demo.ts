import type { Database } from 'better-sqlite3';

/** Reconstructed synthetic reference scenario; not the original deployed dataset. */
export function seedDemo(db: Database) {
  db.prepare("UPDATE users SET name='Rhea Malhotra', designation='General Counsel', email='rhea.malhotra@realestate.example.in' WHERE id='u-head'").run();
  db.prepare(`INSERT INTO matters (id,reference,title,matter_type,forum,counterparty,project,status,exposure_inr,next_date,summary,owner_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run('m-golf-estate', 'RE/LIT/2026/041', 'Golf Estate allottee notices (delay in possession)', 'litigation', 'Haryana RERA, Gurugram', 'Mrs. Sunita Rao', 'Golf Estate, Sector 65', 'active', 18640000, '2026-08-19', 'Synthetic reference scenario: allottee notice seeking refund for delayed possession. Review the notice, agreement and receipt record before responding.', 'u-head', '2026-08-04T09:00:00Z');
  db.prepare('INSERT INTO matter_access VALUES (?,?,?)').run('m-golf-estate', 'u-head', 'owner');
  const docs = [
    { id: 'doc-rao-notice', title: 'Legal notice · Mrs. Sunita Rao · Golf Estate Unit 1203', type: 'notice', pages: 6, source: 'scan', chunks: [
      [2, 'Parties', 'The notice is on behalf of Mrs. Sunita Rao, allottee of Unit 1203, Golf Estate, under a builder-buyer agreement dated 14 March 2019.'],
      [2, 'Demand', 'It alleges delay in possession beyond 14 September 2022 and seeks refund of Rs. 1,86,40,000 with interest at 18% per annum.'],
      [3, 'Provisions relied on', 'Provisions relied on: Section 18 of RERA 2016 and Section 2(47) of the Consumer Protection Act 2019.'],
      [5, 'Reply deadline', 'Limitation for reply: fifteen days from receipt, i.e. by 19 August 2026, failing which proceedings are threatened.'],
    ] },
    { id: 'doc-golf-agreement', title: 'Builder-buyer agreement · Golf Estate · Unit 1203', type: 'contract', pages: 42, source: 'scan', chunks: [
      [12, 'Possession', 'Agreement dated 14 March 2019. The developer proposes possession within 36 months with a grace period of 6 months, by 14 September 2022.'],
      [22, 'Consideration', 'Allottee: Mrs. Sunita Rao. Apartment: Unit 1203, Tower 12, Golf Estate, Sector 65, Gurugram. Recorded consideration: Rs. 1,86,40,000.'],
    ] },
    { id: 'doc-golf-receipt', title: 'Inward register · Rao notice receipt', type: 'correspondence', pages: 1, source: 'email', chunks: [[1, 'Receipt', 'The legal notice from counsel for Mrs. Sunita Rao was received on 4 August 2026. Fifteen days from the recorded receipt gives a reply date of 19 August 2026.']] },
    { id: 'doc-golf-review', title: 'Legal review note · Golf Estate allottee notices', type: 'correspondence', pages: 2, source: 'upload', chunks: [[1, 'Review required', 'Check payment records, possession commitments and specific causes of delay before settling any response. No reply has been approved for service. The demo contains synthetic excerpts, not live client documents.']] },
  ];
  const insert = db.prepare('INSERT INTO documents (id,matter_id,title,doc_type,source,ocr_status,ocr_confidence,page_count,filed_by,doc_date,uploaded_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  const chunk = db.prepare('INSERT INTO doc_chunks (id,document_id,page_no,para_no,heading,body) VALUES (?,?,?,?,?,?)');
  for (const d of docs) {
    insert.run(d.id, 'm-golf-estate', d.title, d.type, d.source, 'indexed', d.source === 'scan' ? .93 : 1, d.pages, null, '2026-08-04', 'u-head', '2026-08-04T09:00:00Z');
    d.chunks.forEach((c, i) => chunk.run(`${d.id}-${i}`, d.id, c[0], c[1], c[1], c[2]));
  }
}
