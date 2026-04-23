import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT ?? 4000;
const DEFAULT_MONGO_MAX_POOL_SIZE = 20;
const DEFAULT_MONGO_MIN_POOL_SIZE = 2;
const DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS = 5000;
const DEFAULT_MONGO_SOCKET_TIMEOUT_MS = 45000;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to start the server`);
  }
  return value;
}

function getPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function bootstrap() {
  const mongoUri = getRequiredEnv('MONGODB_URI');
  getRequiredEnv('JWT_SECRET');

  await mongoose.connect(mongoUri, {
    maxPoolSize: getPositiveIntEnv('MONGO_MAX_POOL_SIZE', DEFAULT_MONGO_MAX_POOL_SIZE),
    minPoolSize: getPositiveIntEnv('MONGO_MIN_POOL_SIZE', DEFAULT_MONGO_MIN_POOL_SIZE),
    serverSelectionTimeoutMS: getPositiveIntEnv(
      'MONGO_SERVER_SELECTION_TIMEOUT_MS',
      DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS,
    ),
    socketTimeoutMS: getPositiveIntEnv(
      'MONGO_SOCKET_TIMEOUT_MS',
      DEFAULT_MONGO_SOCKET_TIMEOUT_MS,
    ),
  });
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`ARIA API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
