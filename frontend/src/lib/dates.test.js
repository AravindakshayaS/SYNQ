import test from 'node:test';
import assert from 'node:assert/strict';
import { localDate, shiftDate, summarize, currentStreak } from './dates.js';
test('local dates and arithmetic preserve calendar boundaries', () => {
  assert.equal(localDate(new Date(2026, 8, 9, 0, 10)), '2026-09-09');
  assert.equal(shiftDate('2024-03-01', -1), '2024-02-29');
});
test('metrics distinguish planned time from task completion', () => {
  assert.deepEqual(summarize([], []), { total: 0, completed: 0, percent: 0, focus: 0 });
  const result = summarize([{ status: 'completed' }, { status: 'skipped' }], [{ blocks: [{ time: '09:00', endTime: '10:30', tag: 'study' }, { time: '10:30', endTime: '11:00', tag: 'break' }] }]);
  assert.equal(result.percent, 50); assert.equal(result.focus, 90);
});
test('streak includes yesterday while today is in progress', () => {
  const tasks = ['2026-09-08', '2026-09-07', '2026-09-05'].map(date => ({ date, status: 'completed' }));
  assert.equal(currentStreak(tasks, '2026-09-09'), 2);
});
