import { UserSettings, UserSettingsDocument } from '../models/UserSettings';
import { AppsResponse } from '../types/dto';

// "Selected apps" is a flat string array of app ids stored on UserSettings,
// not a separate collection — the server never stores app metadata, only
// the ids the user picked (the app catalog itself lives on the mobile client).

async function getOrCreateSettings(userId: string): Promise<UserSettingsDocument> {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({ userId });
  }
  return settings;
}

export async function getApps(userId: string): Promise<AppsResponse> {
  const settings = await getOrCreateSettings(userId);
  return { selectedApps: settings.selectedApps };
}

export async function updateApps(userId: string, selectedApps: string[]): Promise<AppsResponse> {
  const settings = await getOrCreateSettings(userId);
  settings.selectedApps = selectedApps;
  await settings.save();
  return { selectedApps: settings.selectedApps };
}
