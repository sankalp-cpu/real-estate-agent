/**
 * Deterministic provider standing in for the on-premise model.
 *
 * It narrates a structured payload that was assembled from retrieval. It has no
 * access to anything else, so it cannot introduce a case, a citation or a holding
 * that retrieval did not return — which is the property we want to demonstrate.
 * It also runs in single-digit milliseconds, which is the latency claim made for
 * local inference.
 */

import {
  type GenerateRequest,
  type GenerateResult,
  type Provider,
  estimateCostInr,
  route,
} from './provider.ts';

export type NarrationPayload = {
  headline: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  escalate?: boolean;
};

export class FixtureProvider implements Provider {
  readonly name = 'fixture';

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const started = performance.now();
    const payload = req.payload as NarrationPayload;
    const decision = route(req.task, { escalate: payload.escalate });

    const trace = [
      `route: task=${req.task} → ${decision.tier} (${decision.model})`,
      `deployment: ${decision.deployment}, residency: ${decision.residency}`,
      `provider: fixture — narrating ${payload.sections.length} pre-assembled sections`,
      'constraint: narration is limited to the supplied payload; no external knowledge is available to this provider',
    ];

    // `headline` is context for the live provider, not body copy: the interface
    // already renders the verdict above the narrative, and repeating it here just
    // makes the reader scan the same sentence twice.
    const text = payload.sections
      .flatMap((s) => [`## ${s.heading}`, '', ...s.paragraphs, ''])
      .join('\n')
      .trim();

    // Local inference is fast but not instantaneous; a small floor keeps the
    // latency figure shown in the interface honest rather than flattering.
    const elapsed = performance.now() - started;
    const latencyMs = Math.round(elapsed + 40 + text.length / 900);

    return {
      text,
      model: `${decision.model} (${decision.deployment})`,
      tier: decision.tier,
      deployment: decision.deployment,
      residency: decision.residency,
      latencyMs,
      costInr: estimateCostInr(decision, text),
      trace,
    };
  }
}
