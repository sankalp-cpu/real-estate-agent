/**
 * Live provider. Enabled with LLM_PROVIDER=anthropic and ANTHROPIC_API_KEY.
 *
 * It narrates the same structured payload the fixture provider receives, under a
 * system prompt that forbids adding authority. The citations rendered in the
 * interface are built from retrieval regardless of which provider ran, so a live
 * model cannot introduce a citation into the output.
 *
 * Uses fetch directly — no SDK dependency, since the default path never calls out.
 */

import {
  type GenerateRequest,
  type GenerateResult,
  type Provider,
  estimateCostInr,
  route,
} from './provider.ts';
import type { NarrationPayload } from './fixture.ts';

const SYSTEM = `You are a legal analysis assistant for the in-house legal department of an Indian real estate developer.

You will be given a structured payload that has already been assembled from a retrieval step over an indexed corpus of Indian judgments. Your only task is to narrate that payload in the register of an Indian in-house counsel's note.

Absolute constraints:
- Do NOT introduce any case, citation, statute section or holding that is not present in the payload. If the payload is thin, say so plainly.
- Do NOT restate a holding in stronger terms than the payload states it.
- Do NOT add a concluding flourish about consulting a lawyer; the reader is a lawyer.
- Where the payload marks an authority as overruled or distinguished, that qualification must survive into your narration.
- Write in British-Indian legal English. Plain, direct, no marketing register.

Return prose only. Section headings from the payload should be preserved as markdown h2.`;

export class AnthropicProvider implements Provider {
  readonly name = 'anthropic';

  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model ?? process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-5';
  }

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const started = performance.now();
    const payload = req.payload as NarrationPayload;
    const decision = route(req.task, { escalate: payload.escalate });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: 'user',
            content: `${req.instruction ?? 'Narrate the following analysis payload.'}\n\n<payload>\n${JSON.stringify(
              payload,
              null,
              2,
            )}\n</payload>`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API returned ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage?: { output_tokens?: number };
    };
    const text = json.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('\n')
      .trim();

    return {
      text,
      model: this.model,
      tier: decision.tier,
      deployment: 'api',
      residency: 'US / provider-managed',
      latencyMs: Math.round(performance.now() - started),
      costInr: estimateCostInr(decision, text),
      trace: [
        `route: task=${req.task} → ${decision.tier}`,
        `provider: anthropic (${this.model}) — live generation`,
        'constraint: system prompt forbids introducing authority absent from the payload',
        'note: citations rendered in the interface are constructed from retrieval, not from this response',
      ],
    };
  }
}
