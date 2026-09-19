import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageTitle, TaskEditor } from '../components/UI.jsx';
import { useWorkspace } from '../lib/workspace.jsx';
import { localDate } from '../lib/dates.js';
import TaskList from '../components/TaskList.jsx';
export default function Tasks() {
  const { data, save } = useWorkspace(); const [date, setDate] = useState(localDate()); const [filter, setFilter] = useState('all'); const [search, setSearch] = useState(''); const [adding, setAdding] = useState(false);
  const tasks = data.tasks.filter(t => t.date === date && (filter === 'all' || t.status === filter) && t.title.toLowerCase().includes(search.toLowerCase()));
  return <><PageTitle title="Small steps. Real progress." description="Make a little list. Leave a little breathing room."><button className="button primary" onClick={() => setAdding(true)}><Plus size={17}/>New task</button></PageTitle><div className="panel"><div className="toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search tasks" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a little to-do…"/></div><label className="inline-label">Day<input type="date" value={date} onChange={e => e.target.value && setDate(e.target.value)}/></label></div><div className="tabs" role="group" aria-label="Task status">{['all', 'pending', 'completed', 'skipped'].map(value => <button key={value} aria-pressed={filter === value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'All tasks' : value}</button>)}</div><TaskList tasks={tasks}/><div className="muted panel-caption">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in this view. Progress happens at your pace.</div></div>{adding && <TaskEditor date={date} onSave={v => save('tasks', v)} onClose={() => setAdding(false)}/>}</>;
}
