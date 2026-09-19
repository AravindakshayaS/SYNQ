import { z } from 'zod';

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const day = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === value;
}, 'Use a real calendar date in YYYY-MM-DD format');
export const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
export const emailSchema = z.email().max(254).transform(v => v.toLowerCase());
export const passwordSchema = z.string().min(12).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes');
export const registrationSchema = z.object({
  name: z.string().trim().min(1).max(80), email: emailSchema, password: passwordSchema,
}).strict();
export const loginSchema = registrationSchema.omit({ name: true });
export const tagSchema = z.enum(['study', 'work', 'health', 'meal', 'break', 'sleep', 'other']);
export const taskSchema = z.object({
  date: dateSchema,
  title: z.string().trim().min(1).max(200),
  status: z.enum(['pending', 'completed', 'skipped']).default('pending'),
  tag: tagSchema.default('other'),
}).strict();
// Patch fields must not inherit creation defaults: editing a title must preserve status/tag.
export const taskUpdateSchema = z.object({
  date: dateSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  status: z.enum(['pending', 'completed', 'skipped']).optional(),
  tag: tagSchema.optional(),
}).strict().refine(v => Object.keys(v).length > 0, 'Provide an update');
export const journalSchema = z.object({
  date: dateSchema, text: z.string().trim().min(1).max(20000),
  mood: z.enum(['great', 'good', 'okay', 'low', 'difficult']),
}).strict();
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const blocksSchema = z.array(z.object({
  time: timeSchema, endTime: timeSchema,
  label: z.string().trim().min(1).max(200), tag: tagSchema,
}).strict()).min(1).max(100).superRefine((blocks, ctx) => {
  let lastEnd = -1;
  blocks.forEach((block, index) => {
    const start = minutes(block.time);
    const end = minutes(block.endTime);
    if (end <= start || start < lastEnd) {
      ctx.addIssue({ code: 'custom', path: [index], message: 'Blocks must be ordered, non-overlapping, and end after they start' });
    }
    lastEnd = end;
  });
});
export const scheduleSchema = z.object({
  date: dateSchema, mode: z.enum(['weekday', 'weekend']).default('weekday'), blocks: blocksSchema,
}).strict();
export const listSchema = z.object({
  date: dateSchema.optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
}).strict();
