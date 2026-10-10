import type {Metadata} from 'next';
import {SharedRoadmap} from '@/components/shared-roadmap';
export const metadata:Metadata={title:'Shared roadmap',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <SharedRoadmap token={token}/>;}
