import mongoose from 'mongoose';

const { Schema } = mongoose;
const options = { timestamps: true, strict: 'throw' };
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'superadmin'], default: 'user' },
  disabled: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0, select: false },
}, options);

const ownedDay = {
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
};
const taskSchema = new Schema({
  ...ownedDay,
  title: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
  tag: { type: String, enum: ['study', 'work', 'health', 'meal', 'break', 'sleep', 'other'], default: 'other' },
}, options);
taskSchema.index({ user: 1, date: 1 });

const journalSchema = new Schema({
  ...ownedDay,
  text: { type: String, required: true },
  mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'difficult'], required: true },
}, options);
journalSchema.index({ user: 1, date: 1 }, { unique: true });

const blockSchema = new Schema({
  time: String, endTime: String, label: String, tag: String,
}, { _id: false, strict: 'throw' });
const scheduleSchema = new Schema({
  ...ownedDay,
  mode: { type: String, enum: ['weekday', 'weekend'], default: 'weekday' },
  blocks: [blockSchema],
}, options);
scheduleSchema.index({ user: 1, date: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
export const Task = mongoose.model('Task', taskSchema);
export const Journal = mongoose.model('Journal', journalSchema);
export const Schedule = mongoose.model('Schedule', scheduleSchema);
export const models = [User, Task, Journal, Schedule];

export function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, disabled: user.disabled };
}
