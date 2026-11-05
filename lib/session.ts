/**
 * Session and access scoping.
 *
 * The prototype answers the "five shared accounts" problem by giving every person
 * their own identity and scoping what they can reach. There is no password: this
 * is a demonstration, and a login form would add friction to a walkthrough without
 * demonstrating anything. Production uses SSO — see docs/PRD.md §7.
 */

import { cookies } from 'next/headers';
import { getDb } from './db.ts';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'head_of_legal' | 'counsel' | 'paralegal' | 'panel_counsel' | 'admin';
  designation: string;
  office: string;
  initials: string;
};

export const SESSION_COOKIE = 'rea_user';
const DEFAULT_USER = 'u-head';

export function listUsers(): User[] {
  return getDb().prepare('SELECT * FROM users ORDER BY role, name').all() as User[];
}

export async function currentUser(): Promise<User> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value ?? DEFAULT_USER;
  const db = getDb();
  const user =
    (db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined) ??
    (db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER) as User);
  return user;
}

/**
 * Matters this user may reach. Panel counsel are confined to the matters they are
 * engaged on; everyone else in the department sees the department's book of work.
 */
export function visibleMatterIds(user: User): string[] | null {
  if (user.role === 'panel_counsel') {
    return (
      getDb()
        .prepare('SELECT matter_id FROM matter_access WHERE user_id = ?')
        .all(user.id) as Array<{ matter_id: string }>
    ).map((r) => r.matter_id);
  }
  return null; // null means unrestricted
}

export function canReachMatter(user: User, matterId: string): boolean {
  const scope = visibleMatterIds(user);
  return scope === null || scope.includes(matterId);
}

export const ROLE_LABEL: Record<User['role'], string> = {
  head_of_legal: 'Head of Legal',
  counsel: 'Counsel',
  paralegal: 'Legal Executive',
  panel_counsel: 'Panel Counsel (external)',
  admin: 'Administrator',
};
