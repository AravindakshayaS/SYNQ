import { Router } from 'express';
import { z } from 'zod';
import { User, Task, Schedule, Journal, publicUser } from '../models.js';
import { requireSuperadmin, HttpError } from '../middleware.js';
import { idSchema, listSchema } from '../validation.js';

export function adminRoutes() {
  const router = Router();
  router.use(requireSuperadmin);
  router.get('/overview', async (req, res) => {
    const [users, tasks, schedules, journals] = await Promise.all([User, Task, Schedule, Journal].map(Model => Model.countDocuments()));
    res.json({ data: { users, tasks, schedules, journals } });
  });
  router.get('/users', async (req, res) => {
    const { page, limit } = listSchema.omit({ date: true }).parse(req.query);
    const users = await User.find().sort({ _id: -1 }).skip((page - 1) * limit).limit(limit + 1);
    res.json({ data: users.slice(0, limit).map(publicUser), page, hasMore: users.length > limit });
  });
  router.patch('/users/:id', async (req, res) => {
    const id = idSchema.parse(req.params.id);
    const { disabled } = z.object({ disabled: z.boolean() }).strict().parse(req.body);
    // Superadmins cannot be disabled through the web API, including by another admin.
    const user = await User.findOneAndUpdate({ _id: id, role: 'user' }, {
      $set: { disabled }, $inc: { tokenVersion: 1 },
    }, { new: true });
    if (!user) throw new HttpError(404, 'Regular user not found');
    console.info(JSON.stringify({ event: 'account_status_changed', actor: String(req.user._id), target: id, disabled, requestId: req.id }));
    res.json({ data: publicUser(user) });
  });
  return router;
}
