import { getDb } from './db.ts';
import { currentUser, visibleMatterIds } from './session.ts';

export async function workspaceData() {
  const db = getDb();
  const user = await currentUser();
  const scope = visibleMatterIds(user);
  const matters = db.prepare('SELECT * FROM matters ORDER BY reference').all() as any[];
  const visible = matters.filter(m => scope === null || scope.includes(m.id));
  const documents = (db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all() as any[])
    .filter(d => d.matter_id === null || visible.some(m => m.id === d.matter_id))
    .map(d => ({ ...d, chunks: db.prepare('SELECT * FROM doc_chunks WHERE document_id = ? ORDER BY page_no').all(d.id) }));
  return { user, matters: visible, documents, liveAI: process.env.LLM_PROVIDER === 'replit' && Boolean(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && process.env.AI_INTEGRATIONS_OPENAI_API_KEY) };
}
