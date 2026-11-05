'use client';
import { useState } from 'react';
export function Access({ users, matters, permissions }: any) {
  const [selected, setSelected] = useState(users[0]?.id);
  const user = users.find((u: any) => u.id === selected);
  const allowed = (id: string) => user.role !== 'panel_counsel' || permissions.some((p: any) => p.matter_id === id && p.user_id === selected);
  return <><div className="breadcrumb">Workspace / Access</div><h1 className="page-heading">Access</h1><p className="page-subtitle">Pick a person to see the matters they can work on.</p><div className="segmented">{users.map((u: any) => <button key={u.id} className={selected === u.id ? 'selected' : ''} onClick={() => setSelected(u.id)}>{u.name}</button>)}</div><div className="notice">Read-only permission preview. Switch demo identity in the sidebar to test server-enforced matter access. This is not production authentication.</div><h2 style={{ margin: '30px 0 15px', fontSize: 14 }}>{user.name} · {matters.filter((m: any) => allowed(m.id)).length} of {matters.length} matters accessible</h2><div style={{ maxWidth: 950 }}>{matters.map((m: any) => <div key={m.id} className="access-row"><div>{m.title}<small>{m.reference}</small></div><span className={`status-chip ${allowed(m.id) ? '' : 'warning'}`}>{allowed(m.id) ? '✓ Can access' : 'Restricted'}</span></div>)}</div></>;
}
