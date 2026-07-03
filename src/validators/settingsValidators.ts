import { z } from 'zod';

export const updateSettingsSchema = z
  .object({
    thresholdMinutes: z
      .number()
      .int('thresholdMinutes must be an integer')
      .min(1, 'thresholdMinutes must be at least 1')
      .max(1440, 'thresholdMinutes must be at most 1440')
      .optional(),
    promptsEnabled: z.boolean().optional(),
    promptMode: z.enum(['baseline', 'narrative', 'compare']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (thresholdMinutes, promptsEnabled, promptMode) must be provided',
  });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
