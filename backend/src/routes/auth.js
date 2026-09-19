import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { User, publicUser } from '../models.js';
import { authenticate, HttpError } from '../middleware.js';
import { registrationSchema, loginSchema } from '../validation.js';

const dummyHash = bcrypt.hashSync('timing-only-placeholder', 12);
export function authRoutes(config) {
  const router = Router();
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
  function session(user) {
    const token = jwt.sign({ version: user.tokenVersion }, config.JWT_SECRET, {
      algorithm: 'HS256', subject: String(user._id), issuer: 'synq', audience: 'synq-api', expiresIn: '30m',
    });
    return { user: publicUser(user), token, expiresIn: 1800 };
  }
  router.post('/register', limiter, async (req, res) => {
    const { password, ...fields } = registrationSchema.parse(req.body);
    const user = await User.create({ ...fields, passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    res.status(201).json(session(user));
  });
  router.post('/login', limiter, async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash +tokenVersion');
    const valid = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
    if (!valid || !user || user.disabled) throw new HttpError(401, 'Invalid email or password');
    res.json(session(user));
  });
  router.get('/me', authenticate(config), (req, res) => res.json({ user: publicUser(req.user) }));
  router.post('/logout', authenticate(config), async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    res.status(204).end();
  });
  return router;
}
