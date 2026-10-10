import {test} from 'node:test';
import assert from 'node:assert/strict';
import {availability,validateGraph,type Graph,type Milestone} from '../src/lib/domain';
import {graphForPhase,graphPositions,graphNodeSize,exportSvg} from '../src/lib/graph-layout';

function milestone(id:string,phase:number,prerequisites:string[]=[]):Milestone{return {id,skillId:id,title:`Learn ${id}`,phase,phaseTitle:`Phase ${phase}`,prerequisites,prerequisiteMode:'all',kind:'skill',hours:8,description:'Practise this skill and record the result.',deliverable:'A working example.'};}
function branches():Graph{return validateGraph({title:'Branching career roadmap',summary:'Two routes followed by a shared project.',assumptions:[],milestones:[milestone('a',1),milestone('b',1),milestone('d',2,['b']),milestone('c',2,['a']),milestone('project',3,['c','d']),{...milestone('role',4,['project']),kind:'role',hours:0}]});}
function assertNoOverlap(graph:Graph){
  const positions=graphPositions(graph),byId=new Map(positions.map(p=>[p.id,p]));
  assert.equal(positions.length,graph.milestones.length);
  for(const p of positions){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0);for(const other of positions){if(p.id===other.id)continue;assert.ok(p.x+graphNodeSize.width<=other.x||other.x+graphNodeSize.width<=p.x||p.y+graphNodeSize.height<=other.y||other.y+graphNodeSize.height<=p.y,'Milestone boxes must not overlap.');}}
  for(const n of graph.milestones)for(const parent of n.prerequisites)assert.ok(byId.get(parent)!.x+graphNodeSize.width<byId.get(n.id)!.x,'Dependencies must point forward with room for the arrow.');
  return byId;
}
test('phase reading retains prerequisite context without changing saved work or availability',()=>{
  const graph=branches(),before=JSON.stringify(graph),view=graphForPhase(graph,3);
  assert.deepEqual(view.graph.milestones.map(n=>n.id),['d','c','project']);
  assert.deepEqual([...view.contextIds].sort(),['c','d']);
  assert.deepEqual(view.graph.milestones.find(n=>n.id==='project')!.prerequisites,['c','d']);
  for(const n of view.graph.milestones)for(const p of n.prerequisites)assert.ok(view.graph.milestones.some(n=>n.id===p));
  assertNoOverlap(view.graph);
  // Display context is trimmed, but status must still use the full saved milestone.
  const original=graph.milestones.find(n=>n.id==='c')!;
  assert.equal(availability(original,{}),'locked');
  assert.equal(availability(original,{a:'known'}),'ready');
  assert.equal(JSON.stringify(graph),before);
  assert.equal(graphForPhase(graph,null).graph,graph);
  assert.equal(graphForPhase(graph,null).contextIds.size,0);
});
test('compact branching layout separates boxes, orders children by parents and centres the merge',()=>{
  const graph=branches(),before=JSON.stringify(graph),p=assertNoOverlap(graph);
  assert.ok(p.get('a')!.y<p.get('b')!.y);
  assert.ok(p.get('c')!.y<p.get('d')!.y,'Input order must not cross the two independent branches.');
  assert.equal(p.get('project')!.y,(p.get('c')!.y+p.get('d')!.y)/2);
  assert.ok(p.get('role')!.x<3*320,'Horizontal span is smaller than the previous layout.');
  assert.deepEqual(graphPositions(graph),graphPositions(graph));
  assert.equal(JSON.stringify(graph),before);
});
test('the maximum supported 80-milestone plan and each phase have finite non-overlapping positions',()=>{
  const milestones:Milestone[]=[];
  for(let phase=1;phase<=20;phase++)for(let lane=0;lane<4;lane++)milestones.push(milestone(`p${phase}-${lane}`,phase,phase===1?[]:[`p${phase-1}-${lane}`]));
  milestones[79]={...milestones[79],kind:'role',hours:0,prerequisites:['p20-0','p20-1','p20-2','p19-3']};
  const graph=validateGraph({title:'Full supported plan',summary:'A complete bounded graph.',assumptions:[],milestones});
  assertNoOverlap(graph);
  for(let phase=1;phase<=20;phase++)assertNoOverlap(graphForPhase(graph,phase).graph);
});
test('image export uses the compact grid, wraps titles and escapes every learner-supplied label',()=>{
  const graph=branches();graph.title='Roadmap <script>unsafe</script>';graph.milestones[0].title='A deliberately long milestone title for readable wrapping';graph.milestones[1].phaseTitle='Phase <script> & prerequisites';
  const svg=exportSvg(graph);
  assert.ok(svg.includes('<pattern id="grid"'));
  assert.ok(svg.includes('<tspan'));
  assert.ok(svg.includes('<title>A deliberately long milestone title for readable wrapping</title>'));
  assert.ok(svg.includes('Phase &lt;script&gt; &amp; prerequisites'));
  assert.ok(!svg.includes('<script>'));
  assert.equal((svg.match(/<g><title>/g)||[]).length,graph.milestones.length);
});
