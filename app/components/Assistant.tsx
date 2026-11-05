'use client';
import { useRef, useState } from 'react';
import { Icon } from './WorkspaceShell.tsx';
import { DocumentReader } from './DocumentReader.tsx';

const prompts = ['What does the Rao notice claim, and by when must we reply?', 'Have we faced this before?', 'Research the proposition and draft a counter-argument', 'Draft the reply notice from the approved template', 'Units in Sector 65 with dues over 90 days', 'What was our margin on Golf Estate last quarter?'];
type Answer = { question: string; paragraphs: string[]; sources: any[]; provider: string; note?: string; error?: string };
export function Assistant({ user, matters, documents, liveAI, selectedId, initialPrompt }: any) {
  const [matterId, setMatterId] = useState(selectedId && matters.some((m: any) => m.id === selectedId) ? selectedId : matters.find((m: any) => m.id === 'm-golf-estate')?.id ?? matters[0]?.id ?? '');
  const [mode, setMode] = useState('matter');
  const [text, setText] = useState(initialPrompt ?? '');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [busy, setBusy] = useState(false);
  const [reader, setReader] = useState<{ document: any; page?: number } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const matter = matters.find((m: any) => m.id === matterId);
  const count = documents.filter((d: any) => d.matter_id === matterId).length;
  async function send(value = text) {
    if (busy || !value.trim()) return;
    setText(''); setBusy(true);
    const index = answers.length;
    setAnswers(a => [...a, { question: value, paragraphs: [], sources: [], provider: '' }]);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: value, matterId, mode }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Unable to answer. Please try again.');
      setAnswers(a => a.map((v, i) => i === index ? { question: value, ...result } : v));
    } catch (e) {
      setAnswers(a => a.map((v, i) => i === index ? { ...v, error: e instanceof Error ? e.message : 'Request failed.' } : v));
    } finally { setBusy(false); setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), 50); }
  }
  async function open(source: any) {
    if (source.url) { window.open(source.url, '_blank', 'noopener,noreferrer'); return; }
    const doc = documents.find((d: any) => d.id === source.documentId);
    if (doc) setReader({ document: doc, page: source.page });
  }
  const composer = <div className="composer"><div className="matter-pill">{matter?.reference} &nbsp; {matter?.title ?? 'Select a matter'}</div><textarea aria-label="Ask about this matter" value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'research' ? 'State a proposition to research…' : 'Ask about this matter…'} rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}/><div className="composer-bottom"><a href="/vault" title="Choose a document from the Vault"><Icon name="clip"/></a><select aria-label="Selected matter" value={matterId} onChange={e => { setMatterId(e.target.value); setAnswers([]); setReader(null); }}>{matters.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}</select><span className="provider-label">{liveAI ? 'Replit AI' : 'Grounded demo'}</span><button className="send" aria-label="Send message" disabled={busy || !text.trim()} onClick={() => send()}><Icon name="arrow"/></button></div></div>;
  return <><header className="workspace-topbar"><span>{answers.length ? answers[answers.length - 1].question : `${matter?.reference ?? ''} · ${matter?.title ?? 'Assistant'}`}</span><a href="/control-room" className="mode-badge">{liveAI ? 'Replit AI enabled' : 'Demo mode · synthetic data'}</a></header><div className="assistant-body"><div className="chat-column">
    {!answers.length ? (
      <section className="welcome">
        <h1>Good morning, {user.name.split(' ')[0]}</h1>
        <p>Working in <strong>{matter?.title ?? 'your legal workspace'}</strong></p>
        <p className="count">· {count} documents ⓘ</p>
        <div className="segmented">
          <button className={mode === 'matter' ? 'selected' : ''} onClick={() => setMode('matter')}>Ask this matter</button>
          <button className={mode === 'research' ? 'selected' : ''} onClick={() => setMode('research')}>Research a proposition</button>
        </div>
        {composer}<div className="source-hint">Every answer opens its source.</div>
        <div className="suggestions">{(mode === 'matter' ? prompts : ['An unstamped agreement cannot be referred to arbitration.', 'We may forfeit 20 per cent earnest money on cancellation.', 'The arbitration clause bars the consumer complaint.']).map(p => <button key={p} onClick={() => send(p)}>{p}</button>)}</div>
      </section>
    ) : (
      <>
        <div className="conversation">
          {answers.map((a, i) => (
            <div key={i}>
              <div className="message-user">{a.question}</div>
              {busy && i === answers.length - 1 && !a.paragraphs.length ? (
                <div className="thinking">Reading the matter and checking sources…</div>
              ) : (
                <div className="answer">
                  {a.error ? (
                    <div className="error-box">{a.error} <button className="pill-button" onClick={() => send(a.question)}>Retry</button></div>
                  ) : (
                    <>
                      {a.paragraphs.map((p, n) => p.startsWith('## ') ? <h3 key={n}>{p.slice(3)}</h3> : <p key={n}>{p}{a.sources[n] && <button className="citation" onClick={() => open(a.sources[n])}>{a.sources[n].label}</button>}</p>)}
                      {a.sources.length > a.paragraphs.length && <div>{a.sources.slice(a.paragraphs.length).map((s: any, n: number) => <button className="citation" key={n} onClick={() => open(s)}>{s.label}</button>)}</div>}
                      <div className="verified"><strong>✓ {a.sources.length} indexed sources</strong>{a.provider} · review before relying</div>
                      {a.note && <small style={{ display: 'block', font: '11px/1.6 Arial', color: '#858c90', marginTop: 8 }}>{a.note}</small>}
                      <div className="suggestions" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
                        {['Have we faced this before?', 'Research the proposition', 'Draft the reply notice'].map(p => <button key={p} disabled={busy} onClick={() => send(p)}>{p}</button>)}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={bottom}/>
        </div>
        <div className="chat-footer">{composer}<div className="source-hint">Every answer opens its source. Synthetic demo · qualified review required.</div></div>
      </>
    )}
  </div>{reader && <DocumentReader key={reader.document.id + reader.page} {...reader} onClose={() => setReader(null)}/>}</div></>;
}
