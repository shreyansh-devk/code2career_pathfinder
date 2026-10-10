import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intakeSchema, manualGraph, validateGraph, validateCareerGraph, availability, schedule } from '../src/lib/domain';
import { escapeXml, exportSvg } from '../src/lib/graph-layout';
import { checkPassword, hashPassword } from '../src/lib/security';
import { scoreAnswers } from '../src/lib/questions';
const intake=intakeSchema.parse({goal:'Backend payments engineer',hoursPerWeek:8,targetMonths:6,budget:'free'});
test('known skills unlock dependencies and remove effort without changing the graph',()=>{
  const graph=manualGraph(intake,'HTTP fundamentals',16),before=JSON.stringify(graph);
  assert.equal(availability(graph.milestones[1],{}),'locked');
  assert.equal(availability(graph.milestones[1],{'first-skill':'known'}),'ready');
  assert.equal(schedule(graph,{},8).weeks,2);
  assert.equal(schedule(graph,{'first-skill':'known'},8).remainingHours,0);
  assert.equal(JSON.stringify(graph),before);
});
test('reject missing prerequisites, duplicate IDs, cycles and disconnected work',()=>{
  for(const mutation of ['missing','duplicate','cycle','disconnected']){
    const graph=manualGraph(intake,'HTTP fundamentals',16);
    if(mutation==='missing')graph.milestones[1].prerequisites=['absent'];
    if(mutation==='duplicate')graph.milestones[1].id='first-skill';
    if(mutation==='cycle'){graph.milestones[0].phase=99;graph.milestones[0].prerequisites=['target-role'];}
    if(mutation==='disconnected')graph.milestones.push({...graph.milestones[0],id:'unused',skillId:'unused'});
    assert.throws(()=>validateGraph(graph));
  }
});
test('OR prerequisites unlock with one known branch, AND requires all',()=>{
  const graph=manualGraph(intake,'HTTP fundamentals',8),target=graph.milestones[1];
  target.prerequisites=['first-skill','second'];
  target.prerequisiteMode='any';
  assert.equal(availability(target,{'first-skill':'known'}),'ready');
  target.prerequisiteMode='all';
  assert.equal(availability(target,{'first-skill':'known'}),'locked');
});
test('parallel work shares the learner weekly budget',()=>{
  const graph=manualGraph(intake,'HTTP fundamentals',16);
  graph.milestones.push({...graph.milestones[0],id:'second',skillId:'second',hours:24});
  graph.milestones[1].prerequisites.push('second');
  assert.equal(schedule(validateGraph(graph),{},8).weeks,5);
});
test('SVG export escapes learner content instead of injecting markup',()=>{
  const graph=manualGraph({...intake,goal:'<script>alert("test")</script>'},'HTTP & APIs',8);
  const svg=exportSvg(graph);
  assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(svg.includes('HTTP &amp; APIs'));
  assert.equal(escapeXml("'<>&\""),'&apos;&lt;&gt;&amp;&quot;');
});
test('passwords are salted and verified, incorrect passwords fail',()=>{
  const one=hashPassword('local-password'),two=hashPassword('local-password');
  assert.notEqual(one,two);assert.ok(checkPassword('local-password',one));assert.ok(!checkPassword('incorrect',one));
});
test('practice scoring handles correct, incorrect and omitted answers',()=>{
  const result=scoreAnswers(['ratio','percentage','sequence'],{ratio:1,percentage:0});
  assert.equal(result.correct,1);assert.equal(result.details[2].selected,null);
});

test('AI plans must contain skills, projects and two role milestones',()=>{
  const graph=manualGraph(intake,'HTTP fundamentals',16);
  for(let i=0;i<6;i++){graph.milestones.push({...graph.milestones[0],id:`skill-${i}`,skillId:`skill-${i}`});graph.milestones[1].prerequisites.push(`skill-${i}`);}
  graph.milestones[2].kind='project';graph.milestones[3].kind='role';
  assert.doesNotThrow(()=>validateCareerGraph(graph));
  assert.throws(()=>validateCareerGraph({...graph,milestones:graph.milestones.map(n=>({...n,kind:n.kind==='skill'?'project':n.kind}))}));
  assert.throws(()=>validateCareerGraph({...graph,milestones:graph.milestones.map(n=>({...n,kind:n.kind==='project'?'skill':n.kind}))}));
  assert.throws(()=>validateCareerGraph(manualGraph(intake,'HTTP fundamentals',16)));
});
