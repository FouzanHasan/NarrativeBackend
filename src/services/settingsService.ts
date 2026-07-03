import { UserSettings, UserSettingsDocument } from '../models/UserSettings';
import { SettingsResponse } from '../types/dto';
import { UpdateSettingsInput } from '../validators/settingsValidators';

function toSettingsResponse(settings: UserSettingsDocument): SettingsResponse {
  return {
    thresholdMinutes: settings.thresholdMinutes,
    promptsEnabled: settings.promptsEnabled,
    promptMode: settings.promptMode,
  };
}

/**
 * Settings should have been created at registration, but we upsert
 * defensively (e.g. for users created before this existed, or in tests
 * that construct a User directly) so every authenticated user always has
 * a resolvable settings document.
 */
async function getOrCreateSettings(userId: string): Promise<UserSettingsDocument> {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({ userId });
  }
  return settings;
}

export async function getSettings(userId: string): Promise<SettingsResponse> {
  const settings = await getOrCreateSettings(userId);
  return toSettingsResponse(settings);
}

export async function updateSettings(
  userId: string,
  input: UpdateSettingsInput
): Promise<SettingsResponse> {
  const settings = await getOrCreateSettings(userId);

  if (input.thresholdMinutes !== undefined) settings.thresholdMinutes = input.thresholdMinutes;
  if (input.promptsEnabled !== undefined) settings.promptsEnabled = input.promptsEnabled;
  if (input.promptMode !== undefined) settings.promptMode = input.promptMode;

  await settings.save();
  return toSettingsResponse(settings);
}
