import type { Graph } from './domain';
export function graphPositions(graph:Graph) {
  const nodes = new Map(graph.milestones.map(n=>[n.id,n])),levels = new Map<string,number>(),rows = new Map<number,number>();
  function level(id:string):number { if (levels.has(id)) return levels.get(id)!;const n = nodes.get(id)!;const value = n.prerequisites.length ? 1+Math.max(...n.prerequisites.map(level)) : 0;levels.set(id,value);return value; }
  return [...graph.milestones].sort((a,b)=>a.phase-b.phase).map(n=>{ const column=level(n.id),row=rows.get(column)||0;rows.set(column,row+1);return { id:n.id,x:column*320,y:row*150 }; });
}
export function escapeXml(value:string) { return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;'); }
export function exportSvg(graph:Graph) {
  const positions = graphPositions(graph),byId=new Map(positions.map(p=>[p.id,p]));
  const width=Math.max(...positions.map(p=>p.x))+340,height=Math.max(...positions.map(p=>p.y))+190;
  const edges=graph.milestones.flatMap(n=>n.prerequisites.map(id=>{const from=byId.get(id)!,to=byId.get(n.id)!;return `<path d="M ${from.x+295} ${from.y+105} C ${from.x+320} ${from.y+105}, ${to.x+5} ${to.y+105}, ${to.x+25} ${to.y+105}" fill="none" stroke="#86928b" marker-end="url(#arrow)"/>`; })).join('');
  const boxes=graph.milestones.map(n=>{const p=byId.get(n.id)!;const title=n.title.length>33?n.title.slice(0,30)+'…':n.title;return `<g><title>${escapeXml(n.title)}</title><rect x="${p.x+25}" y="${p.y+60}" width="270" height="90" rx="10" fill="#ffffff" stroke="#19884c"/><text x="${p.x+40}" y="${p.y+83}" font-size="12" fill="#526159">${escapeXml(n.kind)} · ${n.hours} hours</text><text x="${p.x+40}" y="${p.y+110}" font-size="14" fill="#18251e">${escapeXml(title)}</text><text x="${p.x+40}" y="${p.y+132}" font-size="12" fill="#526159">${escapeXml(n.phaseTitle)}</text></g>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(graph.title)}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#86928b"/></marker></defs><rect width="100%" height="100%" fill="white"/><g font-family="Arial,sans-serif"><text x="25" y="30" font-size="20" fill="#18251e">${escapeXml(graph.title)}</text>${edges}${boxes}</g></svg>`;
}
