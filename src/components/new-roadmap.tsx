'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, PenLine } from 'lucide-react';
import { api } from '@/lib/client';
import { Feedback, PageHeading } from './workspace';
export function NewRoadmap() {
  const router = useRouter(),[ready,setReady] = useState(false),[mode,setMode] = useState<'manual'|'ai'>('manual'),[busy,setBusy] = useState(false),[error,setError] = useState('');
  useEffect(() => { api<{ aiReady:boolean;flags:{ key:string;enabled:boolean }[] }>('me').then(data=>setReady(data.aiReady && data.flags.some(f=>f.key==='roadmap_generation'&&f.enabled))).catch(e=>setError(e.message)); },[]);
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');const f = new FormData(event.currentTarget);
    try {
      const data = await api<{ roadmap:{ id:string } }>('roadmaps',{ mode,intake:{ goal:f.get('goal'),background:f.get('background'),hoursPerWeek:Number(f.get('hours')),targetMonths:Number(f.get('months')),budget:f.get('budget') },...(mode==='manual' ? { firstTitle:f.get('firstTitle'),firstHours:Number(f.get('firstHours')) } : {}) });
      router.push(`/app/roadmaps/${data.roadmap.id}`);
    } catch(e) { setError((e as Error).message);setBusy(false); }
  }
  return <><Link className="back-link" href="/app/roadmaps"><ArrowLeft size={17} />My roadmaps</Link><PageHeading title="Give your goal a direction" description="A specific role leads to more useful skills and projects." />
  <form className="intake-form" onSubmit={submit}><fieldset disabled={busy}><div className="form-section"><h2>Where do you want to go?</h2><label>Exact target role<input name="goal" required minLength={3} maxLength={180} placeholder="For example, backend engineer building payment systems" /></label><label>Your starting point<span className="field-hint">Skills you know and projects you have tried. Keep personal details out.</span><textarea name="background" maxLength={1200} rows={3} placeholder="I know Python basics and have built a small REST API." /></label></div>
    <div className="form-section"><h2>Make room for the work</h2><div className="form-grid"><label>Hours available per week<input name="hours" type="number" required min={1} max={60} defaultValue={8} /></label><label>Target timeline, in months<input name="months" type="number" required min={1} max={36} defaultValue={6} /></label><label>Learning budget<select name="budget" defaultValue="free"><option value="free">Free resources</option><option value="flexible">Open to paid resources</option></select></label></div><p className="muted">Estimates show the remaining workload. A target date does not guarantee readiness or a job.</p></div>
    <div className="form-section"><h2>Choose how to start</h2><div className="mode-options"><label className={mode==='manual' ? 'mode-option selected' : 'mode-option'}><input type="radio" name="mode" value="manual" checked={mode==='manual'} onChange={()=>setMode('manual')} /><PenLine size={20} /><span><strong>Build my own plan</strong><small>Start with one skill, then add connected milestones.</small></span></label><label className={mode==='ai' ? 'mode-option selected' : 'mode-option'}><input type="radio" name="mode" value="ai" checked={mode==='ai'} disabled={!ready} onChange={()=>setMode('ai')} /><Sparkles size={20} /><span><strong>Generate with AI</strong><small>{ready ? 'Use your goal and context to generate a new plan.' : 'Unavailable until API key and model are configured.'}</small></span></label></div>
    {mode==='manual' ? <div className="manual-start"><label>First skill or milestone<input name="firstTitle" required minLength={3} maxLength={160} placeholder="For example, HTTP and API design fundamentals" /></label><label>Estimated hours for this milestone<input name="firstHours" type="number" required min={1} max={200} defaultValue={12} /></label></div> : <p className="notice">Your goal and starting-point text will be sent to the configured AI provider. AI advice can be wrong. Resource suggestions are not verified citations.</p>}</div></fieldset>
    <Feedback error={error} /><div className="form-footer"><span className="muted">Your roadmap is private to your account.</span><button className="primary" disabled={busy}>{busy ? mode==='ai' ? 'Generating and validating…' : 'Saving your plan…' : mode==='ai' ? 'Generate roadmap' : 'Create my plan'}<ArrowRight size={17} /></button></div>
  </form></>;
}
