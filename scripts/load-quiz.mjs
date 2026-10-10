import nextEnv from '@next/env';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
nextEnv.loadEnvConfig(process.cwd(),true);
const base=new URL(process.env.PATHFINDER_TEST_URL||'http://127.0.0.1:3100');
if(!['127.0.0.1','localhost'].includes(base.hostname)||base.protocol!=='http:')throw new Error('Run this synthetic load test only against an isolated local server.');
const password=process.env.DEV_ACCOUNT_PASSWORD;if(!password)throw new Error('DEV_ACCOUNT_PASSWORD is required.');
const clients=new Map();
async function call(username,path,data){const response=await fetch(new URL('/api/'+path,base),{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json',Origin:base.origin}),...(clients.has(username)?{Cookie:clients.get(username)}:{})},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(30000)});const cookie=response.headers.getSetCookie().find(c=>c.startsWith('pathfinder_session='));if(cookie)clients.set(username,cookie.split(';')[0]);return{status:response.status,value:await response.json()};}
async function login(username){const r=await call(username,'auth/login',{username,password});assert.equal(r.status,200,`Login failed for synthetic ${username}`);}
const players=Array.from({length:50},(_,i)=>`load-learner-${i+1}`),host='teacher';let room;
try{
  await login(host);const me=await call(host,'me');assert.equal(me.value.local,true,'This server must use isolated local development identity.');
  await Promise.all(players.map(login));
  const sets=await call(host,'quiz/sets');assert.equal(sets.status,200);
  const saved=await call(host,'quiz/sets',{title:'50-player repeatable load test',questions:[sets.value.starter[0]]});assert.equal(saved.status,200);
  const created=await call(host,'quiz/create',{setId:saved.value.id,seconds:120});assert.equal(created.status,200);room=created.value;
  const joins=await Promise.all(players.map(p=>call(p,'quiz/join',{code:room.code,shareName:true})));assert.ok(joins.every(r=>r.status===200));
  assert.equal((await call(host,'quiz/start',{roomId:room.id})).status,200);
  const views=await Promise.all(players.map(p=>call(p,'quiz/room/'+room.id)));assert.ok(views.every(r=>r.status===200&&r.value.question&&!('answer' in r.value.question)&&!('secret' in r.value)));
  const payloads=views.map(v=>({roomId:room.id,index:0,optionId:v.value.question.options.find(o=>o.text==='2/5').id}));
  const batchStart=performance.now();const answers=await Promise.all(players.map(async(p,i)=>{const t=performance.now(),r=await call(p,'quiz/answer',payloads[i]);return{status:r.status,ms:Math.round(performance.now()-t)};}));const batchMs=Math.round(performance.now()-batchStart);assert.ok(answers.every(r=>r.status===200));
  const duplicate=await call(players[0],'quiz/answer',payloads[0]);assert.equal(duplicate.status,409);
  const reconnect=await call(players[0],'quiz/room/'+room.id);assert.equal(reconnect.value.answered,true);
  assert.equal((await call(host,'quiz/stop',{roomId:room.id})).status,200);
  const late=await call(players[0],'quiz/answer',payloads[0]);assert.equal(late.status,409);
  const final=await call(host,'quiz/room/'+room.id);assert.equal(final.value.standings.length,50);assert.ok(final.value.standings.every(r=>r.correct===1&&r.points>=1000&&r.points<=1500));
  const times=answers.map(r=>r.ms).sort((a,b)=>a-b),report={measuredAt:new Date().toISOString(),environment:'Isolated local HTTP server, Node fetch clients. Not a production benchmark.',players:50,accepted:50,batchMs,p50Ms:times[24],p95Ms:times[47],maxMs:times[49],duplicateStatus:duplicate.status,lateStatus:late.status,reconnectAnswered:true,finalStandings:50};
  await mkdir('tests/reports',{recursive:true});await writeFile('tests/reports/quiz-load-latest.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{if(room)await call(host,'quiz/stop',{roomId:room.id}).catch(()=>{});}
