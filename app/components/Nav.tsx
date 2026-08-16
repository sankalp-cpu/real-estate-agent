'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { User } from '../../lib/session.ts';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/analyst', label: 'Litigation Analyst' },
  { href: '/repository', label: 'Repository' },
  { href: '/drafting', label: 'Drafting Studio' },
  { href: '/admin', label: 'Trust & Control' },
];

const ROLE_LABEL: Record<User['role'], string> = {
  head_of_legal: 'Head of Legal',
  counsel: 'Counsel',
  paralegal: 'Legal Executive',
  panel_counsel: 'Panel Counsel — external',
  admin: 'Administrator',
};

export function Nav({ user, users }: { user: User; users: User[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function switchTo(id: string) {
    document.cookie = `m3m_user=${id}; path=/; max-age=31536000`;
    setOpen(false);
    window.location.reload();
  }

  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-6 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">M3M Legal</span>
          <span className="text-[11px] text-ink-400">Litigation Intelligence</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-ink-100 font-medium text-ink-900'
                    : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 rounded border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] font-medium tracking-wide text-ink-500"
            title="All processing on Indian infrastructure — DPDP Act data residency"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
            IN — GURUGRAM DC
          </span>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-ink-50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-[11px] font-semibold text-white">
                {user.initials}
              </span>
              <span className="text-left leading-tight">
                <span className="block text-[12px] font-medium text-ink-800">{user.name}</span>
                <span className="block text-[10px] text-ink-400">{ROLE_LABEL[user.role]}</span>
              </span>
            </button>

            {open && (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-ink-200 bg-white py-1 shadow-lg">
                <p className="border-b border-ink-100 px-3 py-2 text-[10px] uppercase tracking-wider text-ink-400">
                  Switch user — individual logins, not five shared seats
                </p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchTo(u.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-ink-50 ${
                      u.id === user.id ? 'bg-accent-50' : ''
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-200 text-[10px] font-semibold text-ink-700">
                      {u.initials}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[12px] text-ink-800">{u.name}</span>
                      <span className="block text-[10px] text-ink-400">
                        {u.designation} · {u.office}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
