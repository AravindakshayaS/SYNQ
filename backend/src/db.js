import mongoose from 'mongoose';

let listenersRegistered = false;

function registerConnectionListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    console.info(`[database] connected to ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (error) => {
    // Avoid logging the connection string or credentials from driver errors.
    console.error(`[database] connection error (${error.name})`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[database] disconnected');
  });
}

export async function connectDB(uri = process.env.MONGO_URI, options = {}) {
  if (!uri) throw new Error('MONGO_URI is required');
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  registerConnectionListeners();
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      ...options,
    });
    return mongoose.connection;
  } catch (error) {
    console.error(`[database] initial connection failed (${error.name})`);
    throw error;
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}
