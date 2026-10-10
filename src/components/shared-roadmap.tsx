'use client';
import {useEffect,useState} from 'react';
import {Compass} from 'lucide-react';
import {api} from '@/lib/client';
import type {Graph} from '@/lib/domain';
import {Feedback,Loading} from './workspace';
export function SharedRoadmap({token}:{token:string}){
  const [data,setData]=useState<{graph:Graph;origin:string;version:number;hoursPerWeek:number}|null>(null),[error,setError]=useState('');
  useEffect(()=>{void api<{graph:Graph;origin:string;version:number;hoursPerWeek:number}>(`shared/${token}`).then(setData).catch(e=>setError(e.message));},[token]);
  return <main className="shared-page"><a href="/" className="brand"><Compass/>Pathfinder</a><Feedback error={error}/>{!data?!error&&<Loading/>:<><p className="tag spaced">Read-only roadmap snapshot</p><h1>{data.graph.title}</h1><p className="muted">{data.graph.summary}</p><p className="notice">Revision {data.version} · {data.origin==='ai'?'AI-generated':'Learner-created'} · {data.hoursPerWeek} planned hours/week. This snapshot does not show personal progress or evidence.</p><ol className="shared-milestones">{[...data.graph.milestones].sort((a,b)=>a.phase-b.phase).map(n=><li key={n.id}><span className="badge">{n.phaseTitle} · {n.kind} · {n.hours} hours</span><h2>{n.title}</h2><p>{n.description}</p><p><strong>Deliverable:</strong> {n.deliverable}</p><p className="muted">{n.prerequisites.length?`Requires ${n.prerequisiteMode==='all'?'all':'any'}: ${n.prerequisites.map(id=>data.graph.milestones.find(item=>item.id===id)?.title).join(', ')}`:'No prerequisites'}</p></li>)}</ol><h2>Assumptions</h2><ul>{data.graph.assumptions.map((a,i)=><li key={i}>{a}</li>)}</ul></>}</main>;
}
