import nextEnv from '@next/env';
import { getDb } from '../src/lib/db';
import { migration } from '../src/lib/schema';
nextEnv.loadEnvConfig(process.cwd());
const db = await getDb();
await db.query(migration);
await db.close();
console.log('Initial additive schema migration completed.');
