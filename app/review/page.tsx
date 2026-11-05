import { workspaceData } from '../../lib/workspace.ts';
import { Review } from './Review.tsx';
export const dynamic = 'force-dynamic';
export default async function Page() { return <Review {...await workspaceData()}/>; }
