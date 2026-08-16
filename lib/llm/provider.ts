/**
 * Model provider interface and routing.
 *
 * The routing tiers mirror docs/PRD.md §5. The point of the tiering is the point
 * the client made in the meeting: a legal analysis agent does not need to also be
 * an expert physician. Volume work runs on a small local model; only genuinely
 * hard reasoning escalates.
 */

export type Task =
  | 'proposition_analysis'
  | 'pleading_analysis'
  | 'draft_generation'
  | 'summarisation'
  | 'extraction';

export type Tier = 'tier-1' | 'tier-2' | 'tier-3';

export type RouteDecision = {
  tier: Tier;
  model: string;
  deployment: 'on-premise' | 'india-region-cloud';
  residency: string;
  rationale: string;
  /** Indicative rupees per 1k output tokens, used for the cost telemetry. */
  ratePer1k: number;
};

export type GenerateRequest = {
  task: Task;
  /** Structured facts assembled from retrieval. The provider narrates these; it does not invent them. */
  payload: unknown;
  /** Free-text instruction for the live provider. Ignored by the fixture provider. */
  instruction?: string;
};

export type GenerateResult = {
  text: string;
  model: string;
  tier: Tier;
  deployment: string;
  residency: string;
  latencyMs: number;
  costInr: number;
  trace: string[];
};

export interface Provider {
  readonly name: string;
  generate(req: GenerateRequest): Promise<GenerateResult>;
}

const ROUTES: Record<Task, RouteDecision> = {
  draft_generation: {
    tier: 'tier-1',
    model: 'm3m-draft-8b',
    deployment: 'on-premise',
    residency: 'IN — Gurugram DC',
    rationale:
      'Templated drafting from an approved template and clause library. The document structure is fixed and the variation is in the variables, so a small local model is sufficient.',
    ratePer1k: 0.012,
  },
  summarisation: {
    tier: 'tier-1',
    model: 'm3m-draft-8b',
    deployment: 'on-premise',
    residency: 'IN — Gurugram DC',
    rationale: 'Extractive summarisation over supplied text. No reasoning over authority required.',
    ratePer1k: 0.012,
  },
  extraction: {
    tier: 'tier-1',
    model: 'm3m-draft-8b',
    deployment: 'on-premise',
    residency: 'IN — Gurugram DC',
    rationale: 'Structured extraction of grounds and clause references from a filed document.',
    ratePer1k: 0.012,
  },
  proposition_analysis: {
    tier: 'tier-2',
    model: 'm3m-legal-40b',
    deployment: 'on-premise',
    residency: 'IN — Gurugram DC',
    rationale:
      'Reasoning over retrieved authority, weighing supporting against contrary holdings and checking currency. Domain-specialised, but still within the capability of a local 40B model.',
    ratePer1k: 0.09,
  },
  pleading_analysis: {
    tier: 'tier-2',
    model: 'm3m-legal-40b',
    deployment: 'on-premise',
    residency: 'IN — Gurugram DC',
    rationale:
      'Multi-issue analysis over a filed pleading. Each ground is researched independently against the corpus and the results are assembled into a counter-argument.',
    ratePer1k: 0.09,
  },
};

export const ESCALATION: RouteDecision = {
  tier: 'tier-3',
  model: 'claude-opus-4-5',
  deployment: 'india-region-cloud',
  residency: 'IN — Mumbai region',
  rationale:
    'Escalated: the retrieved corpus did not contain authority adequate to the proposition, so the question is treated as novel and routed to a frontier model with an explicit instruction to report the absence of authority rather than supply it.',
  ratePer1k: 6.4,
};

export function route(task: Task, opts: { escalate?: boolean } = {}): RouteDecision {
  return opts.escalate ? ESCALATION : ROUTES[task];
}

export function allRoutes(): Array<{ task: Task; route: RouteDecision }> {
  return (Object.keys(ROUTES) as Task[]).map((task) => ({ task, route: ROUTES[task] }));
}

/** Indicative cost of a generation, used for the telemetry shown in the interface. */
export function estimateCostInr(route: RouteDecision, text: string): number {
  const approxTokens = Math.ceil(text.length / 4);
  return Number(((approxTokens / 1000) * route.ratePer1k).toFixed(4));
}
