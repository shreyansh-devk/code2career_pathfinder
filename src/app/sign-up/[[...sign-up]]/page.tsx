import { SignUp } from '@clerk/nextjs';
import { headers } from 'next/headers';
import { clerkReady } from '@/lib/auth';
import { surfaceForHost } from '@/lib/surfaces';
export default async function SignUpPage() {
  const target = surfaceForHost((await headers()).get('host'))?.path;
  return <main className="center-page">{clerkReady() ? <SignUp forceRedirectUrl={target} signInForceRedirectUrl={target} /> : <><h1>Create an account</h1><p>Managed sign-up is not configured in this environment.</p><a href="/sign-in">Return to sign-in</a></>}</main>;
}
