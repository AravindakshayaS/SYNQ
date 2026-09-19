import test from 'node:test';
import assert from 'node:assert/strict';
import { dateSchema, blocksSchema, registrationSchema, taskUpdateSchema } from '../src/validation.js';
import { generatePlan } from '../src/services/planner.js';
import { readConfig } from '../src/config.js';

const block = { time: '09:00', endTime: '10:00', label: 'Study', tag: 'study' };
test('calendar dates reject overflow and preserve leap days', () => {
  assert.equal(dateSchema.parse('2024-02-29'), '2024-02-29');
  for (const value of ['2025-02-29', '2026-04-31', '09-08-2026']) assert.equal(dateSchema.safeParse(value).success, false);
});
test('schedule rejects overlaps, inverted times, unknown tags and too many blocks', () => {
  assert.equal(blocksSchema.parse([block]).length, 1);
  for (const blocks of [[], [block, block], [{ ...block, endTime: '08:00' }], [{ ...block, time: '25:00' }], [{ ...block, tag: 'admin' }], Array(101).fill(block)]) {
    assert.equal(blocksSchema.safeParse(blocks).success, false);
  }
});
test('signup and updates reject privilege and ownership injection', () => {
  const account = { name: 'Owner', email: 'Owner@example.com', password: 'a-long-test-password' };
  assert.equal(registrationSchema.parse(account).email, 'owner@example.com');
  assert.equal(registrationSchema.safeParse({ ...account, role: 'superadmin' }).success, false);
  assert.equal(registrationSchema.safeParse({ ...account, password: '🐹'.repeat(30) }).success, false);
  assert.equal(taskUpdateSchema.safeParse({ user: 'someone-else' }).success, false);
});
test('configuration errors identify fields without printing secrets', () => {
  assert.throws(() => readConfig({ JWT_SECRET: 'secret-value' }), error => !error.message.includes('secret-value') && error.message.includes('JWT_SECRET'));
});
test('partial task edits do not inject defaults into existing records', () => {
  assert.deepEqual(taskUpdateSchema.parse({ title: 'Renamed' }), { title: 'Renamed' });
  assert.equal(taskUpdateSchema.safeParse({}).success, false);
});
test('AI is explicit about missing configuration and validates provider output', async () => {
  await assert.rejects(generatePlan('Study', {}), { status: 503 });
  const config = { GROQ_API_KEY: 'test-only', GROQ_MODEL: 'test-model' };
  const provider = content => async () => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });
  assert.deepEqual(await generatePlan('Study', config, provider(JSON.stringify({ blocks: [block] }))), [block]);
  for (const content of ['not JSON', JSON.stringify({ blocks: [block, block] })]) {
    await assert.rejects(generatePlan('Study', config, provider(content)), { status: 502 });
  }
  await assert.rejects(generatePlan('Study', config, async () => { throw new DOMException('Timed out', 'TimeoutError'); }), { status: 504 });
  await assert.rejects(generatePlan('Study', config, async () => ({ ok: false })), { status: 502 });
});
