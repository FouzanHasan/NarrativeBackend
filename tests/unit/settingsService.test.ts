// Pure unit test: mocks the Mongoose model layer entirely, so this test
// does not require a database connection of any kind.
import { UserSettings } from '../../src/models/UserSettings';
import * as settingsService from '../../src/services/settingsService';

jest.mock('../../src/models/UserSettings');

const mockedUserSettings = UserSettings as jest.Mocked<typeof UserSettings>;

describe('settingsService', () => {
  const userId = '64b000000000000000000001';

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSettings', () => {
    it('returns existing settings when found', async () => {
      const existing = {
        userId,
        thresholdMinutes: 15,
        promptsEnabled: false,
        promptMode: 'baseline',
      };
      (mockedUserSettings.findOne as unknown as jest.Mock).mockResolvedValue(existing);

      const result = await settingsService.getSettings(userId);

      expect(mockedUserSettings.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({
        thresholdMinutes: 15,
        promptsEnabled: false,
        promptMode: 'baseline',
      });
    });

    it('creates default settings when none exist yet', async () => {
      (mockedUserSettings.findOne as unknown as jest.Mock).mockResolvedValue(null);
      const created = {
        userId,
        thresholdMinutes: 10,
        promptsEnabled: true,
        promptMode: 'narrative',
      };
      (mockedUserSettings.create as unknown as jest.Mock).mockResolvedValue(created);

      const result = await settingsService.getSettings(userId);

      expect(mockedUserSettings.create).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({
        thresholdMinutes: 10,
        promptsEnabled: true,
        promptMode: 'narrative',
      });
    });
  });

  describe('updateSettings', () => {
    it('applies only the provided fields and saves', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const existing = {
        userId,
        thresholdMinutes: 10,
        promptsEnabled: true,
        promptMode: 'narrative',
        save,
      };
      (mockedUserSettings.findOne as unknown as jest.Mock).mockResolvedValue(existing);

      const result = await settingsService.updateSettings(userId, { thresholdMinutes: 25 });

      expect(existing.thresholdMinutes).toBe(25);
      expect(existing.promptsEnabled).toBe(true);
      expect(existing.promptMode).toBe('narrative');
      expect(save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        thresholdMinutes: 25,
        promptsEnabled: true,
        promptMode: 'narrative',
      });
    });

    it('updates promptMode independently of other fields', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const existing = {
        userId,
        thresholdMinutes: 10,
        promptsEnabled: true,
        promptMode: 'narrative',
        save,
      };
      (mockedUserSettings.findOne as unknown as jest.Mock).mockResolvedValue(existing);

      const result = await settingsService.updateSettings(userId, { promptMode: 'compare' });

      expect(existing.promptMode).toBe('compare');
      expect(result.promptMode).toBe('compare');
    });
  });
});
