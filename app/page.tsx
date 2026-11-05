import { workspaceData } from '../lib/workspace.ts';
import { Assistant } from './components/Assistant.tsx';
export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: { searchParams: Promise<{ matter?: string; prompt?: string; new?: string }> }) {
  const params = await searchParams;
  const data = await workspaceData();
  return <Assistant key={`${data.user.id}-${params.matter}-${params.new}-${params.prompt}`} {...data} selectedId={params.matter} initialPrompt={params.prompt}/>;
}
