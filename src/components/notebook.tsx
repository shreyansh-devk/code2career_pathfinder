'use client';
import {useCallback,useEffect,useState} from 'react';
import {api} from '@/lib/client';
import {Feedback,Loading,PageHeading} from './workspace';
type Entry={question_id:string;note:string;reviewed:boolean;question:{text:string;topic:string;options:string[];answer:number;explanation:string}};
export function Notebook(){
  const [entries,setEntries]=useState<Entry[]|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const refresh=useCallback(async()=>setEntries((await api<{entries:Entry[]}>('notebook')).entries),[]);
  useEffect(()=>{void refresh().catch(e=>setError(e.message));},[refresh]);
  return <><PageHeading title="Error notebook" description="Missed diagnostic questions become revision items. Record what you learned and mark a question reviewed."/><Feedback error={error}/>{message&&<p role="status" className="success">{message}</p>}{!entries?!error&&<Loading/>:entries.length?entries.map(e=><article className="review-card" key={e.question_id}><span className="badge">{e.question.topic} · {e.reviewed?'Reviewed':'Needs revision'}</span><h2 className="spaced">{e.question.text}</h2><p><strong>Answer: {e.question.options[e.question.answer]}</strong></p><p>{e.question.explanation}</p><form className="stack" onSubmit={async event=>{event.preventDefault();const f=new FormData(event.currentTarget);setBusy(true);setError('');try{await api('notebook',{questionId:e.question_id,note:f.get('note'),reviewed:f.get('reviewed')==='on'});await refresh();setMessage('Revision note saved.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><label>My revision note<textarea name="note" rows={2} maxLength={2000} defaultValue={e.note}/></label><label className="checkbox-label"><input name="reviewed" type="checkbox" defaultChecked={e.reviewed}/>I have reviewed this question.</label><button disabled={busy}>Save revision note</button></form></article>):<p className="empty-message">Complete a diagnostic to see questions you need to revisit.</p>}</>;
}
