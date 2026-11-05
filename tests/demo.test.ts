import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { seed } from '../db/seed/index.ts';
test('reference scenario preserves corpus and seeds source-linked Rao facts', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rea-demo-'));
  const file = path.join(dir, 'demo.sqlite');
  seed(file);
  const db = new Database(file);
  try {
    assert.equal((db.prepare('SELECT COUNT(*) n FROM authorities').get() as any).n, 34);
    assert.equal((db.prepare('SELECT COUNT(*) n FROM templates').get() as any).n, 6);
    assert.equal((db.prepare('SELECT COUNT(*) n FROM matters').get() as any).n, 7);
    const rows = db.prepare("SELECT * FROM doc_chunks WHERE document_id='doc-rao-notice'").all() as any[];
    assert.equal(rows.length, 4);
    assert.ok(rows.some(r => r.body.includes('19 August 2026')));
    assert.ok(rows.some(r => r.body.includes('1,86,40,000')));
    const panel = db.prepare("SELECT matter_id FROM matter_access WHERE user_id='u-panel'").all() as any[];
    assert.deepEqual(panel.map(r => r.matter_id), ['m-ncdrc-skyline']);
  } finally { db.close(); fs.rmSync(dir, { recursive: true, force: true }); }
});
