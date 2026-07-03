// Verifies the hard ethics/privacy requirement that the dev-only seed
// endpoint is unreachable outside development.
import request from 'supertest';

describe('POST /api/v1/dev/seed environment gating', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it('responds 404 when NODE_ENV=production', async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    // Re-require app fresh so config/env.ts re-reads NODE_ENV.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const prodApp = require('../../src/app').default;

    const res = await request(prodApp).post('/api/v1/dev/seed');
    expect(res.status).toBe(404);
  });
});
