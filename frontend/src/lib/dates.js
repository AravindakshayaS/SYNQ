export function localDate(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}
export function dateObject(value) { return new Date(`${value}T12:00:00`); }
export function shiftDate(value, days) { const d = dateObject(value); d.setDate(d.getDate() + days); return localDate(d); }
export function formatDate(value, options = { month: 'long', day: 'numeric' }) { return dateObject(value).toLocaleDateString('en-US', options); }
export function timeLabel(time) {
  const [hour, minute] = time.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}
export function duration(block) { const minutes = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)); return Math.max(0, minutes(block.endTime) - minutes(block.time)); }
export function summarize(tasks, schedules) {
  const completed = tasks.filter(task => task.status === 'completed').length;
  return { total: tasks.length, completed, percent: tasks.length ? Math.round(completed / tasks.length * 100) : 0,
    focus: schedules.flatMap(s => s.blocks).filter(b => ['study', 'work'].includes(b.tag)).reduce((sum, block) => sum + duration(block), 0) };
}
export function currentStreak(tasks, today = localDate()) {
  const dates = new Set(tasks.filter(t => t.status === 'completed').map(t => t.date));
  let day = dates.has(today) ? today : shiftDate(today, -1);
  let result = 0;
  while (dates.has(day)) { result++; day = shiftDate(day, -1); }
  return result;
}
