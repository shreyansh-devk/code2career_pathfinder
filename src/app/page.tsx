import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { currentUser } from '@/lib/auth';
import { surfaceForHost } from '@/lib/surfaces';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const surface = surfaceForHost((await headers()).get('host'));
  if (surface) redirect(surface.path);
  const user = await currentUser();
  redirect(!user ? '/sign-in' : user.role==='admin' ? '/admin' : ['teacher','owner'].includes(user.role) ? '/org' : '/app');
}
