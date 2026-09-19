import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { useWorkspace } from './lib/workspace.jsx';
import Shell from './components/Shell.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const Planner = lazy(() => import('./pages/Planner.jsx'));
const Journal = lazy(() => import('./pages/Journal.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
function Protected() { const { user } = useWorkspace(); return user ? <Shell/> : <Navigate to="/login" replace/>; }
export default function App() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><Suspense fallback={<div className="route-loading" role="status">Finding a little calm…</div>}><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<Auth key="login"/>}/><Route path="/register" element={<Auth key="register" register/>}/><Route path="/app" element={<Protected/>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<Dashboard/>}/><Route path="tasks" element={<Tasks/>}/><Route path="planner" element={<Planner/>}/><Route path="journal" element={<Journal/>}/><Route path="calendar" element={<Calendar/>}/><Route path="analytics" element={<Analytics/>}/><Route path="settings" element={<Settings/>}/><Route path="admin" element={<Admin/>}/></Route><Route path="*" element={<main className="not-found"><span className="eyebrow">A LITTLE DETOUR</span><h1>This page wandered off.</h1><p>Let’s find our way back to your space.</p><Link to="/" className="button primary">Back to SYNQ</Link></main>}/></Routes></Suspense></>;
}
