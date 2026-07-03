import { z } from 'zod';

export const createLogSchema = z.object({
  app: z.string().trim().min(1, 'app is required'),
  duration: z.number().min(0, 'duration must be a non-negative number'),
  promptType: z.enum(['baseline', 'narrative', 'none']),
  userAction: z.enum(['accepted', 'dismissed', 'ignored', 'opened_app', 'none']),
  sessionId: z.string().trim().min(1).optional(),
  sourcePlatform: z.enum(['android', 'ios-mock']),
  triggerReason: z.enum(['threshold_exceeded', 'manual_test', 'none']).optional(),
});

export type CreateLogInput = z.infer<typeof createLogSchema>;

export const listLogsQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, 'limit must be a positive integer')
    .optional(),
  app: z.string().trim().min(1).optional(),
});

export const promptsHistoryQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, 'limit must be a positive integer')
    .optional(),
});
