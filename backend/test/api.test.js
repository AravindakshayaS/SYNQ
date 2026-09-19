import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { models, User, Schedule, Journal } from '../src/models.js';

let database;
let app;
let alice;
let bob;
const config = { JWT_SECRET: 'integration-test-only-'.repeat(4), CLIENT_URL: 'http://localhost:5173', TRUST_PROXY_HOPS: 0 };
const credentials = name => ({ name, email: `${name}@example.com`, password: 'a-secure-test-password' });
const auth = token => ({ Authorization: `Bearer ${token}` });
before(async () => {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  await Promise.all(models.map(Model => Model.init()));
  app = createApp(config);
  alice = (await request(app).post('/api/auth/register').send(credentials('alice')).expect(201)).body;
  bob = (await request(app).post('/api/auth/register').send(credentials('bob')).expect(201)).body;
});
after(async () => { await mongoose.disconnect(); await database?.stop(); });

test('health, authentication and public privilege injection', async () => {
  await request(app).get('/api/health').expect(200);
  for (const path of ['/api/tasks', '/api/journals', '/api/schedules', '/api/admin/users']) await request(app).get(path).expect(401);
  await request(app).get('/api/tasks').set(auth('broken')).expect(401);
  await request(app).post('/api/auth/register').send({ ...credentials('mallory'), role: 'superadmin' }).expect(400);
  const duplicate = { ...credentials('alice'), email: 'ALICE@example.com' };
  await request(app).post('/api/auth/register').send(duplicate).expect(409);
  await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'incorrect-password' }).expect(401);
  const me = await request(app).get('/api/auth/me').set(auth(alice.token)).expect(200);
  assert.equal(me.body.user.role, 'user');
  assert.equal(me.body.user.passwordHash, undefined);
  await request(app).get('/api/admin/users').set(auth(alice.token)).expect(403);
});
test('tasks remain isolated across reads, updates and deletes', async () => {
  const created = await request(app).post('/api/tasks').set(auth(alice.token)).send({ title: 'Private task', date: '2026-09-08' }).expect(201);
  const id = created.body.data._id;
  const other = await request(app).get('/api/tasks').set(auth(bob.token)).expect(200);
  assert.equal(other.body.data.length, 0);
  await request(app).patch(`/api/tasks/${id}`).set(auth(bob.token)).send({ status: 'completed' }).expect(404);
  await request(app).delete(`/api/tasks/${id}`).set(auth(bob.token)).expect(404);
  await request(app).patch(`/api/tasks/${id}`).set(auth(alice.token)).send({ user: bob.user.id }).expect(400);
  const edited = await request(app).patch(`/api/tasks/${id}`).set(auth(alice.token)).send({ status: 'completed' }).expect(200);
  assert.equal(edited.body.data.status, 'completed');
  const renamed = await request(app).patch(`/api/tasks/${id}`).set(auth(alice.token)).send({ title: 'Renamed' }).expect(200);
  assert.equal(renamed.body.data.status, 'completed');
  await request(app).get('/api/tasks?limit=101').set(auth(alice.token)).expect(400);
  await request(app).delete(`/api/tasks/${id}`).set(auth(alice.token)).expect(204);
});
test('daily upserts are repeatable and private; invalid AI cannot persist', async () => {
  const entries = [
    ['schedules', Schedule, { date: '2026-09-08', blocks: [{ time: '09:00', endTime: '10:00', label: 'Study', tag: 'study' }] }],
    ['journals', Journal, { date: '2026-09-08', mood: 'good', text: 'A private reflection' }],
  ];
  for (const [route, Model, body] of entries) {
    const saved = await request(app).put(`/api/${route}`).set(auth(alice.token)).send(body).expect(200);
    await request(app).put(`/api/${route}`).set(auth(alice.token)).send(body).expect(200);
    assert.equal(await Model.countDocuments({ user: alice.user.id }), 1);
    assert.equal((await request(app).get(`/api/${route}`).set(auth(bob.token)).expect(200)).body.data.length, 0);
    await request(app).delete(`/api/${route}/${saved.body.data._id}`).set(auth(bob.token)).expect(404);
    await request(app).delete(`/api/${route}/${saved.body.data._id}`).set(auth(alice.token)).expect(204);
  }
  await request(app).post('/api/schedules/generate').set(auth(alice.token)).send({ input: 'Study' }).expect(503);
  assert.equal(await Schedule.countDocuments(), 0);
});
test('superadmin status comes from database and disabling revokes existing sessions', async () => {
  await User.updateOne({ _id: alice.user.id }, { $set: { role: 'superadmin' } });
  await request(app).get('/api/admin/overview').set(auth(alice.token)).expect(200);
  const users = await request(app).get('/api/admin/users').set(auth(alice.token)).expect(200);
  assert.ok(users.body.data.every(user => !('passwordHash' in user) && !('tokenVersion' in user)));
  await request(app).patch(`/api/admin/users/${alice.user.id}`).set(auth(alice.token)).send({ disabled: true }).expect(404);
  await request(app).patch(`/api/admin/users/${bob.user.id}`).set(auth(alice.token)).send({ disabled: true }).expect(200);
  await request(app).get('/api/auth/me').set(auth(bob.token)).expect(401);
  await request(app).post('/api/auth/login').send({ email: 'bob@example.com', password: credentials('bob').password }).expect(401);
  await request(app).patch(`/api/admin/users/${bob.user.id}`).set(auth(alice.token)).send({ disabled: false }).expect(200);
  await request(app).get('/api/auth/me').set(auth(bob.token)).expect(401);
  await request(app).post('/api/auth/logout').set(auth(alice.token)).expect(204);
  await request(app).get('/api/auth/me').set(auth(alice.token)).expect(401);
});
