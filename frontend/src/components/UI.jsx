import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, X, LoaderCircle } from 'lucide-react';

export function Brand() { return <Link to="/" className="brand" aria-label="SYNQ home"><span className="brand-symbol"><i/><i/><i/></span>SYNQ<span className="brand-dot">.</span></Link>; }
export function PageTitle({ eyebrow = 'YOUR PERSONAL SPACE', title, description, children }) { return <header className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="page-actions">{children}</div></header>; }
export function Panel({ title, subtitle, action, children, className = '' }) { return <section className={`panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>; }
export function Empty({ title = 'A little space for a fresh start.', children }) { return <div className="empty"><Sparkles size={25}/><h3>{title}</h3><p>{children || 'Your next small step starts here.'}</p></div>; }
export function ErrorMessage({ children }) { return children ? <div role="alert" className="error-message">{children}</div> : null; }
export function Submit({ busy, children, className = 'button primary', ...props }) { return <button className={className} disabled={busy} {...props}>{busy && <LoaderCircle className="spin" size={17}/>} {children}</button>; }
export function TextLink({ to, children }) { return <Link className="text-link" to={to}>{children}<ArrowUpRight size={15}/></Link>; }
export function Modal({ title, children, onClose }) {
  const dialog = useRef();
  useEffect(() => { const node = dialog.current; node.showModal(); const close = () => onClose(); node.addEventListener('cancel', close); return () => node.removeEventListener('cancel', close); }, [onClose]);
  return <dialog ref={dialog} className="modal" onClick={e => { if (e.target === dialog.current) onClose(); }}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X/></button></div>{children}</dialog>;
}
export function TaskEditor({ task, date, onSave, onClose }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(e) { e.preventDefault(); setBusy(true); setError(''); const fields = Object.fromEntries(new FormData(e.currentTarget)); try { await onSave(fields, task?._id); onClose(); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  return <Modal title={task ? 'Make it your own' : 'One small step'} onClose={onClose}><form onSubmit={submit} className="form-stack"><label>What would you like to do?<input name="title" autoFocus required maxLength={200} defaultValue={task?.title} placeholder="Give your task a little intention…"/></label><div className="form-grid"><label>Day<input type="date" name="date" required defaultValue={task?.date || date}/></label><label>Category<select name="tag" defaultValue={task?.tag || 'other'}>{['study', 'work', 'health', 'meal', 'break', 'sleep', 'other'].map(tag => <option key={tag}>{tag}</option>)}</select></label></div><label>Status<select name="status" defaultValue={task?.status || 'pending'}>{['pending', 'completed', 'skipped'].map(status => <option key={status}>{status}</option>)}</select></label><ErrorMessage>{error}</ErrorMessage><Submit busy={busy}>{task ? 'Save changes' : 'Add to my day'}</Submit></form></Modal>;
}
