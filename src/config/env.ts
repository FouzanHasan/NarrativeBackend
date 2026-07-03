import dotenv from 'dotenv';

dotenv.config();

interface Env {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: 'development' | 'test' | 'production';
  CORS_ORIGIN: string;
}

/**
 * Loads and validates process.env at boot. Throws a clear error immediately
 * if a required secret (JWT_SECRET) is missing, rather than failing later
 * with a confusing jsonwebtoken error at request time.
 */
function loadEnv(): Env {
  const NODE_ENV = (process.env.NODE_ENV as Env['NODE_ENV']) || 'development';

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error(
      'Missing required environment variable JWT_SECRET. Set it in your .env file (see .env.example).'
    );
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  if (Number.isNaN(PORT)) {
    throw new Error('Environment variable PORT must be a valid number.');
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fouzan-apps';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  const CORS_ORIGIN = process.env.CORS_ORIGIN || (NODE_ENV === 'development' ? '*' : '');

  return {
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    NODE_ENV,
    CORS_ORIGIN,
  };
}

export const env = loadEnv();
