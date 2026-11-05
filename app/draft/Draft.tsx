'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Template } from '../../lib/drafting.ts';
export function Draft({ templates }: { templates: Template[] }) {
  const [id, setId] = useState('tpl-nda');
  const template = templates.find(t => t.id === id)!;
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const defaults = Object.fromEntries(template.variables.map(v => [v.key, v.example]));
  const fields = template.variables.filter(v => ['party_b_name', 'purpose', 'term_years', 'subject_matter', 'exclusivity_days', 'place'].includes(v.key));
  async function generate() {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ templateId: id, variables: { ...defaults, ...values }, clauseIds: {} }) });
      const json = await res.json();
      if (!res.ok || !json.body) throw new Error(json.error ?? 'Unable to generate the draft.');
      setResult(json);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to generate.'); }
    finally { setBusy(false); }
  }
  function download() {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([result.body], { type: 'text/plain' })); a.download = 'draft-for-review.txt'; a.click(); URL.revokeObjectURL(a.href);
  }
  return <><div className="breadcrumb">Draft /</div><h1 className="page-heading">Draft</h1><p className="page-subtitle">Documents built from your approved clauses, with departures visible before they leave the workspace.</p><div className="segmented"><button className="selected">Create a document</button><Link href="/analyst" style={{ padding: '8px 14px', fontSize: 12, color: '#687076' }}>Check someone else’s draft ↗</Link></div><div style={{ display: 'grid', gridTemplateColumns: result ? 'minmax(280px,360px) minmax(0,1fr)' : 'minmax(280px,500px)', gap: 35, marginTop: 30 }} className="compact-draft"><section><label style={{ display: 'block', fontSize: 12 }}>Template<select className="search-input" style={{ display: 'block', width: '100%', margin: '9px 0 24px' }} value={id} onChange={e => { setId(e.target.value); setValues({}); setResult(null); }}>{templates.filter(t => ['tpl-nda', 'tpl-mou'].includes(t.id)).map(t => <option key={t.id} value={t.id}>{t.id === 'tpl-nda' ? 'Mutual NDA' : 'MOU'} ({t.version})</option>)}</select></label>{fields.map(v => <label key={v.key} style={{ display: 'block', marginBottom: 20, fontSize: 12 }}>{v.key === 'party_b_name' ? 'Counterparty' : v.label}<input className="search-input" style={{ display: 'block', width: '100%', marginTop: 8 }} value={values[v.key] ?? v.example} onChange={e => setValues({ ...values, [v.key]: e.target.value })}/></label>)}<p className="page-subtitle">Other particulars use the template’s synthetic example values. Review all details in the generated document.</p><button className="primary" disabled={busy} onClick={generate}>{busy ? 'Assembling…' : 'Create document'}</button><Link href="/drafting" className="pill-button" style={{ marginLeft: 10 }}>All templates & clause library →</Link>{error && <div className="error-box">{error}</div>}</section>{result && <section><div className="toolbar"><h2 style={{ fontSize: 16 }}>Working draft</h2><span className="status-chip warning">Review required</span><button className="outline-button" onClick={download}>↓ Download .txt</button></div><pre style={{ whiteSpace: 'pre-wrap', border: '1px solid #e3e4e5', padding: 30, font: '14px/1.9 Georgia,serif', background: '#fffefa' }}>{result.body}</pre></section>}</div><style>{`@media(max-width:900px){.compact-draft{grid-template-columns:1fr!important}}`}</style></>;
}
