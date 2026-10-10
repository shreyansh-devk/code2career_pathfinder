import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { configuredOrigins, surfaceRedirect } from './lib/surfaces';

const allowed = configuredOrigins();
const managed = clerkMiddleware({ authorizedParties: allowed.length ? allowed : undefined });
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const destination = surfaceRedirect(request);
  if (destination) return NextResponse.redirect(destination);
  if (process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return managed(request,event);
  // Every private page and endpoint also enforces identity and resource ownership on the server.
  return NextResponse.next();
}
export const config = { matcher:['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)','/(api|trpc)(.*)'] };
