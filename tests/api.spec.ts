import { test, expect, request as requests, type APIRequestContext } from '@playwright/test';
const origin='http://127.0.0.1:3100';
async function post(client:APIRequestContext,path:string,data:unknown){return client.post(`/api/${path}`,{data,headers:{Origin:origin}});}
async function signIn(username:string){const client=await requests.newContext({baseURL:origin});const response=await post(client,'auth/login',{username,password:'pathfinder-local-2026'});expect(response.status()).toBe(200);return client;}

test('real HTTP flow persists progress, review, assignments and scoring with access denial',async()=>{
  const learner=await signIn('learner'),teacher=await signIn('teacher'),other=await signIn('learner-two'),otherTeacher=await signIn('other-teacher'),admin=await signIn('admin'),anonymous=await requests.newContext({baseURL:origin});
  try {
    const intake={goal:'API verification: payments backend engineer',hoursPerWeek:8,targetMonths:6,budget:'free'};
    const created=await post(learner,'roadmaps',{mode:'manual',intake,firstTitle:'HTTP and API design',firstHours:16});expect(created.status()).toBe(201);const map=(await created.json()).roadmap,id=map.id;
    expect((await anonymous.get(`/api/roadmaps/${id}`)).status()).toBe(401);
    expect((await other.get(`/api/roadmaps/${id}`)).status()).toBe(404);
    expect((await post(other,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'})).status()).toBe(404);
    expect((await admin.get(`/api/roadmaps/${id}`)).status()).toBe(404);
    expect((await learner.get('/api/admin')).status()).toBe(403);
    expect((await learner.post(`/api/roadmaps/${id}/mark`,{data:{version:1,milestoneId:'first-skill',mark:'known'},headers:{Origin:'https://hostile.example'}})).status()).toBe(403);
    expect((await post(learner,`roadmaps/${id}/mark`,{version:1,milestoneId:'target-role',mark:'complete'})).status()).toBe(400);
    const concurrent=await Promise.all([post(learner,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'}),post(learner,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'})]);expect(concurrent.map(r=>r.status()).sort()).toEqual([200,409]);
    const marked=await (await learner.get(`/api/roadmaps/${id}`)).json();expect(marked.roadmap.version).toBe(2);expect(marked.roadmap.marks['first-skill']).toBe('known');
    const added=await post(learner,`roadmaps/${id}/milestone`,{version:2,title:'Idempotency project',description:'Build an endpoint that handles duplicate requests safely.',hours:8,kind:'project',phase:2,prerequisites:['first-skill']});expect(added.status()).toBe(200);const updated=(await added.json()).roadmap;const node=updated.graph.milestones.find((n:{title:string})=>n.title==='Idempotency project');
    expect((await post(learner,`roadmaps/${id}/milestone`,{version:3,title:'Invalid cycle',description:'This must not allow a role prerequisite.',hours:8,kind:'skill',phase:1,prerequisites:['target-role']})).status()).toBe(400);
    const submitted=await post(learner,`roadmaps/${id}/evidence`,{milestoneId:node.id,body:'API test evidence: tested duplicate request handling.',url:'https://example.com/project'});expect(submitted.status()).toBe(201);const evidenceId=(await submitted.json()).evidence.id;
    expect((await post(learner,`roadmaps/${id}/evidence`,{milestoneId:node.id,body:'Reject an unsafe link in this evidence.',url:'javascript:alert(1)'})).status()).toBe(400);
    expect((await post(otherTeacher,'organization/review',{evidenceId,status:'approved',feedback:'This review must fail because the organization differs.'})).status()).toBe(404);
    expect((await post(teacher,'organization/review',{evidenceId,status:'approved',feedback:'The duplicate-request tests support the submitted claim.'})).status()).toBe(200);
    const refreshed=await (await learner.get(`/api/roadmaps/${id}`)).json();expect(refreshed.evidence[0].status).toBe('approved');expect(refreshed.evidence[0].feedback).toContain('duplicate-request');
    expect((await post(teacher,'organization/assign',{learnerId:'dev-learner',title:'API test: timeout recovery',instructions:'Test a timeout followed by a repeated payment request.',dueDate:'2026-12-01'})).status()).toBe(201);
    expect((await post(otherTeacher,'organization/assign',{learnerId:'dev-learner',title:'Forbidden task',instructions:'Cross-organization assignment must fail.',dueDate:'2026-12-01'})).status()).toBe(404);
    const workspace=await (await learner.get('/api/workspace')).json();const assignment=workspace.assignments.find((a:{title:string})=>a.title==='API test: timeout recovery');expect(assignment).toBeTruthy();expect((await post(other,'assignments/complete',{id:assignment.id,completed:true})).status()).toBe(404);expect((await post(learner,'assignments/complete',{id:assignment.id,completed:true})).status()).toBe(200);
    expect((await post(learner,`roadmaps/${id}/advice`,{milestoneId:node.id})).status()).toBe(503);expect((await post(learner,'roadmaps',{mode:'ai',intake})).status()).toBe(503);
    const unchanged=await (await learner.get(`/api/roadmaps/${id}`)).json();expect(unchanged.roadmap.version).toBe(3);
    const restore=await post(learner,`roadmaps/${id}/restore`,{version:3,restoreVersion:1});expect(restore.status()).toBe(200);const restored=(await restore.json()).roadmap;expect(restored.version).toBe(4);expect(restored.marks['first-skill']).toBe('known');
    const started=await post(learner,'practice/start',{});expect(started.status()).toBe(201);const attemptId=(await started.json()).id;
    const attempt=await (await learner.get(`/api/practice/${attemptId}`)).json();expect(attempt.questions).toHaveLength(6);expect(attempt.questions[0]).not.toHaveProperty('answer');expect(attempt.questions[0]).not.toHaveProperty('explanation');expect((await other.get(`/api/practice/${attemptId}`)).status()).toBe(404);
    const answers={ratio:1,percentage:1,sequence:3,deduction:2,average:3,verbal:1};const scored=await post(learner,`practice/${attemptId}/submit`,{answers});expect(scored.status()).toBe(200);expect((await scored.json()).result.correct).toBe(6);
    const replayed=await post(learner,`practice/${attemptId}/submit`,{answers:{}});expect((await replayed.json()).result.correct).toBe(6);
    expect((await post(admin,'admin/flag',{key:'solo_practice',enabled:false})).status()).toBe(200);expect((await post(learner,'practice/start',{})).status()).toBe(503);expect((await learner.get(`/api/roadmaps/${id}`)).status()).toBe(200);expect((await post(admin,'admin/flag',{key:'solo_practice',enabled:true})).status()).toBe(200);
    const operations=await (await admin.get('/api/admin')).json();expect(JSON.stringify(operations)).not.toContain('duplicate request handling');expect(operations.events.some((event:{action:string})=>event.action==='evidence.reviewed')).toBe(true);
    const resumed=await signIn('learner');expect((await (await resumed.get(`/api/roadmaps/${id}`)).json()).roadmap.version).toBe(4);await resumed.dispose();
  } finally {await post(admin,'admin/flag',{key:'solo_practice',enabled:true});await Promise.all([learner,teacher,other,otherTeacher,admin,anonymous].map(client=>client.dispose()));}
});

test('restore retains cleared progress and graph errors return 400 without changing saved work',async()=>{
  const learner=await signIn('learner');
  try {
    const intake={goal:'Restore regression: backend engineer',hoursPerWeek:6,targetMonths:6,budget:'free'};
    const created=await post(learner,'roadmaps',{mode:'manual',intake,firstTitle:'HTTP foundations',firstHours:8});
    expect(created.status()).toBe(201);const id=(await created.json()).roadmap.id;
    expect((await post(learner,`roadmaps/${id}/mark`,{version:1,milestoneId:'first-skill',mark:'known'})).status()).toBe(200);
    expect((await post(learner,`roadmaps/${id}/mark`,{version:2,milestoneId:'first-skill',mark:null})).status()).toBe(200);
    const restored=await post(learner,`roadmaps/${id}/restore`,{version:3,restoreVersion:2});
    expect(restored.status()).toBe(200);expect((await restored.json()).roadmap.marks).toEqual({});
    const invalid=await post(learner,`roadmaps/${id}/milestone`,{version:4,title:'Invalid prerequisite',description:'A missing dependency must be a client error.',hours:8,kind:'skill',phase:1,prerequisites:['missing']});
    expect(invalid.status()).toBe(400);expect((await invalid.json()).error).toContain('missing milestone');
    const saved=(await (await learner.get(`/api/roadmaps/${id}`)).json()).roadmap;
    expect(saved.version).toBe(4);expect(saved.marks).toEqual({});
  } finally { await learner.dispose(); }
});

test('foreign, stale and paused discussion requests are rejected before AI preparation',async()=>{
  const learner=await signIn('learner'),other=await signIn('learner-two');
  try {
    const before=await (await learner.get('/api/me')).json();
    const created=await post(learner,'discussions',{topic:'How should a team measure API reliability?',participantCount:3});
    expect(created.status()).toBe(200);const session=await created.json();
    const turn={version:session.version,text:'Measure response latency and error rates together.'};
    expect((await post(other,`discussions/${session.id}/turn`,turn)).status()).toBe(404);
    expect((await post(learner,`discussions/${session.id}/turn`,{...turn,version:99})).status()).toBe(409);
    const paused=await post(learner,`discussions/${session.id}/control`,{version:session.version,action:'pause'});
    expect(paused.status()).toBe(200);
    expect((await post(learner,`discussions/${session.id}/turn`,{...turn,version:(await paused.json()).version})).status()).toBe(409);
    const after=await (await learner.get('/api/me')).json();
    expect(after.aiQuota.used).toBe(before.aiQuota.used);
  } finally { await Promise.all([learner.dispose(),other.dispose()]); }
});
