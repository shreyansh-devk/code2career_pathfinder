import { SignIn } from '@clerk/nextjs';
import { headers } from 'next/headers';
import { Compass, ArrowUpRight } from 'lucide-react';
import { clerkReady } from '@/lib/auth';
import { localMode } from '@/lib/db';
import { LocalSignIn } from '@/components/sign-in';
import { surfaceForHost } from '@/lib/surfaces';
export const dynamic = 'force-dynamic';
export default async function SignInPage() {
  const target = surfaceForHost((await headers()).get('host'))?.path;
  return <main className="signin"><section className="signin-story">
    <a className="brand" href="/"><Compass size={28} /> Pathfinder<span className="brand-sub">Code to Career</span></a>
    <div><p className="tag">A plan you can act on</p><h1>Find your direction.<br />Build the evidence.</h1><p>Turn a specific career goal into skills, projects and a path you can follow. Keep your progress and your teacher’s feedback in one workspace.</p></div>
    <div className="signin-foot"><ArrowUpRight /><span>Career roadmaps · Practice · Teacher review</span></div>
  </section><section className="signin-form"><div className="signin-form-inner"><p className="muted">Your learning workspace</p><h2>Welcome to Pathfinder</h2><p className="muted">Sign in to pick up where you left off.</p>
    {clerkReady() ? <SignIn forceRedirectUrl={target} signUpForceRedirectUrl={target} /> : localMode() ? <><p className="notice">Local development environment</p><LocalSignIn /></> : <p className="notice">Sign-in has not been configured. Set the managed identity and database credentials before opening this environment to users.</p>}
  </div></section></main>;
}
