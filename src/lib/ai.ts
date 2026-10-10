import { createGateway, generateText, Output } from 'ai';
import {createOpenAICompatible} from '@ai-sdk/openai-compatible';
import { adviceSchema, type Intake, type Roadmap } from './domain';
import { ApiError } from './http';
import { consumeQuota, flagEnabled, audit } from './store';
import { getDb } from './db';
import {randomUUID} from 'node:crypto';
import { openRouterModel } from './openrouter';
import { aiFailureCategory, aiDiagnostic } from './ai-errors';
import { careerPlannerSystem, generateCareerGraph } from './career-generation';
export { aiFailureCategory, aiDiagnostic } from './ai-errors';

export function aiReady() { return Boolean(process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN && process.env.ANTHROPIC_BASE_URL && process.env.ANTHROPIC_MODEL || process.env.AI_GATEWAY_API_KEY && process.env.AI_MODEL); }
export function aiRequestLimit(){const raw=Number(process.env.AI_DAILY_LIMIT||10);return Number.isFinite(raw)?Math.max(1,Math.min(30,Math.floor(raw))):10;}
export async function prepareAi(userId: string) {
  if (!aiReady()) throw new ApiError(503, 'AI generation is unavailable until an API key and model are configured. Your saved plans remain usable.');
  if (!await flagEnabled('roadmap_generation')) throw new ApiError(503,'AI generation is temporarily paused by the platform operator.');
  await consumeQuota(`ai:${userId}`,aiRequestLimit(),86400);
  if (process.env.OPENROUTER_API_KEY) return openRouterModel(process.env.OPENROUTER_API_KEY,process.env.OPENROUTER_MODEL || undefined);
  if(process.env.ANTHROPIC_AUTH_TOKEN && process.env.ANTHROPIC_BASE_URL && process.env.ANTHROPIC_MODEL) {
    const base=new URL(process.env.ANTHROPIC_BASE_URL);
    if(base.protocol!=='https:')throw new ApiError(503,'The AI endpoint must use HTTPS.');
    return createOpenAICompatible({name:'codecraft',baseURL:base.toString().replace(/\/$/,''),apiKey:process.env.ANTHROPIC_AUTH_TOKEN,supportsStructuredOutputs:true}).chatModel(process.env.ANTHROPIC_MODEL);
  }
  return createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY! })(process.env.AI_MODEL!);
}
const system = careerPlannerSystem;
export async function generateRoadmap(userId: string, intake: Intake, signal: AbortSignal) {
  const model=await prepareAi(userId);
  try {
    const graph=await generateCareerGraph(model,intake,AbortSignal.any([signal,AbortSignal.timeout(120000)]),async category=>{
      await consumeQuota(`ai:${userId}`,aiRequestLimit(),86400);
      await audit(await getDb(),userId,`ai.roadmap.repair.${category}`);
    });
    await audit(await getDb(),userId,'ai.roadmap.validated'); return graph;
  } catch (error) {
    aiDiagnostic(error);
    await audit(await getDb(),userId,`ai.roadmap.failed.${aiFailureCategory(error)}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(502,'The AI provider could not produce a valid roadmap. No existing plan was changed. Try again.');
  }
}
export async function generateAdvice(userId: string, map: Roadmap, milestoneId: string, signal: AbortSignal) {
  const node = map.graph.milestones.find(n => n.id === milestoneId);
  if (!node) throw new ApiError(404,'Milestone not found.');
  const db = await getDb();
  const existing = (await db.query<{ content: unknown }>('SELECT content FROM advice WHERE roadmap_id=$1 AND milestone_id=$2 AND version=$3',[map.id,milestoneId,map.version])).rows[0];
  if (existing) return adviceSchema.parse(existing.content);
  const leaseId=randomUUID();
  const claimed=(await db.query('INSERT INTO advice_locks(roadmap_id,milestone_id,version,lease_id,expires_at) VALUES($1,$2,$3,$4,NOW()+INTERVAL \'135 seconds\') ON CONFLICT(roadmap_id,milestone_id,version) DO UPDATE SET lease_id=EXCLUDED.lease_id,expires_at=EXCLUDED.expires_at WHERE advice_locks.expires_at<=NOW() RETURNING lease_id',[map.id,milestoneId,map.version,leaseId])).rows;
  if(!claimed[0])throw new ApiError(409,'Guidance for this revision is already being generated. Try again shortly to load the saved result.');
  try {
    const saved=(await db.query<{content:unknown}>('SELECT content FROM advice WHERE roadmap_id=$1 AND milestone_id=$2 AND version=$3',[map.id,milestoneId,map.version])).rows[0];
    if(saved)return adviceSchema.parse(saved.content);
    const model=await prepareAi(userId);
    const { output } = await generateText({ model, system, output: Output.object({ schema: adviceSchema }), maxOutputTokens: 2600, maxRetries: 0,
      abortSignal: AbortSignal.timeout(120000),
      prompt: `Give concise actionable advice for this milestone, including a concrete project and assessment questions. Use 2 to 3 actions, acceptance criteria and questions. Goal context: ${JSON.stringify(map.intake)}. Milestone: ${JSON.stringify(node)}. Self-reported progress: ${JSON.stringify(map.marks)}. Search terms should help find official documentation. Do not present search suggestions as verified sources.`,
    });
    const advice = adviceSchema.parse(output);
    await db.query('INSERT INTO advice(roadmap_id,milestone_id,version,content) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING',[map.id,milestoneId,map.version,JSON.stringify(advice)]);
    await audit(db,userId,'ai.advice.saved',map.id); return advice;
  } catch (error) {aiDiagnostic(error); await audit(db,userId,`ai.advice.failed.${aiFailureCategory(error)}`,map.id);if(error instanceof ApiError)throw error; throw new ApiError(502,'Milestone advice could not be generated. Try again. Your saved work is unchanged.'); }
  finally{await db.query('DELETE FROM advice_locks WHERE roadmap_id=$1 AND milestone_id=$2 AND version=$3 AND lease_id=$4',[map.id,milestoneId,map.version,leaseId]);}
}
