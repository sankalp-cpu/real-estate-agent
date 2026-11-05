import { getDb } from '../../lib/db.ts';
import { currentUser, listUsers } from '../../lib/session.ts';
import { Access } from './Access.tsx';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await currentUser();
  if (!['admin', 'head_of_legal'].includes(user.role)) return <><h1 className="page-heading">Access</h1><p className="notice">Only the General Counsel and Administrator demo identities can inspect access settings.</p></>;
  const db = getDb();
  return <Access users={listUsers()} matters={db.prepare('SELECT id,title,reference FROM matters').all()} permissions={db.prepare('SELECT * FROM matter_access').all()}/>;
}
