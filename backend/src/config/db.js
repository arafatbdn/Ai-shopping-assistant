import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not configured. Running without a database connection.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, maxPoolSize: 10 });
    mongoose.set('bufferTimeoutMS', 15000);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn('The API will still start, but database-backed actions will be unavailable.');
  }
}
