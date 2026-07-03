import { z } from 'zod';

export const updateAppsSchema = z.object({
  selectedApps: z
    .array(z.string().trim().min(1, 'app id cannot be empty'))
    .max(50, 'selectedApps is too long'),
});

export type UpdateAppsInput = z.infer<typeof updateAppsSchema>;
