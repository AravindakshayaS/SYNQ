import { mkdir } from 'node:fs/promises';
import { createConnection } from 'node:net';
import { fileURLToPath } from 'node:url';

let developmentDatabase;

export function isLocalMongoUri(uri) {
  return /^mongodb:\/\/(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?(?:\/|$)/i.test(uri);
}

export async function isLocalMongoAvailable(uri, timeoutMs = 500) {
  const parsedUri = new URL(uri);
  const host = parsedUri.hostname.replace(/^\[|\]$/g, '');
  const port = Number(parsedUri.port || 27017);

  return new Promise(resolve => {
    const socket = createConnection({ host, port });
    let settled = false;
    const finish = available => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(available);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

export async function startDevelopmentDatabase(databaseName = 'synq') {
  if (developmentDatabase) return developmentDatabase.getUri(databaseName);

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const databasePath = fileURLToPath(new URL('../.data/mongodb', import.meta.url));
  await mkdir(databasePath, { recursive: true });

  developmentDatabase = await MongoMemoryServer.create({
    instance: {
      dbName: databaseName,
      dbPath: databasePath,
      storageEngine: 'wiredTiger',
    },
  });

  return developmentDatabase.getUri(databaseName);
}

export async function stopDevelopmentDatabase() {
  if (!developmentDatabase) return;
  await developmentDatabase.stop({ doCleanup: false, force: false });
  developmentDatabase = undefined;
}
