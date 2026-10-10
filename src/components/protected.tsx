import { redirect } from 'next/navigation';
import { currentUser, clerkReady, type User } from '@/lib/auth';
import { localMode } from '@/lib/db';
import { Shell } from './shell';
export async function Protected({ roles,children }: { roles:User['role'][];children:React.ReactNode }) {
  const user = await currentUser(); if (!user) redirect('/sign-in');
  if (!roles.includes(user.role)) return <main className="center-page"><h1>This workspace is restricted</h1><p>Your account does not have the required role.</p><a href="/">Open your workspace</a></main>;
  return <Shell user={user} local={localMode() && !clerkReady()} managed={clerkReady()}>{children}</Shell>;
}
