import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongodbUri, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch(() => {
        console.error('MongoDB connection error');
        cached.promise = null;
        throw new Error('MongoDB connection failed');
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    console.error('MongoDB connection failed');
    throw new Error('MongoDB connection failed');
  }

  return cached.conn;
}

export default connectDB;

