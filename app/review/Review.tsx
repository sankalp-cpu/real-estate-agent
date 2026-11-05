'use client';
import { useState } from 'react';
import { DocumentReader } from '../components/DocumentReader.tsx';
const questions = ['What is the lock-in period?', 'Who bears property tax?', 'Is there a termination for convenience clause?', 'What is the escalation basis?', 'What is the security deposit?', 'Where is the arbitration seat?', 'What is the notice period?', 'Is there a renewal option?'];
const patterns = [/lock.in/i, /property tax/i, /terminat/i, /escalat/i, /deposit/i, /arbitrat|seat/i, /notice|days/i, /renew/i];
export function Review({ documents }: any) {
  const contracts = documents.filter((d: any) => d.doc_type === 'contract' || d.doc_type === 'policy');
  const [columns, setColumns] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [reader, setReader] = useState<any>(null);
  function add(q: string) { if (q.trim() && !columns.includes(q)) setColumns([...columns, q]); }
  const rows = contracts.map((d: any) => ({ document: d, cells: columns.map(q => {
    const index = questions.indexOf(q);
    const words = q.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    return d.chunks.find((c: any) => index >= 0 ? patterns[index].test(c.body) : words.some(w => c.body.toLowerCase().includes(w)));
  }) }));
  function exportCsv() {
    const escape = (s: string) => `"${s.replaceAll('"', '""')}"`;
    const csv = [['Document', ...columns], ...rows.map((r: any) => [r.document.title, ...r.cells.map((c: any) => c?.body ?? 'Not found in indexed excerpts')])].map(r => r.map(escape).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'document-review.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
  return <><div className="breadcrumb">Tabular Review /</div><h1 className="page-heading">Lease review 2026</h1><p className="page-subtitle">Accessible contract portfolio · {contracts.length} documents · excerpt matching, not full-document AI review</p><div className="toolbar"><select aria-label="Review preset" onChange={() => setColumns(questions.slice(0, 4))}><option>Standard lease questions</option><option>Apply standard questions</option></select><button className="outline-button" onClick={() => setColumns(questions.slice(0, 4))}>Add the four lease questions</button>{columns.length > 0 && <><button className="outline-button" onClick={exportCsv}>↓ Export CSV</button><button onClick={() => setColumns([])}>Clear questions</button></>}</div>{!columns.length && <div className="empty-panel"><h2>Ask {contracts.length} documents one question.</h2><p>Answers side by side, with the source a click away.</p></div>}<div className="suggestions" style={{ justifyContent: 'flex-start', margin: '24px 0' }}>{questions.filter(q => !columns.includes(q)).map(q => <button key={q} onClick={() => add(q)}>+ {q}</button>)}</div><form className="toolbar" onSubmit={e => { e.preventDefault(); add(custom); setCustom(''); }}><input className="search-input" aria-label="Add a review question" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Ask your own question…"/><button className="primary" disabled={!custom.trim()}>Add question</button></form>{columns.length > 0 && <div className="table-wrap"><table className="data-table"><thead><tr><th>Document</th>{columns.map(q => <th key={q} style={{ minWidth: 220 }}>{q}<button aria-label={`Remove ${q}`} onClick={() => setColumns(columns.filter(c => c !== q))} style={{ marginLeft: 10 }}>×</button></th>)}</tr></thead><tbody>{rows.map((r: any) => <tr key={r.document.id}><td style={{ minWidth: 200 }}>{r.document.title}</td>{r.cells.map((c: any, i: number) => <td key={i}>{c ? <>{c.body}<button className="citation" onClick={() => setReader({ document: r.document, page: c.page_no })}>p.{c.page_no}</button></> : <span style={{ color: '#8a9094' }}>Not found in indexed excerpts</span>}</td>)}</tr>)}</tbody></table></div>}{reader && <div style={{ position: 'fixed', inset: '0 0 0 auto', width: 'min(740px, calc(100vw - 64px))', zIndex: 40, background: 'white', boxShadow: '-8px 0 30px #0001' }}><DocumentReader key={reader.document.id + reader.page} {...reader} onClose={() => setReader(null)}/></div>}<style>{`.content-page .reader{width:100%;height:100%;position:static}`}</style></>;
}
