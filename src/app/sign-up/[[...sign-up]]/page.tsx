import { SignUp } from '@clerk/nextjs';
import { clerkReady } from '@/lib/auth';
export default function SignUpPage() { return <main className="center-page">{clerkReady() ? <SignUp /> : <><h1>Create an account</h1><p>Managed sign-up is not configured in this environment.</p><a href="/sign-in">Return to sign-in</a></>}</main>; }
