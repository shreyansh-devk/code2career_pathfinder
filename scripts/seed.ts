import nextEnv from '@next/env';
import { getDb, localMode } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';
nextEnv.loadEnvConfig(process.cwd(), true);
if (!localMode() || process.env.DATABASE_URL) throw new Error('Seed only an isolated local development database.');
const password = process.env.DEV_ACCOUNT_PASSWORD;
if (!password || password.length < 12) throw new Error('Set DEV_ACCOUNT_PASSWORD to at least 12 characters.');
const db = await getDb();
await db.transaction(async tx => {
  const accounts = [
    ['dev-learner', 'Alex Morgan', 'learner', 'learner'],
    ['dev-learner-two', 'Sam Rivera', 'learner-two', 'learner'],
    ['dev-teacher', 'Priya Shah', 'teacher', 'teacher'],
    ['dev-admin', 'Platform operator', 'admin', 'admin'],
    ['dev-other-teacher', 'Other organization teacher', 'other-teacher', 'teacher'],
  ];
  for (const [id,name,username,role] of accounts) await tx.query('INSERT INTO app_users(id,name,username,role,password_hash) VALUES ($1,$2,$3,$4,$5) ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash', [id,name,username,role,hashPassword(password)]);
  await tx.query("INSERT INTO organizations(id,name) VALUES ('org-pathfinder','Pathfinder learning lab'),('org-other','Second learning lab') ON CONFLICT DO NOTHING");
  await tx.query("INSERT INTO memberships(user_id,organization_id,assigned_teacher_id) VALUES ('dev-learner','org-pathfinder','dev-teacher'),('dev-teacher','org-pathfinder',NULL),('dev-learner-two','org-other','dev-other-teacher'),('dev-other-teacher','org-other',NULL) ON CONFLICT DO NOTHING");
});
if(process.env.PATHFINDER_LOAD_USERS==='true'){
  if(!process.env.LOCAL_DATABASE_PATH?.includes('e2e'))throw new Error('Load accounts require an isolated e2e database.');
  const passwordHash=hashPassword(password);
  await db.transaction(async tx=>{for(let i=1;i<=50;i++){const id=`load-learner-${i}`;await tx.query("INSERT INTO app_users(id,name,username,role,password_hash) VALUES($1,$2,$3,'learner',$4) ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash",[id,`Load participant ${i}`,id,passwordHash]);await tx.query("INSERT INTO memberships(user_id,organization_id,assigned_teacher_id) VALUES($1,'org-pathfinder','dev-teacher') ON CONFLICT DO NOTHING",[id]);}});
  console.log('50 synthetic load-test learners added to the isolated e2e database.');
}
await db.close();
console.log('Local development accounts prepared. No learner roadmaps or fake AI output were seeded.');
