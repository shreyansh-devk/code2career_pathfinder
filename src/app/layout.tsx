import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkReady } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = { title:{ default:'Pathfinder | Code to Career',template:'%s | Pathfinder' },description:'Plan a specific career path, build skills and collect evidence of your work.' };
export default function RootLayout({ children }: { children:React.ReactNode }) {
  const content = <html lang="en"><body>{children}</body></html>;
  return clerkReady() ? <ClerkProvider>{content}</ClerkProvider> : content;
}
