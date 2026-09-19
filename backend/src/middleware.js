import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { User } from './models.js';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function authenticate(config) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new HttpError(401, 'Authentication required');
    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'], issuer: 'synq', audience: 'synq-api' });
    } catch { throw new HttpError(401, 'Invalid or expired session'); }
    if (typeof payload.sub !== 'string' || !/^[a-f\d]{24}$/i.test(payload.sub)) {
      throw new HttpError(401, 'Invalid session');
    }
    const user = await User.findById(payload.sub).select('+tokenVersion');
    if (!user || user.disabled || user.tokenVersion !== payload.version) throw new HttpError(401, 'Session revoked');
    req.user = user;
    next();
  };
}

export function requireSuperadmin(req, res, next) {
  if (req.user.role !== 'superadmin') throw new HttpError(403, 'Superadmin access required');
  next();
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid input', issues: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  if (error.code === 11000) return res.status(409).json({ error: 'Record already exists; refresh and retry' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  console.error(JSON.stringify({ event: 'request_failed', requestId: req.id, type: error.name }));
  return res.status(500).json({ error: 'Unexpected server error', requestId: req.id });
}
