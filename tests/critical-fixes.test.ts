import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { migration } from '../src/lib/schema';
import type { Database } from '../src/lib/db';
import { syncManagedUser, requireRole, type User } from '../src/lib/auth';
import { intakeSchema, manualGraph } from '../src/lib/domain';
import { createRoadmap, markMilestone, restoreRoadmap } from '../src/lib/store';
import { discussionPost } from '../src/lib/discussion';
import { quizPost } from '../src/lib/quiz';
import { failure } from '../src/lib/http';

const learner:User={ id:'regression-learner', name:'Regression learner', role:'learner' };
const teacher:User={ id:'regression-teacher', name:'Regression teacher', role:'teacher' };
const other:User={ ...learner, id:'regression-other' };
const intake=intakeSchema.parse({ goal:'Backend engineer', hoursPerWeek:6, targetMonths:6, budget:'free' });
let db:PGlite;
const signal=()=>new AbortController().signal;
before(async () => {
  db=new PGlite(); await db.exec(migration);
  const adapter:Database={
    query:async (sql,params)=>(await db.query(sql,params)) as never,
    transaction:fn=>db.transaction(tx=>fn({ query:async (sql,params)=>(await tx.query(sql,params)) as never })),
    close:()=>db.close(),
  };
  (globalThis as typeof globalThis & { pathfinderDb?:Promise<Database> }).pathfinderDb=Promise.resolve(adapter);
  for(const user of [learner,teacher,other]) await db.query('INSERT INTO app_users(id,name,role) VALUES($1,$2,$3)',[user.id,user.name,user.role]);
  await db.query("INSERT INTO organizations(id,name) VALUES('regression-org','Regression organization')");
  for(const user of [learner,teacher]) await db.query("INSERT INTO memberships(user_id,organization_id) VALUES($1,'regression-org')",[user.id]);
});
after(async () => { await db.close(); });

test('restoring structure preserves deliberate progress removal and current marks', async () => {
  const map=await createRoadmap(learner,intake,manualGraph(intake,'HTTP foundations',8),'manual');
  const marked=await markMilestone(learner,map.id,1,'first-skill','known');
  const cleared=await markMilestone(learner,map.id,marked.version,'first-skill',null);
  const restored=await restoreRoadmap(learner,map.id,cleared.version,marked.version);
  assert.deepEqual(restored.marks,{});
  assert.deepEqual(restored.graph,marked.graph);
  const completed=await markMilestone(learner,map.id,restored.version,'first-skill','complete');
  const earlier=await restoreRoadmap(learner,map.id,completed.version,1);
  assert.equal(earlier.marks['first-skill'],'complete');
  await assert.rejects(restoreRoadmap(other,map.id,earlier.version,1),{ status:404 });
  await assert.rejects(restoreRoadmap(learner,map.id,1,1),{ status:409 });
});

test('managed admin allowlist revokes existing privileges while preserving staff roles', async () => {
  const allowed=await syncManagedUser(db,'managed-admin',' managed-admin ');
  requireRole(allowed,['admin']);
  const revoked=await syncManagedUser(db,'managed-admin','');
  assert.equal(revoked.role,'learner');
  assert.throws(()=>requireRole(revoked,['admin']),{ status:403 });
  assert.equal((await db.query<{role:string}>("SELECT role FROM app_users WHERE id='managed-admin'")).rows[0].role,'learner');
  assert.equal((await syncManagedUser(db,teacher.id,'')).role,'teacher');
  assert.equal((await syncManagedUser(db,'managed-admin','managed-admin')).role,'admin');
});

test('domain validation returns 400 while unknown infrastructure errors remain redacted', async () => {
  const invalid=manualGraph(intake,'HTTP foundations',8);
  invalid.milestones.at(-1)!.prerequisites=['missing'];
  await assert.rejects(createRoadmap(learner,intake,invalid,'manual'), error => {
    const response=failure(error);
    assert.equal(response.status,400);
    return true;
  });
  const response=failure(new Error('Private database connection information'));
  assert.equal(response.status,503);
  assert.doesNotMatch(await response.text(),/Private database/);
});

test('rejected discussion requests and rolled-back admission do not spend AI quota', async () => {
  const previous=process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY='test-only-key';
  try {
    await db.query("UPDATE feature_flags SET enabled=true WHERE key IN ('discussion_practice','roadmap_generation')");
    await db.query("INSERT INTO discussions(id,learner_id,topic,participants) VALUES('regression-discussion',$1,'How should API reliability be measured?','[]'::jsonb)",[learner.id]);
    await db.query("INSERT INTO quotas(key,count,resets_at) VALUES($1,2,NOW()+INTERVAL '1 day')",[`ai:${learner.id}`]);
    const count=async()=> (await db.query<{count:number}>('SELECT count FROM quotas WHERE key=$1',[`ai:${learner.id}`])).rows[0].count;
    const post=(user:User,version=1)=>discussionPost(user,['discussions','regression-discussion','turn'],{ version,text:'Measure errors and response latency together.' },signal());
    await assert.rejects(post(other),{ status:404 });
    assert.equal((await db.query('SELECT count FROM quotas WHERE key=$1',[`ai:${other.id}`])).rows.length,0);
    await assert.rejects(post(learner,99),{ status:409 }); assert.equal(await count(),2);
    await db.query("UPDATE discussions SET status='paused' WHERE id='regression-discussion'");
    await assert.rejects(post(learner),{ status:409 }); assert.equal(await count(),2);
    await db.query("UPDATE discussions SET status='active' WHERE id='regression-discussion'");
    await db.exec(`CREATE FUNCTION reject_discussion_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Injected discussion write failure'; END $$;
      CREATE TRIGGER reject_discussion_write BEFORE UPDATE ON discussions FOR EACH ROW EXECUTE FUNCTION reject_discussion_write();`);
    await assert.rejects(post(learner),/Injected discussion write failure/);
    assert.equal(await count(),2,'Quota increment rolls back with failed admission.');
    await db.exec('DROP TRIGGER reject_discussion_write ON discussions');
    const stored=(await db.query<{status:string;turns:unknown[];version:number}>("SELECT status,turns,version FROM discussions WHERE id='regression-discussion'")).rows[0];
    assert.equal(stored.status,'active'); assert.equal(stored.version,1); assert.deepEqual(stored.turns,[]);
  } finally {
    if(previous===undefined)delete process.env.OPENROUTER_API_KEY;else process.env.OPENROUTER_API_KEY=previous;
  }
});

test('classroom resources roll back when their required audit fails', async () => {
  const question={ id:'q1',text:'Which value follows 2, 4, 6?',topic:'logical',difficulty:'easy',options:['7','8','9','10'],answer:1,explanation:'The sequence increases by two.' };
  await db.query("UPDATE feature_flags SET enabled=true WHERE key='classroom_quiz'");
  await db.exec(`CREATE FUNCTION reject_quiz_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF NEW.action IN ('quiz.set.created','quiz.room.created') THEN RAISE EXCEPTION 'Injected quiz audit failure'; END IF;
    RETURN NEW; END $$;
    CREATE TRIGGER reject_quiz_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_quiz_audit();`);
  await assert.rejects(quizPost(teacher,['quiz','sets'],{ title:'Regression question set',questions:[question] }),/Injected quiz audit failure/);
  assert.equal((await db.query('SELECT id FROM quiz_sets')).rows.length,0);
  await db.exec('DROP TRIGGER reject_quiz_audit ON audit_events');
  const set=await quizPost(teacher,['quiz','sets'],{ title:'Regression question set',questions:[question] }) as {id:string};
  await db.exec('CREATE TRIGGER reject_quiz_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_quiz_audit()');
  await assert.rejects(quizPost(teacher,['quiz','create'],{ setId:set.id,seconds:10 }),/Injected quiz audit failure/);
  assert.equal((await db.query('SELECT id FROM quiz_rooms')).rows.length,0);
  await db.exec('DROP TRIGGER reject_quiz_audit ON audit_events');
  const room=await quizPost(teacher,['quiz','create'],{ setId:set.id,seconds:10 }) as {id:string};
  assert.ok(room.id);
  assert.equal((await db.query("SELECT id FROM audit_events WHERE action='quiz.room.created'")).rows.length,1);
});
