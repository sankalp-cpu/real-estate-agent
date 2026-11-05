import Link from 'next/link';
import { Icon } from '../components/WorkspaceShell.tsx';
export default function Workflows() {
  return <><div className="breadcrumb">Workflows /</div><h1 className="page-heading">Tasks, start to finish</h1><p className="page-subtitle">Three of the jobs the team does most often.</p><div className="workflow-grid">{[
    ['/analyst', 'file', 'Review a builder-buyer agreement', 'Check the terms against the case law. Surface unfair clauses, contrary authority and the position to take.'],
    ['/?matter=m-golf-estate&prompt=What%20does%20the%20Rao%20notice%20claim%2C%20and%20by%20when%20must%20we%20reply%3F', 'chat', 'Respond to a legal notice', 'Read the notice, establish the deadline, research the proposition and prepare a response for review.'],
    ['/draft', 'workflow', 'Produce an NDA or MOU', 'Start with an approved template. Fill the particulars, choose clauses and check the departures.'],
  ].map(([href, icon, title, desc]) => <Link key={title} href={href} className="workflow-card"><Icon name={icon} size={25}/><h2>{title}</h2><p>{desc}</p><p style={{ color: '#147a9c', marginTop: 20 }}>Start workflow →</p></Link>)}</div><p className="page-subtitle" style={{ marginTop: 30 }}>Every output is a working draft for a qualified professional. Nothing is sent or filed automatically.</p></>;
}
