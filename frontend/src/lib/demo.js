import { localDate, shiftDate } from './dates.js';
export function demoData() {
  const date = localDate();
  const tasks = [
    { title: 'A little morning movement', status: 'completed', tag: 'health' },
    { title: 'Read 10 pages', status: 'completed', tag: 'other' },
    { title: 'Deep work: build something good', status: 'pending', tag: 'work' },
    { title: 'Practice data structures', status: 'pending', tag: 'study' },
    { title: 'Step outside & recharge', status: 'pending', tag: 'health' },
  ].map((task, index) => ({ ...task, _id: `today-${index}`, date }));
  for (let day = 1; day <= 14; day++) {
    tasks.push({ _id: `history-${day}`, date: shiftDate(date, -day), title: 'Daily focus session', status: day % 6 === 0 ? 'skipped' : 'completed', tag: 'study' });
  }
  return { tasks, schedules: [{ _id: 'today-plan', date, mode: 'weekday', blocks: [
    { time: '07:00', endTime: '07:30', label: 'Slow morning & a little movement', tag: 'health' },
    { time: '09:00', endTime: '10:30', label: 'Deep work, clear mind', tag: 'work' },
    { time: '10:30', endTime: '11:00', label: 'Coffee & a proper pause', tag: 'break' },
    { time: '11:00', endTime: '12:00', label: 'Learn something new', tag: 'study' },
    { time: '13:00', endTime: '14:00', label: 'Lunch, away from the screen', tag: 'meal' },
    { time: '16:00', endTime: '17:00', label: 'Make space for your side project', tag: 'work' },
  ] }], journals: [{ _id: 'reflection-1', date: shiftDate(date, -1), mood: 'good', text: 'Today I made room for the things that matter. A little progress is still progress. Tomorrow, I want to start with one clear intention.' }] };
}
