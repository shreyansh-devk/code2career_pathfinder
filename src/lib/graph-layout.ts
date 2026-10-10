import type { Graph } from './domain';
export const graphNodeSize={width:244,height:140,columnGap:40,rowGap:20};
export const graphPhaseColors=['#2f7650','#346c9c','#765693','#895936'];

// Keep direct prerequisites in a phase view without changing the saved graph.
export function graphForPhase(graph:Graph,phase:number|null){
  if(phase===null)return {graph,contextIds:new Set<string>()};
  const current=graph.milestones.filter(n=>n.phase===phase),ids=new Set(current.map(n=>n.id));
  for(const n of current)for(const id of n.prerequisites)ids.add(id);
  const contextIds=new Set([...ids].filter(id=>!current.some(n=>n.id===id)));
  return {graph:{...graph,milestones:graph.milestones.filter(n=>ids.has(n.id)).map(n=>({...n,prerequisites:n.prerequisites.filter(id=>ids.has(id))}))},contextIds};
}

export function graphPositions(graph:Graph) {
  const nodes = new Map(graph.milestones.map(n=>[n.id,n])),levels = new Map<string,number>(),columns=new Map<number,Graph['milestones']>();
  function level(id:string):number { if (levels.has(id)) return levels.get(id)!;const n = nodes.get(id)!;const value = n.prerequisites.length ? 1+Math.max(...n.prerequisites.map(level)) : 0;levels.set(id,value);return value; }
  for(const n of [...graph.milestones].sort((a,b)=>a.phase-b.phase)){const column=level(n.id),members=columns.get(column)||[];members.push(n);columns.set(column,members);}
  const lanes=Math.max(1,...[...columns.values()].map(c=>c.length)),positions=new Map<string,{id:string;x:number;y:number}>();
  const rowStep=graphNodeSize.height+graphNodeSize.rowGap,columnStep=graphNodeSize.width+graphNodeSize.columnGap;
  for(const [column,members] of [...columns].sort(([a],[b])=>a-b)){
    const parentCenter=(id:string)=>{const parents=nodes.get(id)!.prerequisites;return parents.length?parents.reduce((sum,p)=>sum+positions.get(p)!.y,0)/parents.length:0;};
    members.sort((a,b)=>parentCenter(a.id)-parentCenter(b.id)||a.phase-b.phase);
    // Centre smaller columns and keep branches in their prerequisite order.
    members.forEach((n,row)=>positions.set(n.id,{id:n.id,x:column*columnStep,y:((lanes-members.length)/2+row)*rowStep}));
  }
  return graph.milestones.map(n=>positions.get(n.id)!);
}
export function escapeXml(value:string) { return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;'); }
function titleLines(title:string){
  const lines:string[]=[];let line='';
  for(const word of title.split(/\s+/)){if(line&&(line+' '+word).length>26){lines.push(line);line='';}let rest=word;while(rest.length>26){if(line){lines.push(line);line='';}lines.push(rest.slice(0,26));rest=rest.slice(26);}line=line?line+' '+rest:rest;}
  if(line)lines.push(line);
  if(lines.length>3)lines[2]=lines[2].slice(0,24)+'…';
  return lines.slice(0,3);
}
export function exportSvg(graph:Graph) {
  const positions = graphPositions(graph),byId=new Map(positions.map(p=>[p.id,p]));
  const width=Math.max(0,...positions.map(p=>p.x))+graphNodeSize.width+48,height=Math.max(0,...positions.map(p=>p.y))+graphNodeSize.height+80;
  const phases=[...new Set(graph.milestones.map(n=>n.phase))].sort((a,b)=>a-b);
  const edges=graph.milestones.flatMap(n=>n.prerequisites.map(id=>{const from=byId.get(id)!,to=byId.get(n.id)!,x=from.x+24+graphNodeSize.width,y=from.y+56+graphNodeSize.height/2,tx=to.x+24,ty=to.y+56+graphNodeSize.height/2;return `<path d="M ${x} ${y} C ${x+20} ${y}, ${tx-20} ${ty}, ${tx} ${ty}" fill="none" stroke="#71867b" stroke-width="1.5" marker-end="url(#arrow)"/>`; })).join('');
  const boxes=graph.milestones.map(n=>{const p=byId.get(n.id)!,color=graphPhaseColors[phases.indexOf(n.phase)%graphPhaseColors.length],title=titleLines(n.title).map((line,i)=>`<tspan x="${p.x+40}" y="${p.y+108+i*20}">${escapeXml(line)}</tspan>`).join('');return `<g><title>${escapeXml(n.title)}</title><rect x="${p.x+24}" y="${p.y+56}" width="${graphNodeSize.width}" height="${graphNodeSize.height}" rx="8" fill="#ffffff" stroke="#c4d1c7"/><rect x="${p.x+24}" y="${p.y+68}" width="3" height="116" rx="1" fill="${color}"/><text x="${p.x+40}" y="${p.y+81}" font-size="12" fill="#526159">${escapeXml(n.kind)} · ${n.hours} hours</text><text font-size="15" font-weight="600" fill="#18251e">${title}</text><text x="${p.x+40}" y="${p.y+178}" font-size="11" fill="${color}">${escapeXml(n.phaseTitle.length>32?n.phaseTitle.slice(0,29)+'…':n.phaseTitle)}</text></g>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(graph.title)}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#71867b"/></marker><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#dce4dc" stroke-width="0.8"/></pattern></defs><rect width="100%" height="100%" fill="#f4f7f2"/><rect width="100%" height="100%" fill="url(#grid)"/><g font-family="Arial,sans-serif"><text x="24" y="30" font-size="20" fill="#18251e">${escapeXml(graph.title)}</text>${edges}${boxes}</g></svg>`;
}
