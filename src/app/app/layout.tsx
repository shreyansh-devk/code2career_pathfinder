import { Protected } from '@/components/protected';
export const dynamic = 'force-dynamic';
export default function LearnerLayout({ children }: { children:React.ReactNode }) { return <Protected roles={['learner']}>{children}</Protected>; }
