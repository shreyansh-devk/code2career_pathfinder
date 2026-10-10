import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await currentUser();
  redirect(!user ? '/sign-in' : user.role==='admin' ? '/admin' : ['teacher','owner'].includes(user.role) ? '/org' : '/app');
}
