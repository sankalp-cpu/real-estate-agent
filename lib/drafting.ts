/**
 * Draft assembly and redline.
 *
 * A draft is a template plus a set of variable values plus a choice of clause for
 * each slot. Nothing is generated freehand: the volume work the client described —
 * "a basic MOU, a basic MSA, a basic NDA, templated but customised per iteration" —
 * is assembly, and assembly is deterministic, auditable and fast.
 */

import type { Database } from 'better-sqlite3';

export type Template = {
  id: string;
  name: string;
  doc_type: string;
  jurisdiction: string;
  version: string;
  description: string;
  variables: Array<{ key: string; label: string; example: string }>;
  body: string;
  usage_count: number;
};

export type Clause = {
  id: string;
  slot: string;
  title: string;
  body: string;
  variant: 'standard' | 'alternative' | 'counterparty_favourable';
  risk_level: 'low' | 'medium' | 'high';
  risk_note: string | null;
  usage_count: number;
};

export function getTemplate(db: Database, id: string): Template | null {
  const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as any;
  if (!row) return null;
  return { ...row, variables: JSON.parse(row.variables) };
}

export function listTemplates(db: Database): Template[] {
  return (db.prepare('SELECT * FROM templates ORDER BY usage_count DESC').all() as any[]).map(
    (r) => ({ ...r, variables: JSON.parse(r.variables) }),
  );
}

export function clausesForSlot(db: Database, slot: string): Clause[] {
  // Approved position first — it should be the path of least resistance.
  return db
    .prepare(
      `SELECT * FROM clauses WHERE slot = ?
        ORDER BY CASE variant WHEN 'standard' THEN 0 WHEN 'alternative' THEN 1 ELSE 2 END`,
    )
    .all(slot) as Clause[];
}

/** Slots referenced by a template body, in the order they appear. */
export function slotsIn(body: string): string[] {
  return [...body.matchAll(/\[\[clause:([a-z_]+)\]\]/g)].map((m) => m[1]);
}

export type AssembledDraft = {
  body: string;
  /** Slots left unfilled, and variables left blank — surfaced rather than silently empty. */
  missingVariables: string[];
  usedClauses: Clause[];
};

export function assemble(
  template: Template,
  variables: Record<string, string>,
  clauseChoices: Record<string, Clause>,
): AssembledDraft {
  let body = template.body;
  const usedClauses: Clause[] = [];

  for (const slot of slotsIn(template.body)) {
    const clause = clauseChoices[slot];
    if (clause) {
      usedClauses.push(clause);
      body = body.replace(`[[clause:${slot}]]`, clause.body);
    } else {
      body = body.replace(`[[clause:${slot}]]`, `[clause not selected: ${slot}]`);
    }
  }

  // A key placed several times in a template is one missing variable, not several.
  const missing = new Set<string>();
  body = body.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value && value.trim()) return value;
    missing.add(key);
    return `[${key}]`;
  });

  return { body, missingVariables: [...missing], usedClauses };
}

/** Fills {{variables}} in a fragment, leaving unsupplied keys visible in brackets. */
export function fillVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{([a-z_]+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value && value.trim() ? value : `[${key}]`;
  });
}

export type RedlineRow = {
  slot: string;
  standard: Clause | null;
  selected: Clause;
  deviates: boolean;
};

/**
 * Deviation from the approved position, slot by slot. The point is not to forbid
 * departure — commercial negotiation requires it — but to make it visible rather
 * than buried on page 40 of an executed contract.
 */
export function redline(
  db: Database,
  template: Template,
  clauseChoices: Record<string, Clause>,
  variables: Record<string, string> = {},
): RedlineRow[] {
  // Both sides are shown with matter variables filled, so the comparison reads as
  // the two clauses would actually appear in the executed document rather than as
  // library fragments full of placeholders.
  const filled = (c: Clause): Clause => ({ ...c, body: fillVariables(c.body, variables) });

  return slotsIn(template.body)
    .map((slot) => {
      const selected = clauseChoices[slot];
      if (!selected) return null;
      const standard = clausesForSlot(db, slot).find((c) => c.variant === 'standard') ?? null;
      return {
        slot,
        standard: standard ? filled(standard) : null,
        selected: filled(selected),
        deviates: standard ? standard.id !== selected.id : false,
      };
    })
    .filter((r): r is RedlineRow => r !== null);
}

export const SLOT_LABEL: Record<string, string> = {
  dispute_resolution: 'Governing law and dispute resolution',
  nda_definition: 'Definition of Confidential Information',
  nda_obligations: 'Confidentiality obligations',
  mou_binding_nature: 'Binding nature of the memorandum',
  security_deposit: 'Security deposit',
  lock_in: 'Lock-in and termination',
  rera_delay_defence: 'Delay defence',
  channel_partner_conduct: 'Channel partner conduct',
};
