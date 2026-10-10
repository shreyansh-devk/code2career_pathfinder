'use client';
import {useCallback,useEffect,useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/client';
import type {QuizQuestion} from '@/lib/self-quiz-domain';
import {Feedback,Loading,PageHeading} from './workspace';
type Entry={question_id:string;note:string;reviewed:boolean;question:{text:string;topic:string;options:string[];answer:number;explanation:string}};
type PersonalEntry=Entry&{quiz_id:string;title:string;flag_reason:string;question:QuizQuestion};
type Notes={entries:Entry[];personalEntries:PersonalEntry[]};
export function Notebook(){
  const [data,setData]=useState<Notes|null>(null),[error,setError]=useState(''),[message,setMessage]=useState('');
  const refresh=useCallback(async()=>setData(await api<Notes>('notebook')),[]);
  useEffect(()=>{void refresh().catch(e=>setError(e.message));},[refresh]);
  const total=(data?.entries.length||0)+(data?.personalEntries.length||0);
  return <><PageHeading title="Mistake notebook" description="Review missed quiz questions, check flagged questions and keep your own revision notes." action={<Link className="button" href="/app/quizzes">Make a practice quiz</Link>}/><Feedback error={error}/>{message&&<p role="status" className="success">{message}</p>}{!data?!error&&<Loading/>:!total?<p className="empty-message">Missed questions from your personal quizzes and reasoning diagnostic will appear here.</p>:<>{data.personalEntries.map(e=><article className="review-card" key={`${e.quiz_id}-${e.question_id}`}><div className="section-heading"><span className="badge blue">{e.question.topic} · {e.reviewed?'Reviewed':'Needs revision'}</span><Link href={`/app/quizzes?quiz=${e.quiz_id}`}>Open quiz</Link></div><p className="field-hint">{e.title}</p>{e.flag_reason&&<p className="notice"><strong>Your question flag: </strong>{e.flag_reason}</p>}<h2 className="spaced">{e.question.text}</h2><p className="preserve-lines"><strong>{e.question.answer===-1?'Reference answer: ':'Answer: '}{e.question.answer===-1?e.question.referenceAnswer:e.question.options[e.question.answer]}</strong></p><p>{e.question.explanation}</p><RevisionNote entry={e} onSave={async(note,reviewed)=>{await api(`self-quizzes/${e.quiz_id}/note`,{questionId:e.question_id,note,reviewed});await refresh();setMessage('Revision note saved.');}}/></article>)}{data.entries.map(e=><article className="review-card" key={e.question_id}><span className="badge">{e.question.topic} · {e.reviewed?'Reviewed':'Needs revision'}</span><h2 className="spaced">{e.question.text}</h2><p><strong>Answer: {e.question.options[e.question.answer]}</strong></p><p>{e.question.explanation}</p><RevisionNote entry={e} onSave={async(note,reviewed)=>{await api('notebook',{questionId:e.question_id,note,reviewed});await refresh();setMessage('Revision note saved.');}}/></article>)}</>}</>;
}
function RevisionNote({entry:e,onSave}:{entry:Entry;onSave:(note:string,reviewed:boolean)=>Promise<void>}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <form className="stack" onSubmit={async event=>{event.preventDefault();const f=new FormData(event.currentTarget);setBusy(true);setError('');try{await onSave(String(f.get('note')||''),f.get('reviewed')==='on');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><Feedback error={error}/><label>My revision note<textarea name="note" rows={2} maxLength={2000} defaultValue={e.note}/></label><label className="checkbox-label"><input name="reviewed" type="checkbox" defaultChecked={e.reviewed}/>I have reviewed this question.</label><button disabled={busy}>Save revision note</button></form>;
}
