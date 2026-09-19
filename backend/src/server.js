import mongoose from 'mongoose';
import { readConfig } from './config.js';
import { models } from './models.js';
import { createApp } from './app.js';

const config = readConfig();
try {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await Promise.all(models.map(Model => Model.init()));
  const server = createApp(config).listen(config.PORT, '127.0.0.1', () => {
    console.info(`SYNQ API listening at http://127.0.0.1:${config.PORT}`);
  });
  function shutdown() {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error(`Startup failed (${error.name}). Check database connectivity and configuration.`);
  process.exitCode = 1;
}
