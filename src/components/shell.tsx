'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { Compass, LayoutDashboard, Map, CalendarCheck, BookOpen, FolderCheck, ChartNoAxesCombined, Users, ShieldCheck, LogOut, Menu, ArrowUpRight,NotebookPen,Settings } from 'lucide-react';
import type { User } from '@/lib/auth';
import { api } from '@/lib/client';
export function Shell({ user,local,managed,children }: { user:User;local:boolean;managed:boolean;children:React.ReactNode }) {
  const pathname = usePathname(),[open,setOpen] = useState(false),[error,setError] = useState('');
  const links = user.role==='admin' ? [{ href:'/admin',name:'Platform operations',icon:ShieldCheck }] : ['teacher','owner'].includes(user.role) ? [{ href:'/org',name:'Organization workspace',icon:Users },{ href:'/org/classroom',name:'Classroom quizzes',icon:BookOpen }] : [
    { href:'/app',name:'Overview',icon:LayoutDashboard },{ href:'/app/roadmaps',name:'My roadmaps',icon:Map },{ href:'/app/today',name:'Today’s work',icon:CalendarCheck },{ href:'/app/preparation',name:'Preparation',icon:BookOpen },{ href:'/app/classroom',name:'Classroom quizzes',icon:Users },{ href:'/app/discussion',name:'Discussion practice',icon:BookOpen },{ href:'/app/notebook',name:'Error notebook',icon:NotebookPen },{ href:'/app/evidence',name:'Evidence library',icon:FolderCheck },{ href:'/app/progress',name:'Progress',icon:ChartNoAxesCombined },{ href:'/app/settings',name:'Settings',icon:Settings },
  ];
  return <div className="shell"><a className="skip-link" href="#main">Skip to main content</a><aside className="sidebar">
    <Link href={links[0].href} className="brand"><Compass size={27} /><span>Pathfinder<small>Code to Career</small></span></Link>
    <button className="mobile-menu" aria-expanded={open} aria-controls="workspace-nav" onClick={() => setOpen(!open)}><Menu size={20} /> Menu</button>
    <nav id="workspace-nav" className={open ? 'nav open' : 'nav'} aria-label="Workspace">{links.map(({ href,name,icon:Icon }) => <Link key={href} href={href} aria-current={pathname===href || href!=='/app' && pathname.startsWith(href+'/') ? 'page' : undefined} onClick={() => setOpen(false)}><Icon size={19} />{name}</Link>)}</nav>
    <div className="sidebar-bottom"><div className="sidebar-note"><span className="small-label">Build toward your goal</span><p>One useful piece of work at a time.</p><ArrowUpRight size={20} /></div><div className="account"><span className="avatar">{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.role==='admin' ? 'Platform operator' : user.role==='teacher' ? 'Assigned teacher' : user.role}</small></div>
      {managed ? <UserButton /> : <button className="icon-button" title="Sign out" aria-label="Sign out" onClick={async () => { try { await api('auth/logout',{});window.location.assign('/sign-in'); } catch (e) { setError((e as Error).message); } }}><LogOut size={18} /></button>}
    </div>{error && <p role="alert" className="error">{error}</p>}</div>
  </aside><div className="main-wrap"><header className="topbar"><span>{user.role==='learner' ? 'Learning workspace' : user.role==='admin' ? 'Platform workspace' : 'Organization workspace'}</span><div>{local && <span className="badge">Local development</span>}<span className="topbar-date">Plan · Build · Reflect</span><div className="mobile-account">{managed?<UserButton/>:<button className="icon-button" aria-label="Sign out" onClick={async()=>{try{await api('auth/logout',{});window.location.assign('/sign-in');}catch(e){setError((e as Error).message);}}}><LogOut size={17}/></button>}</div></div></header>{error&&<p className="error" role="alert">{error}</p>}<main id="main" className="content">{children}</main></div></div>;
}
