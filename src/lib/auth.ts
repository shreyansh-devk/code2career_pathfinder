import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { getDb, localMode, type Sql } from './db';
import { tokenHash } from './security';
import { ApiError } from './http';

export type User = { id: string; name: string; role: 'learner' | 'teacher' | 'owner' | 'admin' };
export function clerkReady() { return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY); }
export async function syncManagedUser(db: Sql, userId: string, adminIds: string): Promise<User> {
  const isAdmin = adminIds.split(',').map(id => id.trim()).filter(Boolean).includes(userId);
  // The server allowlist is the continuing authority, including revocation.
  const { rows } = await db.query<User>(`INSERT INTO app_users(id,name,role) VALUES ($1,'Learner',$2)
    ON CONFLICT(id) DO UPDATE SET role=CASE
      WHEN EXCLUDED.role='admin' THEN 'admin'
      WHEN app_users.role='admin' THEN 'learner'
      ELSE app_users.role END
    RETURNING id,name,role`, [userId,isAdmin ? 'admin' : 'learner']);
  return rows[0];
}
export async function currentUser(): Promise<User | null> {
  if (clerkReady()) {
    const { userId } = await auth(); if (!userId) return null;
    const db = await getDb();
    return syncManagedUser(db,userId,process.env.PLATFORM_ADMIN_IDS || '');
  }
  if (!localMode()) return null;
  const token = (await cookies()).get('pathfinder_session')?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await (await getDb()).query<User>(`SELECT u.id,u.name,u.role FROM sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()`, [tokenHash(token)]);
  return rows[0] || null;
}
export async function requireUser() { const user = await currentUser(); if (!user) throw new ApiError(401, 'Sign in to continue.'); return user; }
export function requireRole(user: User, roles: User['role'][]) { if (!roles.includes(user.role)) throw new ApiError(403, 'Your account cannot use this workspace.'); }
