'use client';
import { useEffect, useState } from 'react';

export function DocumentReader({ document, page: initialPage, onClose }: { document: any; page?: number; onClose: () => void }) {
  const pages: number[] = [...new Set<number>(document.chunks.map((c: any) => c.page_no))];
  const [page, setPage] = useState(initialPage ?? pages[0] ?? 1);
  const [editing, setEditing] = useState(false);
  const [filed, setFiled] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<Record<number, string>>({});
  const original: string = document.chunks.filter((c: any) => c.page_no === page).map((c: any) => c.body).join('\n\n');
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(`rea-working-${document.id}`) ?? '{}')); } catch { setSaved({}); }
  }, [document.id]);
  function save() {
    const next = { ...saved, [page]: text }; setSaved(next);
    localStorage.setItem(`rea-working-${document.id}`, JSON.stringify(next)); setEditing(false);
  }
  function download() {
    const content = pages.map(p => `Page ${p}\n${saved[p] ?? document.chunks.filter((c: any) => c.page_no === p).map((c: any) => c.body).join('\n\n')}`).join('\n\n');
    const a = window.document.createElement('a'); a.href = URL.createObjectURL(new Blob([document.title + '\n\n' + content], { type: 'text/plain' }));
    a.download = 'working-document.txt'; a.click(); URL.revokeObjectURL(a.href);
  }
  return <aside className="reader" aria-label="Source document reader">
    <div className="reader-header"><div><h3>{document.title}</h3><small>Page {page} of {document.page_count} · {document.source} · OCR {document.ocr_confidence ?? '—'}</small></div><button aria-label="Close document" onClick={onClose}>×</button></div>
    <div className="reader-tools"><button className={!filed ? 'selected' : ''} onClick={() => { setFiled(false); setEditing(false); }}>Working copy</button><button className={filed ? 'selected' : ''} onClick={() => { setFiled(true); setEditing(false); }}>Filed page</button><select aria-label="Document page" value={page} onChange={e => { setPage(Number(e.target.value)); setEditing(false); }}>{pages.map(p => <option key={p} value={p}>Page {p}</option>)}</select><button style={{ marginLeft: 'auto' }} onClick={download}>↓ .txt</button></div>
    <p className="reader-note">{saved[page] && !filed ? 'Working copy changed · saved in this browser only.' : 'No changes yet on this page.'} Synthetic document · indexed excerpts only.</p>
    <div className="document-paper"><h3>{document.title.toUpperCase()}</h3>{editing ? <><textarea aria-label="Edit working copy" value={text} onChange={e => setText(e.target.value)}/><button className="primary" onClick={save}>Save working copy</button> <button onClick={() => setEditing(false)}>Cancel</button></> : <div onDoubleClick={() => { if (!filed) { setText(saved[page] ?? original); setEditing(true); } }}>{((!filed && saved[page]) || original).split('\n\n').map((p, i) => <p key={i} className={initialPage === page && i === 0 ? 'highlight' : ''}>{p}</p>)}</div>}</div>
    {!filed && !editing && <p className="reader-note" style={{ textAlign: 'center' }}><button onClick={() => { setText(saved[page] ?? original); setEditing(true); }}>Double-click a paragraph, or click here to edit the working copy.</button></p>}
  </aside>;
}
