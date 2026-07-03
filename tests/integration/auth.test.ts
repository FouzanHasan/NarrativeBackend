// Integration test strategy note:
// mongodb-memory-server cannot download a MongoDB server binary in this
// sandbox (it is aarch64 Linux; MongoDB does not publish official server
// binaries for that platform/distro combination for the versions we tried,
// so MongoMemoryServer.create() fails with a DownloadError regardless of
// version pinned). As a fallback (explicitly allowed by the task brief), we
// mock the Mongoose model layer (jest.mock on models/*) and exercise the
// real Express app + real middleware + real services/controllers/routes via
// supertest. This still verifies routing, validation, auth, and response
// envelopes end-to-end; only the persistence layer is faked.
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User } from '../../src/models/User';
import { UserSettings } from '../../src/models/UserSettings';

jest.mock('../../src/models/User');
jest.mock('../../src/models/UserSettings');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedUserSettings = UserSettings as jest.Mocked<typeof UserSettings>;

function fakeUserDoc(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    email: 'jane@example.com',
    firstName: 'Jane',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuuXK8n0F0k0k0k0k0k0k0k0k0k0k0k0',
    studyGoal: null,
    motivationalGoal: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('Auth routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and returns token + user (never passwordHash)', async () => {
      (mockedUser.findOne as unknown as jest.Mock).mockResolvedValue(null);
      const created = fakeUserDoc();
      (mockedUser.create as unknown as jest.Mock).mockResolvedValue(created);
      (mockedUserSettings.create as unknown as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'Jane@Example.com',
        password: 'supersecret1',
        firstName: 'Jane',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toEqual({
        id: created._id.toString(),
        email: created.email,
        firstName: created.firstName,
      });
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(mockedUserSettings.create).toHaveBeenCalledWith({ userId: created._id });
    });

    it('rejects duplicate email with 409', async () => {
      (mockedUser.findOne as unknown as jest.Mock).mockResolvedValue(fakeUserDoc());

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'jane@example.com',
        password: 'supersecret1',
        firstName: 'Jane',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid input with 400 and validation errors', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'not-an-email',
        password: 'short',
        firstName: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('supersecret1', 10);
      const userDoc = fakeUserDoc({ passwordHash });
      const selectMock = jest.fn().mockResolvedValue(userDoc);
      (mockedUser.findOne as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'jane@example.com',
        password: 'supersecret1',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
    });

    it('rejects wrong password with 401', async () => {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('correct-password', 10);
      const userDoc = fakeUserDoc({ passwordHash });
      const selectMock = jest.fn().mockResolvedValue(userDoc);
      (mockedUser.findOne as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'jane@example.com',
        password: 'wrong-password',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects unknown email with 401', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      (mockedUser.findOne as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'whatever1',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects requests with an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });

    it('returns the authenticated user for a valid token', async () => {
      const { signToken } = require('../../src/utils/jwt');
      const userDoc = fakeUserDoc();
      (mockedUser.findById as unknown as jest.Mock).mockResolvedValue(userDoc);

      const token = signToken(userDoc._id.toString());
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.id).toBe(userDoc._id.toString());
      expect(res.body.data.user.email).toBe(userDoc.email);
    });
  });
});
