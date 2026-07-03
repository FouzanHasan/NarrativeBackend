// Ensures required env vars exist before any test module (in particular
// src/config/env.ts, which throws at import time if JWT_SECRET is missing)
// is loaded.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-do-not-use-in-prod';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fouzan-apps-test';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
process.env.PORT = process.env.PORT || '4000';
