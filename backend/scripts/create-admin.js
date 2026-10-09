import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import { readConfig } from '../src/config.js';
import { connectDB, disconnectDB } from '../src/db.js';
import { User, models } from '../src/models.js';
import { registrationSchema } from '../src/validation.js';

// Interactive terminal only: passwords never enter shell arguments, history, or logs.
if (!process.stdin.isTTY) throw new Error('Run admin:create in an interactive terminal');
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) {
  if (!muted) process.stdout.write(chunk, encoding);
  callback();
} });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
try {
  const config = readConfig();
  const name = await prompt.question('Your name: ');
  const email = (await prompt.question('Your email: ')).trim();
  process.stdout.write('Password (12+ characters, hidden): ');
  muted = true;
  const password = await prompt.question('');
  muted = false;
  process.stdout.write('\nConfirm password (hidden): ');
  muted = true;
  const confirmation = await prompt.question('');
  muted = false;
  process.stdout.write('\n');
  if (password !== confirmation) throw new Error('Passwords do not match');
  const fields = registrationSchema.parse({ name, email, password });
  await connectDB(config.MONGO_URI);
  await Promise.all(models.map(Model => Model.init()));
  const existing = await User.findOne({ email: fields.email });
  if (existing) {
    // Never promote an already registered account based solely on its email.
    throw new Error('Email already exists. No changes made; use an unused owner email for initial provisioning.');
  }
  await User.create({ name: fields.name, email: fields.email, role: 'superadmin', passwordHash: await bcrypt.hash(fields.password, 12) });
  console.info('Superadmin created. Log in with your email and password.');
} catch (error) {
  if (error.name === 'ZodError') console.error('Invalid name, email, or password. Password must be 12+ characters and at most 72 UTF-8 bytes.');
  else if (error.code === 11000) console.error('Email already exists. No changes made.');
  else console.error(error.name === 'Error' ? error.message : `Setup failed (${error.name}). Check configuration and database connectivity.`);
  process.exitCode = 1;
} finally {
  muted = false;
  prompt.close();
  await disconnectDB();
}
