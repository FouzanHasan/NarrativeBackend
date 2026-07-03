import crypto from 'crypto';
import { UsageLog, UsageLogDocument } from '../models/UsageLog';
import { CreateLogInput } from '../validators/logValidators';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function clampLimit(rawLimit?: string): number {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsed = parseInt(rawLimit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function createLog(
  userId: string,
  input: CreateLogInput
): Promise<UsageLogDocument> {
  const log = await UsageLog.create({
    userId,
    app: input.app,
    duration: input.duration,
    promptType: input.promptType,
    userAction: input.userAction,
    // sessionId is required on the model but optional on the request body
    // (the mobile client may not always have one, e.g. manual test events).
    sessionId: input.sessionId ?? crypto.randomUUID(),
    sourcePlatform: input.sourcePlatform,
    triggerReason: input.triggerReason ?? 'none',
  });
  return log;
}

export async function listLogs(
  userId: string,
  opts: { limit?: string; app?: string }
): Promise<UsageLogDocument[]> {
  const limit = clampLimit(opts.limit);
  const filter: Record<string, unknown> = { userId };
  if (opts.app) filter.app = opts.app;

  return UsageLog.find(filter).sort({ timestamp: -1 }).limit(limit);
}

/**
 * Prompt history is intentionally NOT a separate collection/model. A
 * UsageLog row with promptType !== 'none' *is* a prompt event — it already
 * carries every field a PromptEvent would need (timestamp, app, duration,
 * promptType, userAction). Introducing a second collection would duplicate
 * that data with zero new information, so /prompts/history is just /logs
 * filtered server-side to promptType != 'none'.
 */
export async function listPromptHistory(
  userId: string,
  opts: { limit?: string }
): Promise<UsageLogDocument[]> {
  const limit = clampLimit(opts.limit);
  return UsageLog.find({ userId, promptType: { $ne: 'none' } })
    .sort({ timestamp: -1 })
    .limit(limit);
}
