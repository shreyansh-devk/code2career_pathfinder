import { Protected } from '@/components/protected';
export const dynamic = 'force-dynamic';
export default function AdminLayout({ children }: { children:React.ReactNode }) { return <Protected roles={['admin']}>{children}</Protected>; }
