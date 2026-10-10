import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { requireUser, requireRole, clerkReady, type User } from '@/lib/auth';
import { getDb, localMode } from '@/lib/db';
import { ApiError, body, checkOrigin, failure, json } from '@/lib/http';
import { checkPassword, sessionToken, tokenHash, hashPassword } from '@/lib/security';
import { intakeSchema, manualGraph, milestoneSchema, type Roadmap } from '@/lib/domain';
import { addEvidence, audit, canTeach, consumeQuota, createRoadmap, evidenceInput, flagEnabled, getEvidence, listRoadmaps, markMilestone, organizationOverview, ownedRoadmap, reviseRoadmap, type Assignment } from '@/lib/store';
import { aiReady, aiRequestLimit, generateAdvice, generateRoadmap } from '@/lib/ai';
import { questions, scoreAnswers } from '@/lib/questions';
import {quizGet,quizPost} from '@/lib/quiz';
import {discussionGet,discussionPost} from '@/lib/discussion';
import {selfQuizGet,selfQuizPost,practiceOverview,personalNotebook} from '@/lib/self-quizzes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;
type Context = { params: Promise<{ path: string[] }> };
const versionSchema = z.number().int().min(1).max(1000000);
const fakeHash = hashPassword('invalid-account-password');

export async function GET(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    if (path.length===2 && path[0]==='shared') {
      if (!/^[a-f0-9]{64}$/.test(path[1])) throw new ApiError(404,'Shared roadmap not found.');
      const shared=(await (await getDb()).query<{ snapshot:unknown }>('SELECT snapshot FROM roadmap_shares WHERE token_hash=$1 AND revoked=false',[tokenHash(path[1])])).rows[0];
      if (!shared) throw new ApiError(404,'Shared roadmap not found or revoked.');
      return json(shared.snapshot);
    }
    const user = await requireUser(), db = await getDb();
    if(path[0]==='quiz')return json(await quizGet(user,path));
    if(path[0]==='discussions')return json(await discussionGet(user,path));
    if(path[0]==='self-quizzes')return json(await selfQuizGet(user,path));
    if (path.join('/') === 'me') {const quota=(await db.query<{count:number;resets_at:string}>('SELECT count,resets_at FROM quotas WHERE key=$1 AND resets_at>NOW()',[`ai:${user.id}`])).rows[0];return json({ user, local: localMode() && !clerkReady(), aiReady: aiReady(), aiQuota:{used:quota?.count||0,limit:aiRequestLimit(),resetsAt:quota?.resets_at||null},flags: (await db.query('SELECT * FROM feature_flags ORDER BY key')).rows });}
    if (path.join('/') === 'workspace') return json({
      roadmaps: await listRoadmaps(user), evidence: await getEvidence(user),
      assignments: (await db.query<Assignment>('SELECT * FROM assignments WHERE learner_id=$1 ORDER BY due_date LIMIT 100',[user.id])).rows,
      attempts: (await db.query('SELECT id,started_at,result FROM practice_attempts WHERE learner_id=$1 AND result IS NOT NULL ORDER BY started_at DESC LIMIT 20',[user.id])).rows,
      personalPractice:await practiceOverview(user),
    });
    if (path.length === 2 && path[0] === 'roadmaps') {
      const map = await ownedRoadmap(user,path[1]);
      const guidance=(await db.query<{milestone_id:string;content:unknown}>('SELECT milestone_id,content FROM advice WHERE roadmap_id=$1 AND version=$2',[map.id,map.version])).rows;
      return json({ roadmap: map, advice:Object.fromEntries(guidance.map(a=>[a.milestone_id,a.content])),evidence: await getEvidence(user,map.id), revisions: (await db.query('SELECT version,created_at FROM revisions WHERE roadmap_id=$1 ORDER BY version DESC LIMIT 30',[map.id])).rows });
    }
    if (path.join('/') === 'organization') return json(await organizationOverview(user));
    if (path.join('/') === 'notebook') {
      const entries=(await db.query<{ question_id:string;note:string;reviewed:boolean }>('SELECT question_id,note,reviewed FROM error_notebook WHERE learner_id=$1 ORDER BY updated_at DESC',[user.id])).rows;
      return json({ entries:entries.map(e=>({ ...e,question:questions.find(q=>q.id===e.question_id) })),personalEntries:await personalNotebook(user) });
    }
    if (path.join('/') === 'admin/directory') {
      requireRole(user,['admin']);
      return json({ organizations:(await db.query('SELECT id,name FROM organizations ORDER BY name')).rows,users:(await db.query('SELECT u.id,u.name,u.role,m.organization_id,m.assigned_teacher_id FROM app_users u LEFT JOIN memberships m ON m.user_id=u.id ORDER BY u.name LIMIT 200')).rows });
    }
    if (path.join('/') === 'admin') {
      requireRole(user,['admin']);
      return json({ flags: (await db.query('SELECT * FROM feature_flags ORDER BY key')).rows,
        counts: (await db.query('SELECT (SELECT COUNT(*)::int FROM app_users) AS users,(SELECT COUNT(*)::int FROM roadmaps) AS roadmaps,(SELECT COUNT(*)::int FROM evidence) AS evidence')).rows[0],
        events: (await db.query('SELECT action,created_at FROM audit_events ORDER BY created_at DESC LIMIT 50')).rows,
        services: { identity: clerkReady() ? 'Clerk configured, live verification pending' : localMode() ? 'Local development accounts' : 'Not configured', database: process.env.DATABASE_URL ? 'Hosted PostgreSQL configured, live verification pending' : 'Local PostgreSQL development storage', ai: aiReady() ? 'Configured, live verification pending' : 'API key and model required' } });
    }
    if (path.length === 2 && path[0] === 'practice') {
      const attempt = (await db.query<{ id: string; question_ids: string[]; result: unknown; deadline: string }>('SELECT id,question_ids,result,deadline FROM practice_attempts WHERE id=$1 AND learner_id=$2',[path[1],user.id])).rows[0];
      if (!attempt) throw new ApiError(404,'Attempt not found.');
      return json({ ...attempt, questions: attempt.result ? undefined : questions.filter(q => attempt.question_ids.includes(q.id)).map(({ answer: _answer, explanation: _explanation, ...q }) => q) });
    }
    throw new ApiError(404,'Endpoint not found.');
  } catch (error) { return failure(error); }
}

export async function POST(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const { path } = await context.params;
    const input = await body(request);
    if (path.join('/') === 'auth/login') {
      if (!localMode() || clerkReady()) throw new ApiError(404,'Development sign-in is unavailable.');
      const { username, password } = z.object({ username: z.string().trim().min(1).max(50), password: z.string().min(1).max(200) }).parse(input);
      await consumeQuota(`login:${tokenHash(username)}`,15,300);
      const db = await getDb();
      const account = (await db.query<User & { password_hash: string }>('SELECT id,name,role,password_hash FROM app_users WHERE username=$1',[username])).rows[0];
      if (!checkPassword(password,account?.password_hash || fakeHash) || !account) throw new ApiError(401,'Username or password is incorrect.');
      const token = sessionToken();
      await db.query('DELETE FROM sessions WHERE expires_at<=NOW()');
      await db.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '8 hours')",[tokenHash(token),account.id]);
      (await cookies()).set('pathfinder_session',token,{ httpOnly:true, sameSite:'lax', secure:new URL(request.url).protocol==='https:', path:'/', maxAge:28800 });
      await audit(db,account.id,'session.created');
      return json({ next: account.role === 'admin' ? '/admin' : ['teacher','owner'].includes(account.role) ? '/org' : '/app' });
    }
    const user = await requireUser(), db = await getDb();
    if(path[0]==='quiz')return json(await quizPost(user,path,input));
    if(path[0]==='discussions')return json(await discussionPost(user,path,input,request.signal));
    if(path[0]==='self-quizzes')return json(await selfQuizPost(user,path,input,request.signal));
    if (path.join('/')==='profile') {
      const p=z.object({ name:z.string().trim().min(2).max(80) }).parse(input);
      await db.query('UPDATE app_users SET name=$1 WHERE id=$2',[p.name,user.id]);return json({ok:true});
    }
    if (path.join('/')==='notebook') {
      const p=z.object({ questionId:z.string().max(64),note:z.string().trim().max(2000),reviewed:z.boolean() }).parse(input);
      if (!questions.some(q=>q.id===p.questionId)) throw new ApiError(400,'Unknown question.');
      await db.query('INSERT INTO error_notebook(learner_id,question_id,note,reviewed) VALUES($1,$2,$3,$4) ON CONFLICT(learner_id,question_id) DO UPDATE SET note=EXCLUDED.note,reviewed=EXCLUDED.reviewed,updated_at=NOW()',[user.id,p.questionId,p.note,p.reviewed]);return json({ok:true});
    }
    if (path.join('/') === 'auth/logout') {
      const jar = await cookies(), token = jar.get('pathfinder_session')?.value;
      if (token) await db.query('DELETE FROM sessions WHERE token_hash=$1',[tokenHash(token)]);
      jar.delete('pathfinder_session'); return json({ ok:true });
    }
    if (path.join('/') === 'roadmaps') {
      requireRole(user,['learner']);
      const parsed = z.object({ intake:intakeSchema, mode:z.enum(['manual','ai']), firstTitle:z.string().trim().min(3).max(160).optional(), firstHours:z.number().int().min(1).max(200).optional() }).parse(input);
      await consumeQuota(`create:${user.id}`,30,3600);
      if (parsed.mode === 'manual' && (!parsed.firstTitle || !parsed.firstHours)) throw new ApiError(400,'Add a first milestone and its estimated hours.');
      const graph = parsed.mode === 'ai' ? await generateRoadmap(user.id,parsed.intake,request.signal) : manualGraph(parsed.intake,parsed.firstTitle!,parsed.firstHours!);
      return json({ roadmap:await createRoadmap(user,parsed.intake,graph,parsed.mode) },201);
    }
    if (path[0] === 'roadmaps' && path.length === 3) {
      const id = path[1], action = path[2];
      if (action === 'mark') {
        const p = z.object({ version:versionSchema, milestoneId:z.string().max(64), mark:z.enum(['known','complete']).nullable() }).parse(input);
        return json({ roadmap:await markMilestone(user,id,p.version,p.milestoneId,p.mark) });
      }
      if (action === 'evidence') return json({ evidence:await addEvidence(user,id,evidenceInput.parse(input)) },201);
      if (action === 'advice') {
        const p = z.object({ milestoneId:z.string().max(64) }).parse(input);
        return json({ advice:await generateAdvice(user.id,await ownedRoadmap(user,id),p.milestoneId,request.signal) });
      }
      if (action === 'milestone') {
        const p = z.object({ version:versionSchema, title:z.string().trim().min(3).max(160), description:z.string().trim().min(10).max(800), hours:z.number().int().min(1).max(200), kind:z.enum(['skill','project','certification']), phase:z.number().int().min(1).max(98), prerequisites:z.array(z.string().max(64)).max(30) }).parse(input);
        const roadmap = await reviseRoadmap(user,id,p.version,map => {
          if (map.graph.milestones.length >= 80) throw new ApiError(400,'A roadmap can contain at most 80 milestones.');
          if (p.prerequisites.some(id => map.graph.milestones.find(n => n.id === id)?.kind === 'role')) throw new ApiError(400,'Select skills or projects as prerequisites.');
          const nodeId = randomUUID();
          const node = milestoneSchema.parse({ ...p,id:nodeId,skillId:`custom-${nodeId}`,phaseTitle:`Phase ${p.phase}`,prerequisiteMode:'all',deliverable:'Save evidence of your work on this milestone.' });
          const target = [...map.graph.milestones].reverse().find(n => n.kind === 'role')!;
          return { graph:{ ...map.graph,milestones:[...map.graph.milestones.map(n => n.id===target.id ? { ...n,phase:Math.max(n.phase,p.phase),prerequisites:[...n.prerequisites,nodeId] } : n),node] },marks:map.marks };
        });
        return json({ roadmap });
      }
      if (action === 'restore') {
        const p = z.object({ version:versionSchema, restoreVersion:versionSchema }).parse(input);
        const snapshot = (await db.query<{ snapshot:Roadmap }>('SELECT snapshot FROM revisions WHERE roadmap_id=$1 AND version=$2 AND EXISTS(SELECT 1 FROM roadmaps WHERE id=$1 AND owner_id=$3)',[id,p.restoreVersion,user.id])).rows[0]?.snapshot;
        if (!snapshot) throw new ApiError(404,'Revision not found.');
        return json({ roadmap:await reviseRoadmap(user,id,p.version,map => ({ graph:snapshot.graph,marks:Object.fromEntries(Object.entries({ ...snapshot.marks,...map.marks }).filter(([key]) => snapshot.graph.milestones.some(n => n.id===key))) })) });
      }
      if (action === 'constraints') {
        const p=z.object({ version:versionSchema,hoursPerWeek:z.number().int().min(1).max(60),targetMonths:z.number().int().min(1).max(36),budget:z.enum(['free','flexible']) }).parse(input);
        return json({roadmap:await reviseRoadmap(user,id,p.version,map=>({graph:map.graph,marks:map.marks,intake:{...map.intake,hoursPerWeek:p.hoursPerWeek,targetMonths:p.targetMonths,budget:p.budget}}))});
      }
      if (action === 'edit') {
        const p=z.object({version:versionSchema,milestoneId:z.string().max(64),title:z.string().trim().min(3).max(160),description:z.string().trim().min(10).max(800),hours:z.number().int().min(0).max(600),deliverable:z.string().trim().min(3).max(500)}).parse(input);
        return json({roadmap:await reviseRoadmap(user,id,p.version,map=>{
          if(!map.graph.milestones.some(n=>n.id===p.milestoneId))throw new ApiError(404,'Milestone not found.');
          return {graph:{...map.graph,milestones:map.graph.milestones.map(n=>n.id===p.milestoneId?{...n,title:p.title,description:p.description,hours:p.hours,deliverable:p.deliverable}:n)},marks:map.marks};
        })});
      }
      if (action === 'share') {
        const p=z.object({confirmedPublic:z.literal(true)}).parse(input);void p;
        const map=await ownedRoadmap(user,id),token=sessionToken();
        const snapshot={graph:map.graph,origin:map.origin,version:map.version,hoursPerWeek:map.intake.hoursPerWeek};
        await db.transaction(async tx=>{await tx.query('UPDATE roadmap_shares SET revoked=true WHERE roadmap_id=$1 AND owner_id=$2',[id,user.id]);await tx.query('INSERT INTO roadmap_shares(token_hash,roadmap_id,owner_id,snapshot) VALUES($1,$2,$3,$4::jsonb)',[tokenHash(token),id,user.id,JSON.stringify(snapshot)]);await audit(tx,user.id,'roadmap.share.created',id);});
        return json({path:`/share/${token}`});
      }
      if (action === 'revoke') {
        await ownedRoadmap(user,id);await db.query('UPDATE roadmap_shares SET revoked=true WHERE roadmap_id=$1 AND owner_id=$2',[id,user.id]);await audit(db,user.id,'roadmap.share.revoked',id);return json({ok:true});
      }
    }
    if (path.join('/') === 'organization/review') {
      requireRole(user,['teacher','owner']);
      const p = z.object({ evidenceId:z.string().max(64), status:z.enum(['approved','changes_requested']), feedback:z.string().trim().min(10).max(2000) }).parse(input);
      await db.transaction(async tx => {
        const evidence = (await tx.query<{ learner_id:string }>('SELECT learner_id FROM evidence WHERE id=$1',[p.evidenceId])).rows[0];
        if (!evidence) throw new ApiError(404,'Evidence not found.');
        await canTeach(user,evidence.learner_id,tx);
        await tx.query('UPDATE evidence SET status=$1,feedback=$2,reviewer_id=$3 WHERE id=$4',[p.status,p.feedback,user.id,p.evidenceId]);
        await audit(tx,user.id,'evidence.reviewed',p.evidenceId);
      });
      return json({ ok:true });
    }
    if (path.join('/') === 'organization/assign') {
      const p = z.object({ learnerId:z.string().max(64),title:z.string().trim().min(3).max(180),instructions:z.string().trim().min(10).max(2000),dueDate:z.iso.date() }).parse(input);
      await db.transaction(async tx => {
        await canTeach(user,p.learnerId,tx);
        const id = randomUUID();
        await tx.query('INSERT INTO assignments(id,learner_id,teacher_id,title,instructions,due_date) VALUES($1,$2,$3,$4,$5,$6)',[id,p.learnerId,user.id,p.title,p.instructions,p.dueDate]);
        await audit(tx,user.id,'assignment.created',id);
      }); return json({ ok:true },201);
    }
    if (path.join('/') === 'assignments/complete') {
      const p = z.object({ id:z.string().max(64),completed:z.boolean() }).parse(input);
      const { rows } = await db.query('UPDATE assignments SET completed=$1 WHERE id=$2 AND learner_id=$3 RETURNING id',[p.completed,p.id,user.id]);
      if (!rows[0]) throw new ApiError(404,'Assignment not found.'); return json({ ok:true });
    }
    if (path.join('/') === 'admin/flag') {
      requireRole(user,['admin']);
      const p = z.object({ key:z.enum(['roadmap_generation','solo_practice','classroom_quiz','discussion_practice','personal_quizzes']),enabled:z.boolean() }).parse(input);
      await db.transaction(async tx => { await tx.query('UPDATE feature_flags SET enabled=$1 WHERE key=$2',[p.enabled,p.key]); await audit(tx,user.id,`flag.${p.key}.${p.enabled ? 'enabled' : 'disabled'}`); });
      return json({ ok:true });
    }
    if (path.join('/')==='admin/organization') {
      requireRole(user,['admin']);const p=z.object({name:z.string().trim().min(3).max(120)}).parse(input);const id=randomUUID();
      await db.transaction(async tx=>{await tx.query('INSERT INTO organizations(id,name) VALUES($1,$2)',[id,p.name]);await audit(tx,user.id,'organization.created',id);});return json({id},201);
    }
    if (path.join('/')==='admin/member') {
      requireRole(user,['admin']);const p=z.object({userId:z.string().max(100),role:z.enum(['learner','teacher','owner']),organizationId:z.string().max(64).nullable(),teacherId:z.string().max(100).nullable()}).parse(input);
      await db.transaction(async tx=>{
        const member=(await tx.query<User>('SELECT id,name,role FROM app_users WHERE id=$1 FOR UPDATE',[p.userId])).rows[0];
        if(!member||member.role==='admin')throw new ApiError(400,'Choose an existing non-admin account.');
        if(p.teacherId&&(!p.organizationId||p.role!=='learner'))throw new ApiError(400,'Only a learner in an organization can have an assigned teacher.');
        if(p.organizationId&&!(await tx.query('SELECT id FROM organizations WHERE id=$1',[p.organizationId])).rows[0])throw new ApiError(400,'Organization not found.');
        if(p.teacherId&&!(await tx.query("SELECT u.id FROM app_users u JOIN memberships m ON m.user_id=u.id WHERE u.id=$1 AND u.role IN ('teacher','owner') AND m.organization_id=$2",[p.teacherId,p.organizationId])).rows[0])throw new ApiError(400,'Choose a teacher from the same organization.');
        // Moving or demoting staff removes their existing assignments before installing the new membership.
        await tx.query('UPDATE memberships SET assigned_teacher_id=NULL WHERE assigned_teacher_id=$1',[p.userId]);
        await tx.query('DELETE FROM memberships WHERE user_id=$1',[p.userId]);
        await tx.query('UPDATE app_users SET role=$1 WHERE id=$2',[p.role,p.userId]);
        if(p.organizationId)await tx.query('INSERT INTO memberships(user_id,organization_id,assigned_teacher_id) VALUES($1,$2,$3)',[p.userId,p.organizationId,p.teacherId]);
        await audit(tx,user.id,'membership.changed',p.userId);
      });return json({ok:true});
    }
    if (path.join('/') === 'practice/start') {
      requireRole(user,['learner']);
      if (!await flagEnabled('solo_practice')) throw new ApiError(503,'Practice is temporarily paused. Existing attempts remain available.');
      await consumeQuota(`practice:${user.id}`,30,3600);
      const id = randomUUID();
      await db.query("INSERT INTO practice_attempts(id,learner_id,question_ids,deadline) VALUES($1,$2,$3::jsonb,NOW()+INTERVAL '5 minutes')",[id,user.id,JSON.stringify(questions.map(q => q.id))]);
      return json({ id },201);
    }
    if (path.length === 3 && path[0] === 'practice' && path[2] === 'submit') {
      const p = z.object({ answers:z.record(z.string().max(64),z.number().int().min(0).max(3)) }).parse(input);
      if (Object.keys(p.answers).length > questions.length) throw new ApiError(400,'Too many answers.');
      const result = await db.transaction(async tx => {
        const attempt = (await tx.query<{ question_ids:string[]; result:unknown; deadline:string; started_at:string }>('SELECT * FROM practice_attempts WHERE id=$1 AND learner_id=$2 FOR UPDATE',[path[1],user.id])).rows[0];
        if (!attempt) throw new ApiError(404,'Attempt not found.');
        if (attempt.result) return attempt.result;
        if (Object.keys(p.answers).some(id => !attempt.question_ids.includes(id))) throw new ApiError(400,'Answer refers to an unknown question.');
        const expired = Date.now()>new Date(attempt.deadline).getTime();
        const answers = expired ? {} : p.answers;
        const result = { ...scoreAnswers(attempt.question_ids,answers),expired,seconds:Math.round((Date.now()-new Date(attempt.started_at).getTime())/1000) };
        await tx.query('UPDATE practice_attempts SET answers=$1::jsonb,result=$2::jsonb WHERE id=$3',[JSON.stringify(answers),JSON.stringify(result),path[1]]);
        if(!expired)for(const detail of result.details.filter(q=>!q.correct))await tx.query('INSERT INTO error_notebook(learner_id,question_id) VALUES($1,$2) ON CONFLICT(learner_id,question_id) DO UPDATE SET reviewed=false,updated_at=NOW()',[user.id,detail.id]);
        await audit(tx,user.id,'practice.completed',path[1]); return result;
      }); return json({ result });
    }
    throw new ApiError(404,'Endpoint not found.');
  } catch (error) { return failure(error); }
}
