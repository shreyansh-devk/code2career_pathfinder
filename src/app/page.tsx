import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { currentUser } from '@/lib/auth';
import { surfaceForHost, workspaceUrl } from '@/lib/surfaces';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await currentUser();
  if (user) redirect(workspaceUrl(user.role));
  const surface = surfaceForHost((await headers()).get('host'));
  if (surface) redirect(surface.path);
  redirect('/sign-in');
}
