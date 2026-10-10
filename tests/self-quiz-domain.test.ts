import {test} from 'node:test';
import assert from 'node:assert/strict';
import {choiceItems,publicQuestions,quizResult,quizSettingsSchema,validateGeneratedQuiz,validateQuizAnswers,writtenItems,type QuizQuestion} from '../src/lib/self-quiz-domain';

const settings=quizSettingsSchema.parse({mode:'reasoning',difficulty:'medium',count:5,format:'choice',timed:false,minutes:10,topics:['logical']});
const scope={goal:'Reasoning',version:null,skills:[],topics:['logical']};
const question=(i:number):QuizQuestion=>({id:`q${i}`,text:`Original reasoning problem ${i}`,topic:'logical',milestoneId:'',options:['First','Second','Third','Fourth'],answer:1,explanation:'Second follows the given premises.',referenceAnswer:'',rubric:[]});
const quiz={title:'Practice',instructions:'Choose one answer.',questions:Array.from({length:5},(_,i)=>question(i))};
test('generated quizzes enforce count, scope, unique questions and valid answer keys',()=>{
  assert.equal(validateGeneratedQuiz(quiz,settings,scope).questions.length,5);
  for(const questions of [quiz.questions.slice(1),[...quiz.questions.slice(1),quiz.questions[1]],quiz.questions.map((q,i)=>i? q:{...q,answer:4}),quiz.questions.map((q,i)=>i?q:{...q,topic:'verbal'}),quiz.questions.map((q,i)=>i?q:{...q,options:['same','Same']})])assert.throws(()=>validateGeneratedQuiz({...quiz,questions},settings,scope));
  assert.throws(()=>validateGeneratedQuiz(quiz,settings,scope,[quiz.questions[0].text.toUpperCase()]));
  assert.throws(()=>validateGeneratedQuiz(quiz,{...settings,topics:['logical','verbal']},{...scope,topics:['logical','verbal']}));
});
test('in-progress questions cannot disclose answer key, explanations or grading rubric',()=>{
  const safe=publicQuestions(quiz.questions);assert.deepEqual(Object.keys(safe[0]).sort(),['id','milestoneId','options','text','topic']);
});
test('answers reject unknown questions, wrong types, invalid indexes and oversized text',()=>{
  for(const a of [{other:0},{q0:99},{q0:-1},{q0:1.5},{q0:'1'}])assert.throws(()=>validateQuizAnswers(a,quiz.questions,'choice'));
  assert.throws(()=>validateQuizAnswers({q0:'x'.repeat(2001)},quiz.questions,'written'));
  assert.deepEqual(validateQuizAnswers({q0:0},quiz.questions,'choice'),{q0:0});
});
test('multiple choice gives no credit for unanswered questions and computes topic weaknesses',()=>{
  const answers={q0:1,q1:0};const r=quizResult(quiz.questions,answers,choiceItems(quiz.questions,answers),true);
  assert.deepEqual([r.earned,r.possible,r.percentage,r.answered,r.expired],[1,5,20,2,true]);assert.deepEqual(r.weakTopics,['logical']);
});
const written:QuizQuestion={...question(0),options:[],answer:-1,referenceAnswer:'Use evidence and a conclusion.',rubric:[{criterion:'Evidence',points:2,description:'Uses a premise.'},{criterion:'Conclusion',points:1,description:'Draws a conclusion.'}]};
const feedback={items:[{id:'q0',feedback:'Explain your conclusion next time.',criteria:[{criterion:'Evidence',earned:2,quote:'given premise',reason:'Uses the evidence.'},{criterion:'Conclusion',earned:0,quote:'',reason:'Missing conclusion.'}]}]};
test('written credit must use exact learner quotes and never exceed frozen rubric points',()=>{
  const items=writtenItems(feedback,[written],{q0:'I use the given premise.'});assert.equal(items[0].earned,2);assert.equal(items[0].possible,3);
  for(const patch of [{earned:3},{quote:'fabricated quote'},{criterion:'Unknown criterion'},{quote:''}]){const bad=structuredClone(feedback);Object.assign(bad.items[0].criteria[0],patch);assert.throws(()=>writtenItems(bad,[written],{q0:'I use the given premise.'}));}
  assert.throws(()=>writtenItems({items:[...feedback.items,...feedback.items]},[written],{q0:'given premise'}));
  assert.throws(()=>writtenItems({items:[]},[written],{q0:'given premise'}));
  assert.equal(writtenItems({items:[]},[written],{})[0].earned,0);
});
test('settings enforce topic selection, unique milestones and bounded time/count',()=>{
  for(const patch of [{count:100},{minutes:0},{topics:[]},{topics:['logical','logical']},{mode:'roadmap'},{milestoneIds:['a','a']}])assert.equal(quizSettingsSchema.safeParse({...settings,...patch}).success,false);
});
