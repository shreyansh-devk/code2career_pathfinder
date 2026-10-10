import { RoadmapWorkspace } from '@/components/roadmap';
export default async function Page({ params }: { params:Promise<{ id:string }> }) { const { id }=await params;return <RoadmapWorkspace id={id}/>; }
