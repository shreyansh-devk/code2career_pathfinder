'use client';
import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { api } from '@/lib/client';
import { Feedback, Loading, PageHeading } from './workspace';
import {Directory} from './directory';
type AdminData = { flags:{ key:string;enabled:boolean }[];counts:{ users:number;roadmaps:number;evidence:number };events:{ action:string;created_at:string }[];services:Record<string,string> };
export function AdminWorkspace(){
  const [data,setData]=useState<AdminData|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const refresh=useCallback(async()=>setData(await api<AdminData>('admin')),[]);
  useEffect(()=>{void refresh().catch(e=>setError(e.message));},[refresh]);
  return <><PageHeading title="Platform operations" description="Control new feature activity and inspect service readiness without opening private learner plans."/><Feedback error={error}/>{message&&<p role="status" className="success">{message}</p>}{!data?!error&&<Loading/>:<>
    <section className="operations-section"><h2><ShieldCheck size={22}/>Service configuration</h2><dl className="service-list">{Object.entries(data.services).map(([key,value])=><div key={key}><dt>{key==='ai'?'AI generation':key==='identity'?'Identity':'Database'}</dt><dd>{value}</dd></div>)}</dl><p className="notice">Configuration presence is not a health check. Managed-service and AI workflows must pass live verification before production release.</p></section>
    <section className="operations-section"><h2>Release controls</h2><p className="muted">Pause new activity while keeping saved roadmaps, evidence and completed results available.</p>{data.flags.map(flag=><div className="flag-row" key={flag.key}><div><h3>{({roadmap_generation:'AI generation',solo_practice:'New solo practice attempts',classroom_quiz:'New classroom rooms',discussion_practice:'New discussion sessions and turns'} as Record<string,string>)[flag.key]}</h3><p>{flag.key==='roadmap_generation'?'Requires a configured API key and model as well as this switch. Saved advice and feedback stay available.':'Saved work remains accessible when new activity is paused.'}</p></div><button role="switch" aria-checked={flag.enabled} aria-label={flag.key.replaceAll('_',' ')} disabled={busy} className={flag.enabled?'switch enabled':'switch'} onClick={async()=>{setBusy(true);setError('');try{await api('admin/flag',{ key:flag.key,enabled:!flag.enabled });await refresh();setMessage('Release control updated and recorded in the audit log.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><span/>{flag.enabled?'Enabled':'Paused'}</button></div>)}</section>
    <Directory/>
    <section className="operations-section"><h2>Workspace totals</h2><dl className="summary-facts"><div><dt>Accounts</dt><dd>{data.counts.users}</dd></div><div><dt>Saved roadmaps</dt><dd>{data.counts.roadmaps}</dd></div><div><dt>Evidence items</dt><dd>{data.counts.evidence}</dd></div></dl></section>
    <section className="operations-section"><h2><Activity size={22}/>Recent audit events</h2><p className="muted">Event types and timestamps only. Learner content, credentials and provider responses are excluded.</p><div className="table-wrap"><table><thead><tr><th scope="col">Event</th><th scope="col">Recorded at</th></tr></thead><tbody>{data.events.map((event,i)=><tr key={i}><td><code>{event.action}</code></td><td>{new Date(event.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </>}</>;
}
