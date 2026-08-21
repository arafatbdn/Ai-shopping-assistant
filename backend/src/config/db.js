import mongoose from 'mongoose';

let cachedConnectionPromise = null;

export async function connectDatabase() {
  const hasUri = Boolean(process.env.MONGODB_URI);
  console.log(`[MongoDB Diagnostic] MONGODB_URI exists: ${hasUri}`);

  if (!hasUri) {
    console.warn('MONGODB_URI is not configured. Running without a database connection.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  console.log('[MongoDB Diagnostic] MongoDB connection attempt started');

  try {
    cachedConnectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    await cachedConnectionPromise;
    mongoose.set('bufferTimeoutMS', 15000);
    console.log('[MongoDB Diagnostic] MongoDB connection success');
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error(`[MongoDB Diagnostic] MongoDB connection error message: ${error.message}`);
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn('The API will still start, but database-backed actions will be unavailable.');
    return null;
  }
}

