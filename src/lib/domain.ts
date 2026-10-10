import { z } from 'zod';

const text = (max: number) => z.string().trim().min(1).max(max);
export const intakeSchema = z.object({
  goal: text(180).min(3), background: z.string().trim().max(1200).default(''),
  hoursPerWeek: z.number().int().min(1).max(60),
  targetMonths: z.number().int().min(1).max(36),
  budget: z.enum(['free', 'flexible']),
});
export type Intake = z.infer<typeof intakeSchema>;
export const milestoneSchema = z.object({
  id: text(64).regex(/^[a-zA-Z0-9_-]+$/), skillId: text(80), title: text(160),
  kind: z.enum(['skill', 'project', 'certification', 'role']),
  phase: z.number().int().min(1).max(99), phaseTitle: text(80),
  description: text(800), hours: z.number().int().min(0).max(600),
  prerequisites: z.array(text(64)).max(30), prerequisiteMode: z.enum(['all', 'any']),
  deliverable: text(500),
});
export const graphSchema = z.object({
  title: text(180), summary: text(1200), assumptions: z.array(text(500)).max(8),
  milestones: z.array(milestoneSchema).min(1).max(80),
});
export type Graph = z.infer<typeof graphSchema>;
export type Milestone = Graph['milestones'][number];
export type Mark = 'known' | 'complete';
export type Marks = Record<string, Mark>;
export type Roadmap = {
  id: string; owner_id: string; intake: Intake; graph: Graph; marks: Marks;
  version: number; origin: 'manual' | 'ai'; created_at: string; updated_at: string;
};

export function validateGraph(input: unknown): Graph {
  const graph = graphSchema.parse(input);
  const ids = new Set(graph.milestones.map(n => n.id));
  if (ids.size !== graph.milestones.length) throw new Error('Milestone IDs must be unique.');
  const skills = new Set(graph.milestones.map(n => n.skillId));
  if (skills.size !== graph.milestones.length) throw new Error('Skill identifiers must be unique.');
  const nodes = new Map(graph.milestones.map(n => [n.id, n]));
  for (const node of graph.milestones) {
    if (new Set(node.prerequisites).size !== node.prerequisites.length) throw new Error('Duplicate prerequisite.');
    for (const id of node.prerequisites) {
      if (!ids.has(id)) throw new Error('A prerequisite refers to a missing milestone.');
      if (nodes.get(id)!.phase > node.phase) throw new Error('Prerequisites cannot be in a later phase.');
    }
  }
  const visited = new Set<string>(), active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) throw new Error('The roadmap contains a dependency cycle.');
    if (visited.has(id)) return;
    active.add(id); nodes.get(id)!.prerequisites.forEach(visit);
    active.delete(id); visited.add(id);
  }
  graph.milestones.forEach(n => visit(n.id));
  if (!graph.milestones.some(n => n.kind === 'role')) throw new Error('Include at least one target or intermediate role.');
  // Every milestone must contribute to a role; disconnected filler is rejected.
  const useful = new Set<string>();
  function collect(id: string) { if (useful.has(id)) return; useful.add(id); nodes.get(id)!.prerequisites.forEach(collect); }
  graph.milestones.filter(n => n.kind === 'role').forEach(n => collect(n.id));
  if (useful.size !== ids.size) throw new Error('Every milestone must lead to a role.');
  return graph;
}

export function validateCareerGraph(input:unknown):Graph {
  const graph=validateGraph(input);
  if(graph.milestones.length<8||!graph.milestones.some(n=>n.kind==='skill')||!graph.milestones.some(n=>n.kind==='project')||graph.milestones.filter(n=>n.kind==='role').length<2)throw new Error('An AI career plan must include skills, concrete projects, an intermediate role and the target role.');
  return graph;
}

export function availability(node: Milestone, marks: Marks): 'known' | 'complete' | 'ready' | 'locked' {
  if (marks[node.id]) return marks[node.id];
  const ready = node.prerequisites.length === 0 || (node.prerequisiteMode === 'all'
    ? node.prerequisites.every(id => Boolean(marks[id])) : node.prerequisites.some(id => Boolean(marks[id])));
  return ready ? 'ready' : 'locked';
}

export function schedule(graph: Graph, marks: Marks, hoursPerWeek: number) {
  const memo = new Map<string, { start: number; finish: number }>();
  const nodes = new Map(graph.milestones.map(n => [n.id, n]));
  function time(id: string): { start: number; finish: number } {
    if (memo.has(id)) return memo.get(id)!;
    const node = nodes.get(id)!;
    const ends = node.prerequisites.map(p => time(p).finish);
    const start = marks[id] ? 0 : ends.length ? (node.prerequisiteMode === 'any' ? Math.min(...ends) : Math.max(...ends)) : 0;
    const finish = start + (marks[id] ? 0 : node.hours);
    const result = { start, finish }; memo.set(id, result); return result;
  }
  graph.milestones.forEach(n => time(n.id));
  // One learner has a finite shared weekly budget. Critical-path estimates alone undercount parallel work.
  const remainingHours = graph.milestones.reduce((sum, n) => sum + (marks[n.id] ? 0 : n.hours), 0);
  return { remainingHours, weeks: Math.ceil(remainingHours / hoursPerWeek), times: Object.fromEntries(memo) };
}

export function manualGraph(intake: Intake, title: string, hours: number): Graph {
  return validateGraph({ title: intake.goal, summary: 'Your own plan. Add milestones as you learn more about the role.', assumptions: ['Effort estimates are learner supplied. This plan was not generated by AI.'], milestones: [
    { id: 'first-skill', skillId: 'custom-first-skill', title, kind: 'skill', phase: 1, phaseTitle: 'Build foundations', description: 'Define the concepts and practice needed for this milestone.', hours, prerequisites: [], prerequisiteMode: 'all', deliverable: 'Save notes or a project link that demonstrates your work.' },
    { id: 'target-role', skillId: 'custom-target-role', title: intake.goal, kind: 'role', phase: 99, phaseTitle: 'Target role', description: 'Review your evidence against the role requirements.', hours: 0, prerequisites: ['first-skill'], prerequisiteMode: 'all', deliverable: 'A portfolio and role-specific readiness review.' },
  ] });
}

export const adviceSchema = z.object({
  explanation: text(1600), actions: z.array(text(500)).min(2).max(6),
  project: z.object({ title: text(160), brief: text(1200), acceptance: z.array(text(300)).min(2).max(6) }),
  questions: z.array(text(400)).min(2).max(6),
  searchTerms: z.array(text(160)).max(4), cautions: z.array(text(500)).max(4),
});
export type Advice = z.infer<typeof adviceSchema>;
