import { Router } from 'express';
import { Task, Journal, Schedule } from '../models.js';
import { HttpError } from '../middleware.js';
import { taskSchema, taskUpdateSchema, journalSchema, scheduleSchema, listSchema, idSchema } from '../validation.js';

// All routers here inherit authentication from app.js.
async function list(Model, req, res) {
  const { date, page, limit } = listSchema.parse(req.query);
  const filter = { user: req.user._id, ...(date ? { date } : {}) };
  const records = await Model.find(filter).sort({ date: -1, _id: -1 }).skip((page - 1) * limit).limit(limit + 1).lean();
  res.json({ data: records.slice(0, limit), page, hasMore: records.length > limit });
}
function ownedId(req) { return { _id: idSchema.parse(req.params.id), user: req.user._id }; }
function deletion(router, Model) {
  router.delete('/:id', async (req, res) => {
    const record = await Model.findOneAndDelete(ownedId(req));
    if (!record) throw new HttpError(404, 'Record not found');
    res.status(204).end();
  });
}
export function taskRoutes() {
  const router = Router();
  router.get('/', (req, res) => list(Task, req, res));
  router.post('/', async (req, res) => {
    const record = await Task.create({ ...taskSchema.parse(req.body), user: req.user._id });
    res.status(201).json({ data: record });
  });
  router.patch('/:id', async (req, res) => {
    const record = await Task.findOneAndUpdate(ownedId(req), { $set: taskUpdateSchema.parse(req.body) }, { new: true, runValidators: true });
    if (!record) throw new HttpError(404, 'Record not found');
    res.json({ data: record });
  });
  deletion(router, Task);
  return router;
}
export function dailyRoutes(Model, schema) {
  const router = Router();
  router.get('/', (req, res) => list(Model, req, res));
  router.put('/', async (req, res) => {
    const value = schema.parse(req.body);
    const record = await Model.findOneAndUpdate({ user: req.user._id, date: value.date }, {
      $set: value, $setOnInsert: { user: req.user._id },
    }, { upsert: true, new: true, runValidators: true });
    res.json({ data: record });
  });
  deletion(router, Model);
  return router;
}
export const journalRoutes = () => dailyRoutes(Journal, journalSchema);
export const scheduleRoutes = () => dailyRoutes(Schedule, scheduleSchema);
