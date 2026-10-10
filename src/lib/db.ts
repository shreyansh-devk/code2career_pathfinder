import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import { resolve, dirname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { migration } from './schema';

export interface Sql {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
export interface Database extends Sql {
  transaction<T>(fn: (tx: Sql) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
const globalDb = globalThis as typeof globalThis & { pathfinderDb?: Promise<Database> };
export function localMode() { return process.env.NODE_ENV !== 'production' && process.env.ENABLE_LOCAL_AUTH === 'true'; }
export function getDb(): Promise<Database> {
  if (!globalDb.pathfinderDb) globalDb.pathfinderDb = createDb().catch(error => { globalDb.pathfinderDb = undefined; throw error; });
  return globalDb.pathfinderDb;
}
async function createDb(): Promise<Database> {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 5000 });
    return {
      query: async <T>(sql: string, params: unknown[] = []) => ({ rows: (await pool.query(sql, params)).rows as T[] }),
      transaction: async fn => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const result = await fn({ query: async <T>(sql: string, params: unknown[] = []) => ({ rows: (await client.query(sql, params)).rows as T[] }) });
          await client.query('COMMIT'); return result;
        } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
      }, close: async () => { await pool.end(); },
    };
  }
  if (!localMode()) throw new Error('DATABASE_NOT_CONFIGURED');
  const directory = resolve(/* turbopackIgnore: true */ process.env.LOCAL_DATABASE_PATH || '.data/postgres');
  await mkdir(dirname(directory), { recursive: true });
  const db = new PGlite(directory);
  await db.exec(migration);
  const sql: Sql = { query: async <T>(s: string, p: unknown[] = []) => ({ rows: (await db.query(s, p)).rows as T[] }) };
  return { ...sql, transaction: async fn => db.transaction(tx => fn({ query: async <T>(s: string, p: unknown[] = []) => ({ rows: (await tx.query(s, p)).rows as T[] }) })), close: () => db.close() };
}
