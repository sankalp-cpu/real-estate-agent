import type { Metadata } from 'next';
import './globals.css';
import './workspace.css';
import { listUsers } from '../lib/session.ts';
import { workspaceData } from '../lib/workspace.ts';
import { WorkspaceShell } from './components/WorkspaceShell.tsx';

export const metadata: Metadata = {
  title: 'Real Estate agent',
  description: 'A grounded legal workspace for real estate: research, review and drafting.',
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await workspaceData();
  return <html lang="en-IN"><body><WorkspaceShell user={data.user} users={listUsers()} matters={data.matters}>{children}</WorkspaceShell></body></html>;
}
