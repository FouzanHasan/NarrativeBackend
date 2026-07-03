// See tests/integration/auth.test.ts for the note on why this mocks the
// Mongoose model layer instead of using mongodb-memory-server.
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { UsageLog } from '../../src/models/UsageLog';
import { signToken } from '../../src/utils/jwt';

jest.mock('../../src/models/UsageLog');

const mockedUsageLog = UsageLog as jest.Mocked<typeof UsageLog>;

const userId = new mongoose.Types.ObjectId().toString();
const authHeader = `Bearer ${signToken(userId)}`;

describe('Logs & Prompts routes', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/v1/logs', () => {
    it('requires auth', async () => {
      const res = await request(app).post('/api/v1/logs').send({
        app: 'instagram',
        duration: 12,
        promptType: 'narrative',
        userAction: 'accepted',
        sourcePlatform: 'android',
      });
      expect(res.status).toBe(401);
    });

    it('creates a log scoped to the authenticated user', async () => {
      const created = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        app: 'instagram',
        duration: 12,
        promptType: 'narrative',
        userAction: 'accepted',
        sessionId: 'session-1',
        sourcePlatform: 'android',
        triggerReason: 'threshold_exceeded',
      };
      (mockedUsageLog.create as unknown as jest.Mock).mockResolvedValue(created);

      const res = await request(app)
        .post('/api/v1/logs')
        .set('Authorization', authHeader)
        .send({
          app: 'instagram',
          duration: 12,
          promptType: 'narrative',
          userAction: 'accepted',
          sessionId: 'session-1',
          sourcePlatform: 'android',
          triggerReason: 'threshold_exceeded',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockedUsageLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId, app: 'instagram', sourcePlatform: 'android' })
      );
    });

    it('generates a sessionId when not provided', async () => {
      (mockedUsageLog.create as unknown as jest.Mock).mockResolvedValue({});

      await request(app)
        .post('/api/v1/logs')
        .set('Authorization', authHeader)
        .send({
          app: 'tiktok',
          duration: 5,
          promptType: 'none',
          userAction: 'none',
          sourcePlatform: 'ios-mock',
        });

      const callArg = (mockedUsageLog.create as unknown as jest.Mock).mock.calls[0][0];
      expect(typeof callArg.sessionId).toBe('string');
      expect(callArg.sessionId.length).toBeGreaterThan(0);
      expect(callArg.triggerReason).toBe('none');
    });

    it('rejects invalid promptType with 400', async () => {
      const res = await request(app)
        .post('/api/v1/logs')
        .set('Authorization', authHeader)
        .send({
          app: 'instagram',
          duration: 12,
          promptType: 'invalid-type',
          userAction: 'accepted',
          sourcePlatform: 'android',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/logs', () => {
    it('returns most recent logs scoped to the user, respecting limit', async () => {
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue([{ app: 'instagram' }]);
      (mockedUsageLog.find as unknown as jest.Mock).mockReturnValue({
        sort: sortMock,
        limit: limitMock,
      });

      const res = await request(app)
        .get('/api/v1/logs?limit=5&app=instagram')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(mockedUsageLog.find).toHaveBeenCalledWith({ userId, app: 'instagram' });
      expect(sortMock).toHaveBeenCalledWith({ timestamp: -1 });
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(res.body.data).toEqual([{ app: 'instagram' }]);
    });

    it('clamps limit to the max of 200', async () => {
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue([]);
      (mockedUsageLog.find as unknown as jest.Mock).mockReturnValue({
        sort: sortMock,
        limit: limitMock,
      });

      await request(app).get('/api/v1/logs?limit=9999').set('Authorization', authHeader);

      expect(limitMock).toHaveBeenCalledWith(200);
    });
  });

  describe('GET /api/v1/prompts/history', () => {
    // Documents/verifies the architectural decision in logService.ts:
    // prompt history is UsageLog filtered to promptType != 'none', not a
    // separate collection.
    it('queries UsageLog filtered to promptType != none', async () => {
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue([]);
      (mockedUsageLog.find as unknown as jest.Mock).mockReturnValue({
        sort: sortMock,
        limit: limitMock,
      });

      const res = await request(app)
        .get('/api/v1/prompts/history?limit=10')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(mockedUsageLog.find).toHaveBeenCalledWith({
        userId,
        promptType: { $ne: 'none' },
      });
      expect(limitMock).toHaveBeenCalledWith(10);
    });
  });
});
