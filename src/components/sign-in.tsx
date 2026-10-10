'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
export function LocalSignIn() {
  const [error,setError] = useState(''),[busy,setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const form = new FormData(event.currentTarget);
    try { const result = await api<{ next:string }>('auth/login',{ username:form.get('username'),password:form.get('password') }); window.location.assign(result.next); }
    catch (error) { setError((error as Error).message); setBusy(false); }
  }
  return <form onSubmit={submit} className="stack">
    <label>Username<input name="username" autoComplete="username" required maxLength={50} placeholder="learner" /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label>
    {error && <p role="alert" className="error">{error}</p>}
    <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to workspace'}</button>
    <details><summary>Local development accounts</summary><p>Use <code>learner</code>, <code>teacher</code> or <code>admin</code> with the password set in <code>DEV_ACCOUNT_PASSWORD</code>. The example local password is <code>pathfinder-local-2026</code>.</p><p>These accounts are for this laptop. Production requires managed sign-in.</p></details>
  </form>;
}
