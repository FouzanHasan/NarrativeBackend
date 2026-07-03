import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('email must be a valid email address'),
  password: z.string().min(8, 'password must be at least 8 characters long'),
  firstName: z.string().trim().min(1, 'firstName is required'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
