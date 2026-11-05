import { getDb } from '../../lib/db.ts';
import { listTemplates } from '../../lib/drafting.ts';
import { Draft } from './Draft.tsx';
export const dynamic = 'force-dynamic';
export default function Page() { return <Draft templates={listTemplates(getDb())}/>; }
