import {z} from 'zod';

export const reasoningTopics=['quantitative','logical','verbal'] as const;
export const quizSettingsSchema=z.object({
  mode:z.enum(['roadmap','reasoning']),difficulty:z.enum(['easy','medium','hard']),
  count:z.union([z.literal(5),z.literal(10)]),format:z.enum(['choice','written']),
  timed:z.boolean(),minutes:z.number().int().min(5).max(60),
  roadmapId:z.string().max(64).optional(),milestoneIds:z.array(z.string().max(64)).max(80).default([]),
  topics:z.array(z.enum(reasoningTopics)).max(3).default([]),
}).strict().superRefine((s,c)=>{
  if(s.mode==='roadmap'&&!s.roadmapId)c.addIssue({code:'custom',message:'Choose a roadmap.',path:['roadmapId']});
  if(s.mode==='reasoning'&&(!s.topics.length||new Set(s.topics).size!==s.topics.length))c.addIssue({code:'custom',message:'Choose distinct reasoning topics.',path:['topics']});
  if(new Set(s.milestoneIds).size!==s.milestoneIds.length)c.addIssue({code:'custom',message:'Choose distinct milestones.',path:['milestoneIds']});
});
export type QuizSettings=z.infer<typeof quizSettingsSchema>;
export type QuizScope={goal:string;version:number|null;skills:{id:string;title:string;description:string}[];topics:string[]};
const text=(max:number)=>z.string().trim().min(1).max(max);
export const generatedQuizSchema=z.object({
  title:text(160),instructions:text(700),questions:z.array(z.object({
    id:text(64).regex(/^[a-zA-Z0-9_-]+$/),text:text(2000),topic:text(160),milestoneId:z.string().max(64),
    options:z.array(text(500)).max(6),answer:z.number().int().min(-1).max(5),explanation:text(1600),
    referenceAnswer:z.string().trim().max(2400),rubric:z.array(z.object({criterion:text(100),points:z.number().int().min(1).max(10),description:text(400)})).max(4),
  })).min(5).max(10),
});
export type QuizQuestion=z.infer<typeof generatedQuizSchema>['questions'][number];
export type QuizAnswers=Record<string,number|string>;
export type QuestionResult={id:string;earned:number;possible:number;correct:boolean;feedback:string;criteria?:{criterion:string;earned:number;possible:number;quote:string;reason:string}[]};
export type QuizResult={earned:number;possible:number;percentage:number;answered:number;total:number;items:QuestionResult[];topics:{topic:string;earned:number;possible:number;percentage:number}[];weakTopics:string[];expired:boolean};
export type QuizSummary={id:string;title:string;mode:QuizSettings['mode'];settings:QuizSettings;scope:QuizScope;created_at:string;attempt_count:number};
export type AttemptSummary={id:string;quiz_id:string;title:string;mode:string;status:string;started_at:string;result:QuizResult|null};
export type PracticeOverview={quizzes:QuizSummary[];attempts:AttemptSummary[];completed:number;average:number|null;weakTopics:string[]};
export type PublicQuestion=Pick<QuizQuestion,'id'|'text'|'topic'|'milestoneId'|'options'>;
export function publicQuestions(questions:QuizQuestion[]):PublicQuestion[]{return questions.map(({id,text,topic,milestoneId,options})=>({id,text,topic,milestoneId,options}));}
export function validateGeneratedQuiz(input:unknown,settings:QuizSettings,scope:QuizScope,previous:string[]=[]){
  const quiz=generatedQuizSchema.parse(input),ids=new Set<string>(),stems=new Set(previous.map(t=>t.trim().toLowerCase()));
  if(quiz.questions.length!==settings.count)throw new Error('Question count does not match the request.');
  for(const q of quiz.questions){
    const stem=q.text.toLowerCase();
    if(ids.has(q.id)||stems.has(stem))throw new Error('Duplicate question.');
    ids.add(q.id);stems.add(stem);
    if(settings.mode==='roadmap'&&!scope.skills.some(s=>s.id===q.milestoneId&&s.title===q.topic))throw new Error('Question outside the selected skills.');
    if(settings.mode==='reasoning'&&(q.milestoneId!==''||!scope.topics.includes(q.topic)))throw new Error('Question outside the selected topics.');
    if(settings.format==='choice'){
      if(q.options.length<2||q.answer<0||q.answer>=q.options.length||new Set(q.options.map(o=>o.toLowerCase())).size!==q.options.length||q.rubric.length||q.referenceAnswer)throw new Error('Invalid multiple-choice answer key.');
    }else if(q.options.length||q.answer!==-1||!q.referenceAnswer||q.rubric.length<2||new Set(q.rubric.map(r=>r.criterion)).size!==q.rubric.length)throw new Error('Invalid written-answer rubric.');
  }
  const expectedTopics=settings.mode==='roadmap'?scope.skills.map(s=>s.title):scope.topics;
  if(expectedTopics.length<=settings.count&&expectedTopics.some(t=>!quiz.questions.some(q=>q.topic===t)))throw new Error('A selected topic was omitted.');
  return quiz;
}
export function validateQuizAnswers(input:unknown,questions:QuizQuestion[],format:QuizSettings['format']):QuizAnswers{
  const answers=z.record(z.string(),z.union([z.number().int(),z.string().max(2000)])).parse(input);
  for(const [id,value] of Object.entries(answers)){
    const q=questions.find(q=>q.id===id);if(!q)throw new Error('Unknown question.');
    if(format==='choice'&&(typeof value!=='number'||value<0||value>=q.options.length))throw new Error('Choose a valid answer.');
    if(format==='written'&&typeof value!=='string')throw new Error('Use a written answer.');
  }
  return answers;
}
export const writtenGradeSchema=z.object({items:z.array(z.object({id:text(64),feedback:text(1000),criteria:z.array(z.object({criterion:text(100),earned:z.number().int().min(0).max(10),quote:z.string().max(2000),reason:text(500)})).min(2).max(4)})).max(10)});
export function writtenItems(input:unknown,questions:QuizQuestion[],answers:QuizAnswers):QuestionResult[]{
  const grade=writtenGradeSchema.parse(input),answered=questions.filter(q=>typeof answers[q.id]==='string'&&String(answers[q.id]).trim());
  if(grade.items.length!==answered.length||new Set(grade.items.map(i=>i.id)).size!==grade.items.length||grade.items.some(i=>!answered.some(q=>q.id===i.id)))throw new Error('Feedback must cover each answered question exactly once.');
  return questions.map(q=>{
    const item=grade.items.find(i=>i.id===q.id),possible=q.rubric.reduce((s,r)=>s+r.points,0);
    if(!item)return {id:q.id,earned:0,possible,correct:false,feedback:'No answer submitted.'};
    if(item.criteria.length!==q.rubric.length||new Set(item.criteria.map(c=>c.criterion)).size!==item.criteria.length)throw new Error('Feedback must follow the saved rubric.');
    const criteria=item.criteria.map(c=>{
      const rule=q.rubric.find(r=>r.criterion===c.criterion);
      if(!rule||c.earned>rule.points||c.earned>0&&(!c.quote.trim()||!String(answers[q.id]).includes(c.quote)))throw new Error('Unsupported rubric credit.');
      return {...c,possible:rule.points};
    });
    const earned=criteria.reduce((s,c)=>s+c.earned,0);return {id:q.id,earned,possible,correct:earned===possible,feedback:item.feedback,criteria};
  });
}
export function choiceItems(questions:QuizQuestion[],answers:QuizAnswers):QuestionResult[]{return questions.map(q=>({id:q.id,earned:answers[q.id]===q.answer?1:0,possible:1,correct:answers[q.id]===q.answer,feedback:q.explanation}));}
export function quizResult(questions:QuizQuestion[],answers:QuizAnswers,items:QuestionResult[],expired:boolean):QuizResult{
  const topics=[...new Set(questions.map(q=>q.topic))].map(topic=>{
    const ids=questions.filter(q=>q.topic===topic).map(q=>q.id),group=items.filter(i=>ids.includes(i.id));
    const earned=group.reduce((s,i)=>s+i.earned,0),possible=group.reduce((s,i)=>s+i.possible,0);
    return {topic,earned,possible,percentage:Math.round(earned/possible*100)};
  });
  const earned=items.reduce((s,i)=>s+i.earned,0),possible=items.reduce((s,i)=>s+i.possible,0);
  return {earned,possible,percentage:Math.round(earned/possible*100),answered:questions.filter(q=>answers[q.id]!==undefined&&String(answers[q.id]).trim()!=='').length,total:questions.length,items,topics,weakTopics:topics.filter(t=>t.percentage<70).map(t=>t.topic),expired};
}
