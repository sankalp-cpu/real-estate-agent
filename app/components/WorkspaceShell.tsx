'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8v.5Z"/>,
    vault: <><rect x="4" y="7" width="16" height="14" rx="2"/><path d="M3 3h18v4H3zM9 11h6"/></>,
    table: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></>,
    workflow: <><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h6v12"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/></>,
    shield: <><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z"/><path d="m8 12 3 3 5-6"/></>,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    arrow: <path d="M12 19V5m-6 6 6-6 6 6"/>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/></>,
    clip: <path d="m20 11-8 8a5 5 0 0 1-7-7L15 2a3 3 0 0 1 4 4L9 16a1 1 0 0 1-2-2l9-9"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.file}</svg>;
}

const links = [
  ['/', 'Assistant', 'chat'], ['/vault', 'Vault', 'vault'], ['/review', 'Tabular Review', 'table'],
  ['/workflows', 'Workflows', 'workflow'], ['/draft', 'Draft', 'file'], ['/access', 'Access', 'lock'],
  ['/control-room', 'Control Room', 'shield'],
];
const steps = [
  ['Welcome to Real Estate agent', 'A quick tour of what is here and where to find it. About a minute, and you can leave at any point.', ''],
  ['This is the chat panel', 'Ask about a matter, research a proposition, and open the source behind every answer.', 'nav-Assistant'],
  ['Your matters live here', 'Choose a matter to keep questions grounded in its documents. Access is scoped to your selected demo identity.', 'matter-list'],
  ['The Vault holds every document', 'Search the repository, inspect scanned passages and open documents alongside your work.', 'nav-Vault'],
  ['Here is where you do legal review', 'Compare documents side by side. Every extracted answer links back to the passage it came from.', 'nav-Tabular Review'],
  ['Here is where you draft contracts', 'Use approved templates and clauses, fill matter variables, and review departures from the standard.', 'nav-Draft'],
  ['Research a proposition', 'The research engine checks the indexed case law, including contrary and overruled authority. It says when nothing is found.', 'nav-Assistant'],
  ['The Control Room', 'See the actual provider configuration and audit activity. Sample records and live requests are distinguished.', 'nav-Control Room'],
  ['That is the tour', 'This demo uses public judgments and synthetic documents, not live matter data. Case passages are editorial summaries. Always verify before filing.', ''],
];

export function WorkspaceShell({ children, user, users, matters }: { children: React.ReactNode; user: any; users: any[]; matters: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  useEffect(() => { if (!localStorage.getItem('rea-tour-seen')) setTour(0); }, []);
  useEffect(() => {
    const id = tour === null ? '' : steps[tour][2];
    const el = id ? document.getElementById(id) : null;
    setAnchor(el?.getBoundingClientRect() ?? null);
    el?.classList.add('tour-target');
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') finishTour(); };
    document.addEventListener('keydown', esc);
    return () => { el?.classList.remove('tour-target'); document.removeEventListener('keydown', esc); };
  }, [tour, collapsed]);
  function finishTour() { setTour(null); localStorage.setItem('rea-tour-seen', '1'); }
  function switchUser(id: string) {
    document.cookie = `rea_user=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
    setMenu(false); router.refresh();
  }
  return <div className={`workspace ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="sidebar">
      <div className="brand-row"><Link href="/" className="brand">{collapsed ? 'RE' : 'Real Estate agent'}</Link><button aria-label="Toggle sidebar" onClick={() => setCollapsed(!collapsed)}><Icon name="panel"/></button></div>
      <Link href="/?new=1" className="new-chat"><Icon name="plus"/><span>New chat</span></Link>
      <nav>{links.map(([href, label, icon]) => <Link id={`nav-${label}`} key={href} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`} title={label}><Icon name={icon}/><span>{label}</span></Link>)}</nav>
      <div id="matter-list" className="matter-list"><div className="sidebar-label">Matters <span>⌄</span></div>{matters.map(m => <Link key={m.id} href={`/?matter=${m.id}`} className="matter-item" title={m.title}><Icon name="folder"/><span>{m.title}</span></Link>)}</div>
      <div className="recents"><div className="sidebar-label">Recents</div><small>Demo prompts</small>{['Rao notice · possession delay', 'Lock-in across commercial leases', 'Have we faced this before?', 'Liquidated damages cap'].map(t => <Link key={t} href={`/?prompt=${encodeURIComponent(t)}`}><span className="recent-dot"/> {t}</Link>)}</div>
      <div className="sidebar-bottom"><button className="tour-trigger" onClick={() => { setCollapsed(false); setTour(0); }}>ⓘ <span>Take a guided tour</span></button><button className="profile" onClick={() => setMenu(!menu)} aria-label="Switch demo user"><span className="avatar">{user.initials}</span><span><b>{user.name}</b><small>{user.designation}</small></span><span>⌄</span></button>{menu && <div className="user-menu"><small>Switch demo identity · not production authentication</small>{users.map(u => <button key={u.id} onClick={() => switchUser(u.id)}><span className="avatar">{u.initials}</span><span>{u.name}<small>{u.designation}</small></span>{u.id === user.id && '✓'}</button>)}</div>}</div>
    </aside>
    <main className={pathname === '/' ? 'main-workspace' : 'main-workspace content-page'}>{children}</main>
    {tour !== null && <div className="tour-overlay" role="presentation" onClick={finishTour}>
      <section role="dialog" aria-modal="true" aria-label="Guided tour" className={`tour-card ${anchor ? 'anchored' : ''}`} style={anchor ? { left: Math.min(anchor.right + 20, window.innerWidth - 430), top: Math.min(Math.max(24, anchor.top - 20), window.innerHeight - 290) } : {}} onClick={e => e.stopPropagation()}>
        <div className="tour-top"><span>REAL ESTATE AGENT · {tour + 1} / {steps.length}</span><button aria-label="Close tour" onClick={finishTour}>×</button></div><h2>{steps[tour][0]}</h2><p>{steps[tour][1]}</p><div className="tour-footer"><button onClick={finishTour}>Skip tour</button><div>{tour > 0 && <button onClick={() => setTour(tour - 1)}>Back</button>}<button className="primary" autoFocus onClick={() => tour === steps.length - 1 ? finishTour() : setTour(tour + 1)}>{tour === steps.length - 1 ? 'Get started' : 'Next'} →</button></div></div>
      </section>
    </div>}
  </div>;
}
