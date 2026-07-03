import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { UserSettings } from '../models/UserSettings';
import { UsageLog } from '../models/UsageLog';
import { PromptType, SourcePlatform, TriggerReason, UserAction } from '../types/dto';

export const DEMO_EMAIL = 'demo@example.com';
export const DEMO_PASSWORD = 'Passw0rd!';

const APPS = ['instagram', 'tiktok', 'youtube'];
const PROMPT_TYPES: PromptType[] = ['baseline', 'narrative', 'none'];
const USER_ACTIONS: UserAction[] = ['accepted', 'dismissed', 'ignored', 'opened_app', 'none'];
const SOURCE_PLATFORMS: SourcePlatform[] = ['android', 'ios-mock'];
const TRIGGER_REASONS: TriggerReason[] = ['threshold_exceeded', 'manual_test', 'none'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

/**
 * Creates/upserts the demo user, their settings, selected apps, and a
 * handful of sample UsageLog rows spread across the last few days with a
 * mix of promptType/userAction values. Used by both the dev-only
 * POST /dev/seed endpoint and the standalone `npm run seed` script — kept
 * in one place so the two never drift apart.
 */
export async function seedDemoData(): Promise<{ email: string; password: string; userId: string }> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      email: DEMO_EMAIL,
      passwordHash,
      firstName: 'Demo',
      studyGoal: 'Finish thesis literature review',
      motivationalGoal: 'Spend more focused time studying',
    });
  } else {
    user.passwordHash = passwordHash;
    user.firstName = 'Demo';
    user.studyGoal = user.studyGoal ?? 'Finish thesis literature review';
    user.motivationalGoal = user.motivationalGoal ?? 'Spend more focused time studying';
    await user.save();
  }

  await UserSettings.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      thresholdMinutes: 10,
      promptsEnabled: true,
      promptMode: 'compare',
      selectedApps: APPS,
    },
    { upsert: true, new: true }
  );

  // Replace any previous demo logs so re-seeding is idempotent and doesn't
  // accumulate duplicate rows across repeated `npm run seed` / POST /dev/seed calls.
  await UsageLog.deleteMany({ userId: user._id });

  const now = Date.now();
  const sampleLogs = Array.from({ length: 15 }).map((_, i) => {
    const daysAgo = Math.floor(i / 5); // spread across last few days
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - i * 15 * 60 * 1000);
    const promptType = pick(PROMPT_TYPES, i);
    return {
      userId: user!._id,
      timestamp,
      app: pick(APPS, i),
      duration: 5 + (i % 6) * 3,
      promptType,
      userAction: promptType === 'none' ? 'none' : pick(USER_ACTIONS, i),
      sessionId: `seed-session-${i}`,
      sourcePlatform: pick(SOURCE_PLATFORMS, i),
      triggerReason: pick(TRIGGER_REASONS, i),
    };
  });

  await UsageLog.insertMany(sampleLogs);

  return { email: DEMO_EMAIL, password: DEMO_PASSWORD, userId: user._id.toString() };
}

/**
 * Standalone runner: `npm run seed`. Connects to MongoDB directly (unlike
 * the /dev/seed endpoint, which reuses the already-connected app instance).
 */
async function run(): Promise<void> {
  // Deferred imports so this file can be unit-tested without triggering a
  // real DB connection when only seedDemoData() is exercised.
  const { connectDB, disconnectDB } = await import('../config/db');
  await connectDB();
  const result = await seedDemoData();
  // eslint-disable-next-line no-console
  console.log('Seed complete:', result);
  await disconnectDB();
  process.exit(0);
}

if (require.main === module) {
  run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
