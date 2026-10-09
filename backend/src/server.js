import { readConfig } from './config.js';
import { connectDB, disconnectDB } from './db.js';
import {
  isLocalMongoAvailable,
  isLocalMongoUri,
  startDevelopmentDatabase,
  stopDevelopmentDatabase,
} from './development-database.js';
import { models } from './models.js';
import { createApp } from './app.js';

const config = readConfig();
try {
  const canUseDevelopmentDatabase =
    config.NODE_ENV === 'development' && isLocalMongoUri(config.MONGO_URI);
  let databaseUri = config.MONGO_URI;

  if (canUseDevelopmentDatabase && !(await isLocalMongoAvailable(config.MONGO_URI))) {
    console.warn('[database] local MongoDB unavailable; starting the embedded development database');
    databaseUri = await startDevelopmentDatabase();
  }

  try {
    await connectDB(databaseUri, {
      serverSelectionTimeoutMS: isLocalMongoUri(databaseUri) ? 1500 : 10000,
    });
  } catch (error) {
    if (!canUseDevelopmentDatabase || databaseUri !== config.MONGO_URI) throw error;

    await disconnectDB();
    console.warn('[database] local MongoDB unavailable; starting the embedded development database');
    const developmentUri = await startDevelopmentDatabase();
    await connectDB(developmentUri);
  }
  await Promise.all(models.map(Model => Model.init()));
  const server = createApp(config).listen(config.PORT, '127.0.0.1', () => {
    console.info(`SYNQ API listening at http://127.0.0.1:${config.PORT}`);
  });
  let shuttingDown = false;
  function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(async () => {
      try {
        await disconnectDB();
        await stopDevelopmentDatabase();
        process.exit(0);
      } catch (error) {
        console.error(`[database] shutdown failed (${error.name})`);
        process.exit(1);
      }
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error(`Startup failed (${error.name}). Check database connectivity and configuration.`);
  try {
    await disconnectDB();
    await stopDevelopmentDatabase();
  } catch (disconnectError) {
    console.error(`[database] startup cleanup failed (${disconnectError.name})`);
  }
  process.exitCode = 1;
}
