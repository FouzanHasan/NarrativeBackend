import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1, 'firstName cannot be empty').optional(),
    studyGoal: z.string().trim().max(500, 'studyGoal is too long').optional(),
    motivationalGoal: z.string().trim().max(500, 'motivationalGoal is too long').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (firstName, studyGoal, motivationalGoal) must be provided',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
