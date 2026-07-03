import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(env.MONGODB_URI);
  return connection;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
