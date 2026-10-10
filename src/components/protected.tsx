import { redirect } from 'next/navigation';
import { currentUser, clerkReady, type User } from '@/lib/auth';
import { localMode } from '@/lib/db';
import { workspaceUrl } from '@/lib/surfaces';
import { Shell } from './shell';
export async function Protected({ roles,children }: { roles:User['role'][];children:React.ReactNode }) {
  const user = await currentUser(); if (!user) redirect('/sign-in');
  if (!roles.includes(user.role)) redirect(workspaceUrl(user.role));
  return <Shell user={user} local={localMode() && !clerkReady()} managed={clerkReady()}>{children}</Shell>;
}
