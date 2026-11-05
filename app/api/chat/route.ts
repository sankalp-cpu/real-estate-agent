import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDb } from '../../../lib/db.ts';
import { currentUser, canReachMatter } from '../../../lib/session.ts';
import { searchDocuments } from '../../../lib/retrieval.ts';
import { analyseProposition } from '../../../lib/analyst.ts';
import { getProvider } from '../../../lib/llm/index.ts';

export async function POST(req: Request) {
  try {
    const { text, matterId, mode } = await req.json();
    if (typeof text !== 'string' || !text.trim() || text.length > 12000) return NextResponse.json({ error: 'Enter a question of up to 12,000 characters.' }, { status: 400 });
    const user = await currentUser();
    const db = getDb();
    if (!matterId || !db.prepare('SELECT id FROM matters WHERE id = ?').get(matterId)) return NextResponse.json({ error: 'Select a valid matter.' }, { status: 400 });
    if (!canReachMatter(user, matterId)) return NextResponse.json({ error: 'This matter is not available to your demo identity.' }, { status: 403 });
    let paragraphs: string[] = [];
    let sources: any[] = [];
    let provider = 'Indexed document extracts';
    let note = '';
    if (mode === 'research' || /research|faced this|counter.argument|unstamped|forfeit|arbitration clause/i.test(text)) {
      const query = /faced this|research the proposition/i.test(text) ? 'delay in handing over possession compensation refund to allottee' : text;
      const analysis = await analyseProposition(db, query, { matterIds: [matterId] });
      paragraphs = [analysis.verdict.headline, ...analysis.narrative.split('\n').filter(Boolean)];
      sources = analysis.retrieval.map(h => ({ label: `${h.caseTitle} · ${h.locator}`, url: h.sourceUrl }));
      provider = analysis.telemetry.model;
      note = 'Case passages are editorial summaries, not verbatim judgments. Good-law labels are the seeded corpus snapshot, not a live legal update.';
    } else if (/margin|dues|over 90|profit/i.test(text)) {
      paragraphs = ['The supplied repository does not contain the financial ledger needed to answer that question. I cannot verify a margin or a list of overdue units from this corpus.'];
      note = 'No ERP connection is configured. No financial figures have been invented.';
    } else if (/draft|reply notice/i.test(text)) {
      paragraphs = ['## Reply notice · working outline', 'Without prejudice to the rights and contentions of the developer, acknowledge receipt of the notice and verify the allotment, agreement date, payments and promised possession date against the source documents.', 'Do not dispute the statutory entitlement to refund solely on a general force majeure plea. Establish any relevant periods of delay with documentary evidence, and seek instructions on settlement and quantum.', 'Open Draft in the sidebar to assemble the approved Reply to RERA complaint template, choose clauses, and review the redline. This outline is not a settled reply ready for service.'];
      note = 'Template assembly and the clause library are available in Draft. Professional review required.';
    } else {
      const explicitRao = /rao/i.test(text);
      if (explicitRao && matterId === 'm-golf-estate') {
        const chunks = db.prepare('SELECT * FROM doc_chunks WHERE document_id = ? ORDER BY page_no, rowid').all('doc-rao-notice') as any[];
        paragraphs = chunks.map(c => c.body);
        sources = chunks.map(c => ({ label: `p.${c.page_no}`, documentId: c.document_id, page: c.page_no }));
      } else {
        const hits = searchDocuments(db, text, { matterIds: [matterId], limit: 5 });
        paragraphs = hits.map(h => h.body);
        sources = hits.map(h => ({ label: `p.${h.page} · ${h.locator}`, documentId: h.documentId, page: h.page }));
      }
      if (!paragraphs.length) paragraphs = ['No sufficiently relevant passage was found in this matter’s indexed documents. Try naming a document, clause or issue, or switch to Research a proposition.'];
      else if (process.env.LLM_PROVIDER === 'replit') {
        const generated = await getProvider().generate({ task: 'summarisation', instruction: 'Answer the question only from the supplied passages. Question: ' + text, payload: { headline: text, sections: [{ heading: 'Answer', paragraphs }] } });
        paragraphs = generated.text.split('\n').filter(Boolean);
        provider = generated.model;
      }
      note = 'Synthetic matter documents. These are indexed excerpts, not the complete original filings.';
    }
    db.prepare('INSERT INTO audit_log (id,user_id,action,resource,model_used,tier,data_residency,latency_ms,created_at) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(randomUUID(), user.id, 'assistant.question', text.slice(0, 120), provider, 'retrieval', 'Demo sandbox / provider-managed if enabled', null, new Date().toISOString());
    return NextResponse.json({ paragraphs, sources, provider, note });
  } catch {
    return NextResponse.json({ error: 'The configured AI provider could not complete this request. Check Control Room and try again.' }, { status: 503 });
  }
}
