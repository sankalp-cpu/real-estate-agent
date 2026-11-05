import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReplitProvider } from '../lib/llm/replit.ts';
test('Replit adapter sends grounded payload to configured compatible endpoint', async () => {
  const original = globalThis.fetch;
  let requested = '';
  globalThis.fetch = (async (url: any, options: any) => {
    requested = String(url);
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'test-model');
    assert.match(body.messages[0].content, /Only use facts/);
    assert.match(body.messages[1].content, /known source/);
    assert.ok(options.signal);
    return new Response(JSON.stringify({ choices: [{ message: { content: 'Grounded narration.' } }] }), { status: 200 });
  }) as typeof fetch;
  try {
    const provider = new ReplitProvider('https://example.invalid/v1/', 'test-placeholder', 'test-model');
    const result = await provider.generate({ task: 'summarisation', payload: { headline: 'Known', sections: [{ heading: 'Evidence', paragraphs: ['known source'] }] } });
    assert.equal(requested, 'https://example.invalid/v1/chat/completions');
    assert.equal(result.text, 'Grounded narration.');
    assert.match(result.model, /Replit AI/);
    assert.match(result.residency, /not verified/);
  } finally { globalThis.fetch = original; }
});
test('provider failures do not echo upstream response bodies', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => new Response('sensitive upstream body', { status: 401 })) as typeof fetch;
  try {
    const provider = new ReplitProvider('https://example.invalid/v1', 'test-placeholder');
    await assert.rejects(() => provider.generate({ task: 'summarisation', payload: { sections: [] } }), { message: 'Replit AI request failed (401).' });
  } finally { globalThis.fetch = original; }
});
