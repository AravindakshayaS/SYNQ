import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request, allRecords } from './api.js';
import { demoData } from './demo.js';

const Context = createContext(null);
const empty = { tasks: [], schedules: [], journals: [] };
export const useWorkspace = () => useContext(Context);
export function WorkspaceProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [demo, setDemo] = useState(false);
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const generation = useRef(0);
  const navigate = useNavigate();
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(''), 4500); return () => clearTimeout(id); } }, [toast]);
  function startDemo() {
    generation.current++;
    setToken(null); setDemo(true); setUser({ name: 'Alex', email: 'alex@example.com', role: 'demo' });
    try { const saved = JSON.parse(localStorage.getItem('synq-demo-v1')); setData(saved?.tasks && saved?.schedules && saved?.journals ? saved : demoData()); } catch { setData(demoData()); }
    setError(''); setLoading(false); navigate('/app/dashboard');
  }
  useEffect(() => { if (demo) { try { localStorage.setItem('synq-demo-v1', JSON.stringify(data)); } catch { /* Demo still works in memory if storage is unavailable. */ } } }, [data, demo]);
  function clearSession() { generation.current++; setToken(null); setUser(null); setDemo(false); setData(empty); setLoading(false); setError(''); }
  async function api(path, options = {}) {
    try { return await request(path, { ...options, token }); }
    catch (e) { if (e.status === 401) { clearSession(); navigate('/login'); } throw e; }
  }
  async function refresh(accessToken = token) {
    const id = generation.current;
    setLoading(true); setError('');
    try {
      const [tasks, schedules, journals] = await Promise.all(['tasks', 'schedules', 'journals'].map(key => allRecords(`/${key}`, accessToken)));
      if (id === generation.current) setData({ tasks, schedules, journals });
    } catch (e) {
      if (id === generation.current) { if (e.status === 401) { clearSession(); navigate('/login'); } else setError(e.message); }
    } finally { if (id === generation.current) setLoading(false); }
  }
  async function authenticate(mode, fields) {
    const result = await request(`/auth/${mode}`, { method: 'POST', body: fields });
    generation.current++; setDemo(false); setUser(result.user); setToken(result.token); setData(empty);
    navigate('/app/dashboard'); await refresh(result.token);
  }
  async function logout() {
    if (!demo) await api('/auth/logout', { method: 'POST' });
    clearSession(); navigate('/');
  }
  async function save(kind, value, id) {
    let record;
    if (demo) record = { ...value, _id: id || data[kind].find(row => kind !== 'tasks' && row.date === value.date)?._id || crypto.randomUUID() };
    else record = (await api(`/${kind}${kind === 'tasks' && id ? `/${id}` : ''}`, { method: kind === 'tasks' ? id ? 'PATCH' : 'POST' : 'PUT', body: value })).data;
    setData(previous => ({ ...previous, [kind]: previous[kind].some(row => row._id === record._id) ? previous[kind].map(row => row._id === record._id ? { ...row, ...record } : row) : [...previous[kind], record] }));
    return record;
  }
  async function remove(kind, id) {
    if (!demo) await api(`/${kind}/${id}`, { method: 'DELETE' });
    setData(previous => ({ ...previous, [kind]: previous[kind].filter(row => row._id !== id) }));
  }
  return <Context.Provider value={{ user, demo, data, loading, error, toast, notify: setToast, api, startDemo, authenticate, logout, refresh, save, remove }}>
    {children}<div className={`toast ${toast ? 'visible' : ''}`} role="status">{toast}</div>
  </Context.Provider>;
}
