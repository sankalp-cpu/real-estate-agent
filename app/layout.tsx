import type { Metadata } from 'next';
import './globals.css';
import { currentUser, listUsers } from '../lib/session.ts';
import { Nav } from './components/Nav.tsx';

export const metadata: Metadata = {
  title: 'M3M Legal — Litigation Intelligence',
  description:
    'Grounded precedent analysis, document repository and drafting studio for the M3M India legal department.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const users = listUsers();

  return (
    <html lang="en-IN">
      <body className="min-h-screen">
        <Nav user={user} users={users} />
        <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-[1400px] px-6 pb-10 pt-4">
          <p className="border-t border-ink-200 pt-4 text-[11px] leading-relaxed text-ink-400">
            Prototype. Every output is work product for review by a qualified professional and is not
            legal advice. The case-law corpus is a demonstration subset — judgments, citations and
            good-law status are accurate, but passage text is an editorial precis rather than
            verbatim judgment text. Verify against the source before filing.
          </p>
        </footer>
      </body>
    </html>
  );
}
