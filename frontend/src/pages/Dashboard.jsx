import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, Sparkles, Flame, CheckCheck, Clock3, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../lib/workspace.jsx';
import { localDate, shiftDate, formatDate, summarize, currentStreak, timeLabel } from '../lib/dates.js';
import { PageTitle, Panel, TaskEditor, TextLink, Empty } from '../components/UI.jsx';
import TaskList from '../components/TaskList.jsx';
import Companion from '../components/Companion.jsx';

export default function Dashboard() {
  const { user, data, save } = useWorkspace(); const [date, setDate] = useState(localDate()); const [adding, setAdding] = useState(false);
  const tasks = data.tasks.filter(t => t.date === date); const schedule = data.schedules.find(s => s.date === date);
  const stats = summarize(tasks, schedule ? [schedule] : []); const streak = currentStreak(data.tasks);
  const today = localDate(); const weekStart = shiftDate(today, -((new Date(`${today}T12:00:00`).getDay() + 6) % 7));
  return <>
    <PageTitle eyebrow="A FRESH DAY, A LITTLE POSSIBILITY" title={`Hello, ${user.name.split(' ')[0]}.`} description="Let's make room for what matters today."><button className="button primary" onClick={() => setAdding(true)}><Plus size={17}/>Add a task</button></PageTitle>
    <div className="dashboard-grid"><div className="dashboard-primary">
      <section className="welcome-card"><div className="welcome-copy"><span className="pill"><Sparkles size={13}/> YOUR DAY, IN HARMONY</span><h2>A little structure.<br/><em>A lot more you.</em></h2><p>You don't have to do it all.<br/>Just make a little space for your next step.</p><Link to="/app/planner" className="button primary">Shape my day <ArrowUpRight size={17}/></Link></div><div className="orbit-art" aria-hidden="true"><div className="orbit one"/><div className="orbit two"/><div className="orbit three"/><span className="orb"/><span className="orbit-star first">✧</span><span className="orbit-star second">✦</span><span className="orbit-caption">find your<br/><i>own rhythm.</i></span></div></section>
      <div className="stats-grid"><div className="stat-card"><span className="stat-icon"><CheckCheck size={19}/></span><span className="stat-label">Small wins</span><strong>{stats.completed}<small> / {stats.total}</small></strong><span className="stat-note">Tasks completed</span></div><div className="stat-card"><span className="stat-icon"><Clock3 size={19}/></span><span className="stat-label">Space to focus</span><strong>{Math.floor(stats.focus / 60)}<small>h {stats.focus % 60}m</small></strong><span className="stat-note">Planned focus time</span></div><div className="stat-card"><span className="stat-icon"><Flame size={19}/></span><span className="stat-label">Showing up</span><strong>{streak}<small> days</small></strong><span className="stat-note">Your current streak</span></div></div>
      <Panel title="A day at a time" subtitle={formatDate(date, { month: 'long', year: 'numeric' })} action={<TextLink to="/app/calendar">Calendar</TextLink>} className="schedule-panel"><div className="week-strip">{Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index)).map(day => <button className={`${day === date ? 'selected' : ''} ${day === today ? 'is-today' : ''}`} onClick={() => setDate(day)} key={day} aria-pressed={day === date}><span>{formatDate(day, { weekday: 'short' })}</span><strong>{formatDate(day, { day: 'numeric' })}</strong><i/></button>)}</div><div className="timeline">{schedule?.blocks.length ? schedule.blocks.map((block, index) => <div className="timeline-row" key={index}><span className="timeline-time">{timeLabel(block.time)}</span><span className="timeline-dot"/><div className="timeline-block"><div><span className={`tag tag-${block.tag}`}>{block.tag}</span><strong>{block.label}</strong><small>{timeLabel(block.time)} — {timeLabel(block.endTime)}</small></div><ArrowUpRight size={17}/></div></div>) : <Empty title="A little room to imagine your day.">Open your planner to add a schedule for {formatDate(date)}.</Empty>}</div></Panel>
    </div><aside className="dashboard-secondary">
      <section className="companion-card"><div className="companion-heading"><span className="eyebrow">YOUR LITTLE CHEERLEADER</span><span className="live-dot"/></div><Companion/><h2>{stats.completed ? 'Look at you, showing up.' : 'One little step is enough.'}</h2><p>{stats.completed ? 'Every small win counts. I’m rooting for you, always.' : 'No rush. We’ll find our rhythm together.'}</p><span className="pip-name">A little note from Pip ♡</span></section>
      <Panel title="Today's little wins" action={<span className="count-pill">{stats.completed}/{stats.total}</span>}><div className="progress-track"><span style={{ width: `${stats.percent}%` }}/></div><TaskList tasks={tasks.slice(0, 4)} compact/><Link className="panel-bottom-link" to="/app/tasks">All my tasks <ChevronRight size={16}/></Link></Panel>
      <Link className="journal-prompt" to="/app/journal"><span className="eyebrow">CHECK IN WITH YOURSELF</span><h3>How's your<br/><em>inner weather?</em></h3><p>A few words can make a little room.</p><span className="text-link">Open my journal <ArrowUpRight size={16}/></span><span className="journal-flower" aria-hidden="true">✳</span></Link>
    </aside></div>
    {adding && <TaskEditor date={date} onSave={v => save('tasks', v)} onClose={() => setAdding(false)}/>}
  </>;
}
