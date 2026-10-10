import {z} from 'zod';
export type Participant={id:string;name:string;perspective:string};
export type Turn={id:string;speaker:string;text:string;createdAt:string};
export const roundSchema=z.object({responses:z.array(z.object({speaker:z.string().max(40),text:z.string().min(10).max(900)})).min(4).max(6)});
export const feedbackSchema=z.object({summary:z.string().min(10).max(1200),assessments:z.array(z.object({criterion:z.enum(['Clarity','Reasoning','Collaboration','Relevance']),score:z.number().int().min(0).max(5),rationale:z.string().min(10).max(600),evidence:z.array(z.object({turnId:z.string().max(64),quote:z.string().min(5).max(200)})).min(1).max(3)})).length(4),nextActions:z.array(z.string().min(10).max(400)).min(2).max(5)});
export type DiscussionFeedback=z.infer<typeof feedbackSchema>;
export function validateFeedback(input:unknown,turns:Turn[]):DiscussionFeedback{
  const feedback=feedbackSchema.parse(input);
  if(new Set(feedback.assessments.map(a=>a.criterion)).size!==4)throw new Error('Each criterion must appear once.');
  for(const assessment of feedback.assessments)for(const evidence of assessment.evidence){const turn=turns.find(t=>t.id===evidence.turnId&&t.speaker==='learner');if(!turn||!turn.text.includes(evidence.quote))throw new Error('Feedback must quote an exact substring of a learner turn.');}
  return feedback;
}
export function wordDistribution(turns:Turn[]){const counts:Record<string,number>={};for(const t of turns)counts[t.speaker]=(counts[t.speaker]||0)+t.text.trim().split(/\s+/).filter(Boolean).length;const total=Object.values(counts).reduce((a,b)=>a+b,0);return Object.entries(counts).map(([speaker,words])=>({speaker,words,percent:total?Math.round(words/total*100):0}));}
