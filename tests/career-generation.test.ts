import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateCareerGraph} from '../src/lib/career-generation';
import {openRouterModel} from '../src/lib/openrouter';
import {intakeSchema,manualGraph,validateCareerGraph,type Graph} from '../src/lib/domain';

const intake=intakeSchema.parse({goal:'Backend engineer',hoursPerWeek:6,targetMonths:6,budget:'free'});
function fixture() {
  const graph=manualGraph(intake,'HTTP foundations',8);
  for(let i=0;i<6;i++)graph.milestones.splice(graph.milestones.length-1,0,{...graph.milestones[0],id:`step-${i}`,skillId:`step-${i}`,kind:i<2?'project':i===5?'role':'skill'});
  graph.milestones.at(-1)!.prerequisites=graph.milestones.slice(0,-1).map(n=>n.id);
  return validateCareerGraph(graph);
}
function modelFor(graphs:Graph[]) {
  const requests:Record<string,unknown>[]=[];
  const model=openRouterModel('test-only-key',undefined,async (_url,options)=>{
    requests.push(JSON.parse(String(options?.body)));
    return Response.json({id:'test',object:'chat.completion',created:1,model:'test',choices:[{index:0,message:{role:'assistant',content:JSON.stringify(graphs[Math.min(requests.length-1,graphs.length-1)])},finish_reason:'stop'}]});
  });
  return {model,requests};
}

test('valid career output makes one provider call without spending repair quota',async()=>{
  const valid=fixture(),{model,requests}=modelFor([valid]);
  const result=await generateCareerGraph(model,intake,new AbortController().signal,async()=>assert.fail('No repair needed'));
  assert.deepEqual(result,valid);assert.equal(requests.length,1);
});
test('disconnected provider milestones receive one repair and the repaired output is validated',async()=>{
  const valid=fixture(),invalid=structuredClone(valid);invalid.milestones.at(-1)!.prerequisites=invalid.milestones.at(-1)!.prerequisites.filter(id=>id!=='step-1');
  const {model,requests}=modelFor([invalid,valid]);let charged=0;
  const result=await generateCareerGraph(model,intake,new AbortController().signal,async category=>{assert.equal(category,'invalid_graph_disconnected_milestone');charged++;});
  assert.deepEqual(result,valid);assert.equal(charged,1);assert.equal(requests.length,2);
  assert.match(JSON.stringify(requests[1].messages),/Every milestone must lead to a role/);
});
test('a second invalid graph fails closed and exhausted quota prevents a repair call',async()=>{
  const invalid=fixture();invalid.milestones.at(-1)!.prerequisites.shift();
  const first=modelFor([invalid]);
  await assert.rejects(generateCareerGraph(first.model,intake,new AbortController().signal,async()=>{}),/Every milestone must lead to a role/);
  assert.equal(first.requests.length,2);
  const limited=modelFor([invalid]);
  await assert.rejects(generateCareerGraph(limited.model,intake,new AbortController().signal,async()=>{throw new Error('Quota exhausted')}),/Quota exhausted/);
  assert.equal(limited.requests.length,1);
});
