'use client';
export default function ErrorPage({ reset }: { reset:() => void }) { return <main className="center-page"><h1>The workspace could not load</h1><p>Your saved work has not been removed. Check the service configuration and try again.</p><button onClick={reset}>Try again</button><a href="/">Return to workspace</a></main>; }
