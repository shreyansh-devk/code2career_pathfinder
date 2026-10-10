import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getDb, type Sql } from './db';
import { ApiError } from './http';
import { type User, requireRole } from './auth';
import { type Roadmap, type Graph, type Marks, type Intake, availability, validateGraph } from './domain';

export type Evidence = { id: string; roadmap_id: string; learner_id: string; milestone_id: string; body: string; url: string | null; status: string; feedback: string | null; created_at: string };
export type Assignment = { id: string; learner_id: string; title: string; instructions: string; due_date: string; completed: boolean };
export async function audit(tx: Sql, actor: string, action: string, resource: string | null = null) {
  await tx.query('INSERT INTO audit_events(id,actor_id,action,resource_id) VALUES($1,$2,$3,$4)', [randomUUID(),actor,action,resource]);
}
export async function ownedRoadmap(user: User, id: string, tx?: Sql): Promise<Roadmap> {
  const { rows } = await (tx || await getDb()).query<Roadmap>('SELECT * FROM roadmaps WHERE id=$1 AND owner_id=$2', [id,user.id]);
  if (!rows[0]) throw new ApiError(404, 'Roadmap not found.');
  return rows[0];
}
export async function listRoadmaps(user: User) {
  return (await (await getDb()).query<Roadmap>('SELECT * FROM roadmaps WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 50', [user.id])).rows;
}
export async function createRoadmap(user: User, intake: Intake, graph: Graph, origin: Roadmap['origin']) {
  requireRole(user, ['learner']); validateGraph(graph);
  const id = randomUUID(), db = await getDb();
  return db.transaction(async tx => {
    const { rows } = await tx.query<Roadmap>('INSERT INTO roadmaps(id,owner_id,intake,graph,origin) VALUES($1,$2,$3::jsonb,$4::jsonb,$5) RETURNING *', [id,user.id,JSON.stringify(intake),JSON.stringify(graph),origin]);
    await tx.query('INSERT INTO revisions(roadmap_id,version,snapshot) VALUES($1,1,$2::jsonb)', [id,JSON.stringify(rows[0])]);
    await audit(tx,user.id,`roadmap.created.${origin}`,id); return rows[0];
  });
}
export async function reviseRoadmap(user: User, id: string, version: number, change: (map: Roadmap) => { graph: Graph; marks: Marks; intake?:Intake }) {
  const db = await getDb();
  return db.transaction(async tx => {
    const current = await ownedRoadmap(user,id,tx);
    if (current.version !== version) throw new ApiError(409, 'This roadmap changed in another session. Reload it before saving.');
    const { graph, marks, intake } = change(current); validateGraph(graph);
    const { rows } = await tx.query<Roadmap>('UPDATE roadmaps SET graph=$1::jsonb,marks=$2::jsonb,intake=$6::jsonb,version=version+1,updated_at=NOW() WHERE id=$3 AND owner_id=$4 AND version=$5 RETURNING *', [JSON.stringify(graph),JSON.stringify(marks),id,user.id,version,JSON.stringify(intake || current.intake)]);
    if (!rows[0]) throw new ApiError(409, 'Another edit was saved first. Reload before saving.');
    await tx.query('INSERT INTO revisions(roadmap_id,version,snapshot) VALUES($1,$2,$3::jsonb)', [id,rows[0].version,JSON.stringify(rows[0])]);
    await audit(tx,user.id,'roadmap.revised',id); return rows[0];
  });
}
export async function markMilestone(user: User, id: string, version: number, milestoneId: string, mark: 'known' | 'complete' | null) {
  return reviseRoadmap(user,id,version,map => {
    const node = map.graph.milestones.find(n => n.id === milestoneId);
    if (!node) throw new ApiError(404, 'Milestone not found.');
    if (mark === 'complete' && availability(node,map.marks) === 'locked') throw new ApiError(400, 'Complete or mark the prerequisites known first.');
    const marks = { ...map.marks }; if (mark) marks[milestoneId] = mark; else delete marks[milestoneId];
    return { graph: map.graph, marks };
  });
}
export async function getEvidence(user: User, roadmapId?: string) {
  if (roadmapId) await ownedRoadmap(user,roadmapId);
  return (await (await getDb()).query<Evidence>(`SELECT * FROM evidence WHERE learner_id=$1${roadmapId ? ' AND roadmap_id=$2' : ''} ORDER BY created_at DESC LIMIT 100`, roadmapId ? [user.id,roadmapId] : [user.id])).rows;
}
export const evidenceInput = z.object({ milestoneId: z.string().max(64), body: z.string().trim().min(10).max(4000), url: z.union([z.literal(''), z.url().max(2000).refine(v => new URL(v).protocol === 'https:', 'Use an HTTPS link.')]).default('') });
export async function addEvidence(user: User, id: string, input: z.infer<typeof evidenceInput>) {
  const map = await ownedRoadmap(user,id);
  if (!map.graph.milestones.some(n => n.id === input.milestoneId)) throw new ApiError(404,'Milestone not found.');
  const evidenceId = randomUUID();
  return (await getDb()).transaction(async tx => {
    const { rows } = await tx.query<Evidence>('INSERT INTO evidence(id,roadmap_id,learner_id,milestone_id,body,url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [evidenceId,id,user.id,input.milestoneId,input.body,input.url || null]);
    await audit(tx,user.id,'evidence.submitted',evidenceId); return rows[0];
  });
}
export async function canTeach(user: User, learnerId: string, tx?: Sql) {
  requireRole(user,['teacher','owner']);
  const { rows } = await (tx || await getDb()).query(`SELECT learner.user_id FROM memberships learner JOIN memberships staff ON staff.organization_id=learner.organization_id WHERE staff.user_id=$1 AND learner.user_id=$2 AND ($3='owner' OR learner.assigned_teacher_id=$1)`, [user.id,learnerId,user.role]);
  if (!rows[0]) throw new ApiError(404,'Assigned learner not found.');
}
export async function organizationOverview(user: User) {
  requireRole(user,['teacher','owner']); const db = await getDb();
  const org = (await db.query<{ id: string; name: string }>('SELECT o.* FROM organizations o JOIN memberships m ON m.organization_id=o.id WHERE m.user_id=$1', [user.id])).rows[0];
  if (!org) throw new ApiError(403,'Your account has no organization membership.');
  const learners = (await db.query<{ id: string; name: string; roadmap_count: number; submitted: number }>(`SELECT u.id,u.name,(SELECT COUNT(*)::int FROM roadmaps r WHERE r.owner_id=u.id) AS roadmap_count,(SELECT COUNT(*)::int FROM evidence e WHERE e.learner_id=u.id AND e.status='submitted') AS submitted FROM app_users u JOIN memberships m ON m.user_id=u.id WHERE m.organization_id=$1 AND u.role='learner' AND ($2='owner' OR m.assigned_teacher_id=$3) ORDER BY u.name`, [org.id,user.role,user.id])).rows;
  const evidence = (await db.query<Evidence & { learner_name: string; milestone_title: string }>(`SELECT e.*,u.name AS learner_name,COALESCE((SELECT n->>'title' FROM jsonb_array_elements(r.graph->'milestones') n WHERE n->>'id'=e.milestone_id LIMIT 1),e.milestone_id) AS milestone_title FROM evidence e JOIN app_users u ON u.id=e.learner_id JOIN memberships m ON m.user_id=u.id JOIN roadmaps r ON r.id=e.roadmap_id WHERE m.organization_id=$1 AND ($2='owner' OR m.assigned_teacher_id=$3) ORDER BY e.created_at DESC LIMIT 100`, [org.id,user.role,user.id])).rows;
  const assignments = (await db.query<Assignment>(`SELECT a.* FROM assignments a JOIN memberships m ON m.user_id=a.learner_id WHERE m.organization_id=$1 AND ($2='owner' OR m.assigned_teacher_id=$3) ORDER BY a.created_at DESC LIMIT 100`, [org.id,user.role,user.id])).rows;
  return { organization: org, learners, evidence, assignments };
}
export async function consumeQuota(key: string, limit: number, seconds: number) {
  const { rows } = await (await getDb()).query(`INSERT INTO quotas(key,count,resets_at) VALUES($1,1,NOW()+$3*INTERVAL '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN quotas.resets_at<=NOW() THEN 1 ELSE quotas.count+1 END,resets_at=CASE WHEN quotas.resets_at<=NOW() THEN NOW()+$3*INTERVAL '1 second' ELSE quotas.resets_at END WHERE quotas.resets_at<=NOW() OR quotas.count<$2 RETURNING count`, [key,limit,seconds]);
  if (!rows[0]) throw new ApiError(429,'Request limit reached. Try again after the current limit window.');
}
export async function flagEnabled(key: string) {
  return (await (await getDb()).query<{ enabled: boolean }>('SELECT enabled FROM feature_flags WHERE key=$1',[key])).rows[0]?.enabled === true;
}
