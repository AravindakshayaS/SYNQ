import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ListTodo, BookOpen, ChartNoAxesCombined, Settings, ShieldCheck, Menu, X, ArrowUpRight, LogOut, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useWorkspace } from '../lib/workspace.jsx';
import { Brand, ErrorMessage } from './UI.jsx';
import { localDate, formatDate } from '../lib/dates.js';

const links = [['dashboard', 'Overview', LayoutDashboard], ['planner', 'My planner', CalendarDays], ['tasks', 'My tasks', ListTodo], ['journal', 'Journal', BookOpen], ['calendar', 'Calendar', CalendarDays], ['analytics', 'Insights', ChartNoAxesCombined]];
export default function Shell() {
  const { user, demo, loading, error, refresh, logout, notify } = useWorkspace();
  const [open, setOpen] = useState(false); const location = useLocation();
  const page = links.find(([path]) => location.pathname.endsWith(path))?.[1] || (location.pathname.endsWith('admin') ? 'Superadmin' : 'Settings');
  async function signOut() { try { await logout(); } catch (e) { notify(e.message); } }
  return <div className="app-shell">
    {open && <button className="nav-scrim" aria-label="Close menu" onClick={() => setOpen(false)}/>}
    <aside className={`sidebar ${open ? 'open' : ''}`}><div className="sidebar-logo"><Brand/><button className="icon-button mobile-only" aria-label="Close navigation" onClick={() => setOpen(false)}><X/></button></div>
      <div className="workspace-label"><span className="workspace-icon">✧</span><div>My little universe<small>Personal workspace</small></div></div>
      <span className="nav-label">YOUR EVERYDAY</span><nav aria-label="Main navigation">{links.map(([path, label, Icon]) => <NavLink key={path} to={`/app/${path}`} onClick={() => setOpen(false)}><Icon size={19}/>{label}{path === 'planner' && <span className="tiny-badge">AI</span>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><Sparkles size={21}/><p>A little intention.<br/>A softer kind of productive.</p><Link to="/app/planner" onClick={() => setOpen(false)}>Make space for today <ArrowUpRight size={15}/></Link></div>
      <nav aria-label="Account navigation">{(user.role === 'superadmin' || demo) && <NavLink to="/app/admin" onClick={() => setOpen(false)}><ShieldCheck size={19}/>{demo ? 'Admin preview' : 'Superadmin'}</NavLink>}<NavLink to="/app/settings" onClick={() => setOpen(false)}><Settings size={19}/>Settings</NavLink></nav>
      <div className="user-card"><span className="avatar">{user.name.slice(0, 1)}</span><div><strong>{user.name}</strong><small>{demo ? 'Demo workspace' : user.role === 'superadmin' ? 'Workspace owner' : 'Your personal space'}</small></div><button className="icon-button" aria-label="Sign out" onClick={signOut}><LogOut size={17}/></button></div></div>
    </aside>
    <div className="app-main"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu/></button><span>My workspace</span><span className="separator">/</span><strong>{page}</strong></div><div className="topbar-right"><span className="today-label">{formatDate(localDate(), { weekday: 'short', month: 'short', day: 'numeric' })}</span><span className="avatar small-avatar">{user.name.slice(0, 1)}</span></div></header>
    {demo && <div className="demo-banner"><span><i/>Demo workspace · Changes are saved in this browser only.</span><Link to="/register">Create your own space <ArrowUpRight size={14}/></Link></div>}
    <main id="main-content" className="content">{error && <div className="load-error"><ErrorMessage>{error}</ErrorMessage><button className="button secondary" onClick={() => refresh()}>Retry loading</button></div>}{loading ? <div className="loading-page" role="status"><div className="skeleton wide"/><div className="skeleton tall"/><p>Gathering your little universe…</p></div> : <Outlet/>}</main>
    <footer className="app-footer"><span>Made for progress, at your pace.</span><span>SYNQ <span className="footer-star">✧</span> A little more in tune.</span></footer></div>
  </div>;
}
