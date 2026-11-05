import { workspaceData } from '../../lib/workspace.ts';
import { Vault } from './Vault.tsx';
export const dynamic = 'force-dynamic';
export default async function Page() { return <Vault {...await workspaceData()}/>; }
