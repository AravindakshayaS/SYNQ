import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Circle,
  LayoutDashboard,
  ListTodo,
  Plus,
  Sparkles,
} from 'lucide-react';
import './ProductTour.css';

const tourItems = [
  {
    id: 'overview',
    number: '01',
    eyebrow: 'YOUR DAY, AT A GLANCE',
    title: <>Open the app.<br/> <em>Know where you are.</em></>,
    description: 'See today’s priorities, your steady progress, and the next small step in one calm view.',
  },
  {
    id: 'planner',
    number: '02',
    eyebrow: 'A PLAN THAT FITS',
    title: <>Give your day<br/> <em>a gentle shape.</em></>,
    description: 'Build a realistic schedule around your energy, commitments, and the time you actually have.',
  },
  {
    id: 'tasks',
    number: '03',
    eyebrow: 'SMALL WINS COUNT',
    title: <>Keep the next step<br/> <em>close at hand.</em></>,
    description: 'Turn busy thoughts into a short, useful list that keeps momentum visible without adding noise.',
  },
  {
    id: 'journal',
    number: '04',
    eyebrow: 'A MOMENT TO CHECK IN',
    title: <>Let your thoughts<br/> <em>land somewhere.</em></>,
    description: 'Notice how the day felt, capture what mattered, and keep reflections private in your own space.',
  },
  {
    id: 'insights',
    number: '05',
    eyebrow: 'NOTICE YOUR RHYTHM',
    title: <>See the progress<br/> <em>between the days.</em></>,
    description: 'Spot the patterns that help you feel focused and balanced, then adjust at your own pace.',
  },
];

const initialTasks = [
  { id: 1, title: 'Send the project outline', tag: 'Work', done: true },
  { id: 2, title: 'Review portfolio copy', tag: 'Personal', done: true },
  { id: 3, title: 'Read twenty pages', tag: 'Study', done: false },
  { id: 4, title: 'Book a morning walk', tag: 'Health', done: false },
];

function PhoneHeader({ label, title, action, actionLabel, onAction }) {
  return <>
    <div className="phone-status"><span>9:41</span><span>● ● ▰</span></div>
    <div className="phone-page-head"><div><small>{label}</small><strong>{title}</strong></div>{action && <button type="button" className="phone-action" aria-label={actionLabel} onClick={onAction}>{action}</button>}</div>
  </>;
}

function PhoneNav({ active, onNavigate }) {
  const items = [
    ['overview', LayoutDashboard],
    ['planner', CalendarDays],
    ['tasks', ListTodo],
    ['journal', BookOpen],
    ['insights', BarChart3],
  ];
  return <nav className="phone-nav" aria-label="Preview navigation">{items.map(([id, Icon]) => <button type="button" aria-label={`Open ${id} preview`} aria-current={active === id ? 'page' : undefined} className={active === id ? 'active' : ''} onClick={() => onNavigate(id)} key={id}><Icon size={15}/></button>)}</nav>;
}

function OverviewScreen({ onNavigate, onThemeToggle, theme }) {
  return <>
    <PhoneHeader label="THURSDAY, SEPT 10" title="Good morning, Aravi." action="✦" actionLabel={`Switch to ${theme === 'onyx' ? 'Stucco' : 'Onyx'} preview theme`} onAction={onThemeToggle}/>
    <div className="phone-hero-card"><span>YOUR RHYTHM TODAY</span><strong>70%</strong><p>Three small wins are already yours.</p><div className="phone-progress"><i/></div></div>
    <div className="phone-section-title"><strong>Today’s flow</strong><button type="button" onClick={() => onNavigate('tasks')}>View all</button></div>
    <div className="phone-timeline">
      <div><time>9:00</time><i/><p><small>FOCUS</small><strong>Deep work session</strong><span>1h 30m</span></p></div>
      <div><time>11:00</time><i/><p><small>BREAK</small><strong>Step away & reset</strong><span>20m</span></p></div>
      <div><time>1:30</time><i/><p><small>STUDY</small><strong>Learn something new</strong><span>45m</span></p></div>
    </div>
  </>;
}

function PlannerScreen({ generated, onGenerate }) {
  return <>
    <PhoneHeader label="MY PLANNER" title="Shape your day." action={<Plus size={15}/>} actionLabel="Generate a suggested plan" onAction={onGenerate}/>
    <div className={`phone-ai-card ${generated ? 'generated' : ''}`}><Sparkles size={17}/><div><strong>{generated ? 'Your plan is ready' : 'Plan with a little help'}</strong><p>{generated ? 'A focus block was added below.' : 'Tell SYNQ what today needs.'}</p></div><button type="button" onClick={onGenerate}>{generated ? 'Added' : 'Try it'}</button></div>
    <div className="phone-date-row">{['M 7', 'T 8', 'W 9', 'T 10', 'F 11'].map((day, index) => <span className={index === 3 ? 'active' : ''} key={day}>{day}</span>)}</div>
    <div className="phone-section-title"><strong>Your Thursday</strong><span>3h 25m</span></div>
    <div className="planner-slots">
      <div><time>09:00</time><article><span>WORK · 90 MIN</span><strong>Finish project outline</strong><p>A quiet focus block</p></article></div>
      <div><time>11:00</time><article className="soft"><span>BREAK · 20 MIN</span><strong>Walk and reset</strong></article></div>
      <div><time>14:00</time><article><span>PERSONAL · 45 MIN</span><strong>Portfolio updates</strong></article></div>
      {generated && <div className="generated-slot"><time>16:00</time><article><span>FOCUS · 30 MIN</span><strong>Wrap up loose ends</strong><p>Suggested by SYNQ</p></article></div>}
    </div>
  </>;
}

function TasksScreen({ tasks, onToggleTask }) {
  const completed = tasks.filter((task) => task.done).length;
  const progress = Math.round((completed / tasks.length) * 100);
  return <>
    <PhoneHeader label="MY TASKS" title="Small steps." action={<Plus size={15}/>} actionLabel="Complete the next task" onAction={() => onToggleTask(tasks.find((task) => !task.done)?.id)}/>
    <div className="task-ring-card"><div className="mini-ring" style={{'--task-progress': `${progress}%`}}><span>{progress}%</span></div><div><strong>{completed} little wins</strong><p>{completed} of {tasks.length} complete today</p><div className="phone-progress"><i style={{width: `${progress}%`}}/></div></div></div>
    <div className="phone-filter"><span className="active">Today</span><span>Upcoming</span><span>Done</span></div>
    <div className="phone-task-list">{tasks.map((task) => <div className={task.done ? 'done' : ''} key={task.id}><button type="button" className="phone-check" aria-label={`${task.done ? 'Reopen' : 'Complete'} ${task.title}`} aria-pressed={task.done} onClick={() => onToggleTask(task.id)}>{task.done && <Check size={11}/>}</button><p><strong>{task.title}</strong><small>{task.tag}</small></p><Circle size={4}/></div>)}</div>
  </>;
}

function JournalScreen({ mood, onSelectMood }) {
  return <>
    <PhoneHeader label="MY JOURNAL" title="How did today feel?"/>
    <div className="mood-picker">{[['☀','Light'], ['◡','Good'], ['•','Quiet'], ['~','Heavy']].map(([face, label]) => <button type="button" aria-pressed={mood === label} className={mood === label ? 'active' : ''} onClick={() => onSelectMood(label)} key={label}><b>{face}</b><small>{label}</small></button>)}</div>
    <div className="journal-sheet"><span>THURSDAY, SEPTEMBER 10</span><h3>A small moment worth keeping.</h3><p>I made room for the task I had been avoiding. It was quieter and easier than I expected.</p><div className="journal-prompt-line"><Sparkles size={13}/><em>What felt a little lighter today?</em></div><div className="journal-lines"><i/><i/><i/></div></div>
    <div className="journal-save"><span>Saved just for you</span><strong>68 words</strong></div>
  </>;
}

function InsightsScreen({ range, onToggleRange }) {
  const isMonth = range === '30 days';
  const bars = isMonth ? [66,52,79,60,88,72,91] : [38,58,47,76,64,84,70];
  return <>
    <PhoneHeader label="MY INSIGHTS" title="Your rhythm, lately." action={range} actionLabel={`Show ${isMonth ? '7 day' : '30 day'} insights`} onAction={onToggleRange}/>
    <div className="insight-stats"><div><span>Today</span><strong>70%</strong><small>↑ 5%</small></div><div><span>{isMonth ? 'Month' : 'Week'}</span><strong>{isMonth ? '72%' : '64%'}</strong><small>↑ {isMonth ? '8%' : '3%'}</small></div><div><span>Streak</span><strong>12d</strong><small>+ 1 day</small></div></div>
    <div className="phone-chart-card"><div className="phone-section-title"><strong>Focus over time</strong><span>{isMonth ? 'This month' : 'This week'}</span></div><div className="mini-bars">{bars.map((height, index) => <i className={index === 5 ? 'active' : ''} style={{height: `${height}%`}} key={index}/>)}</div><div className="mini-days"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div>
    <div className="phone-section-title"><strong>Your balance</strong><span>4 areas</span></div>
    <div className="balance-list">{[['Work',78], ['Health',62], ['Study',55], ['Personal',71]].map(([label, value]) => <div key={label}><p><strong>{label}</strong><span>{value}%</span></p><i><b style={{width: `${value}%`}}/></i></div>)}</div>
  </>;
}

const screens = { overview: OverviewScreen, planner: PlannerScreen, tasks: TasksScreen, journal: JournalScreen, insights: InsightsScreen };

function Phone({ screen, onNavigate, theme, screenProps, announcement }) {
  const Screen = screens[screen];
  return <figure className="tour-phone" id="synq-phone-preview" role="tabpanel" aria-label={`${screen} feature preview`}><div className="phone-shell"><div className="phone-speaker"/><div className="phone-screen" data-preview-theme={theme}>{announcement && <div className="simulator-toast" role="status">{announcement.text}</div>}<div className="phone-scroll" key={screen}><Screen {...screenProps}/></div><PhoneNav active={screen} onNavigate={onNavigate}/></div></div></figure>;
}

export default function ProductTour() {
  const [activeFeature, setActiveFeature] = useState('overview');
  const [previewTheme, setPreviewTheme] = useState('onyx');
  const [tasks, setTasks] = useState(initialTasks);
  const [mood, setMood] = useState('Good');
  const [planGenerated, setPlanGenerated] = useState(false);
  const [insightRange, setInsightRange] = useState('7 days');
  const [announcement, setAnnouncement] = useState(null);
  const activeItem = tourItems.find((item) => item.id === activeFeature);

  useEffect(() => {
    if (!announcement) return undefined;
    const timeout = window.setTimeout(() => setAnnouncement(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  const notify = (text) => setAnnouncement({ text, id: Date.now() });
  const selectFeature = (feature) => {
    setActiveFeature(feature);
    notify(`${feature[0].toUpperCase()}${feature.slice(1)} preview opened`);
  };
  const toggleTheme = () => {
    const nextTheme = previewTheme === 'onyx' ? 'stucco' : 'onyx';
    setPreviewTheme(nextTheme);
    notify(`${nextTheme === 'stucco' ? 'Stucco' : 'Onyx'} theme applied`);
  };
  const toggleTask = (id) => {
    if (!id) return;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
    notify('Task progress updated');
  };
  const generatePlan = () => {
    setPlanGenerated(true);
    notify('Suggested focus block added');
  };
  const selectMood = (nextMood) => {
    setMood(nextMood);
    notify(`${nextMood} mood selected`);
  };
  const toggleInsightRange = () => {
    const nextRange = insightRange === '7 days' ? '30 days' : '7 days';
    setInsightRange(nextRange);
    notify(`${nextRange} of insights shown`);
  };

  const screenProps = {
    generated: planGenerated,
    mood,
    onGenerate: generatePlan,
    onNavigate: selectFeature,
    onSelectMood: selectMood,
    onThemeToggle: toggleTheme,
    onToggleRange: toggleInsightRange,
    onToggleTask: toggleTask,
    range: insightRange,
    tasks,
    theme: previewTheme,
  };

  return <section className="product-tour interactive-tour" id="a-little-more" aria-label="Interactive SYNQ feature preview">
    <div className="simulator-control-bar"><span><i/> Live mobile preview</span><button type="button" className="preview-theme-toggle" aria-pressed={previewTheme === 'stucco'} onClick={toggleTheme}>{previewTheme === 'onyx' ? 'Try Stucco theme' : 'Use Onyx theme'}</button></div>
    <div className="feature-switcher" role="tablist" aria-label="Choose a feature to preview">
      {tourItems.map((item) => <button
        type="button"
        role="tab"
        aria-controls="synq-phone-preview"
        aria-selected={activeFeature === item.id}
        className={activeFeature === item.id ? 'active' : ''}
        onClick={() => selectFeature(item.id)}
        key={item.id}
      >{item.id}</button>)}
    </div>
    <div className="interactive-phone-stage">
      <Phone screen={activeFeature} onNavigate={selectFeature} theme={previewTheme} screenProps={screenProps} announcement={announcement}/>
      <span className="phone-glow" aria-hidden="true"/>
    </div>
    <div className="active-feature-copy" aria-live="polite">
      <span>{activeItem.number} · {activeItem.eyebrow}</span>
      <h2>{activeItem.title}</h2>
      <p>{activeItem.description}</p>
    </div>
  </section>;
}
