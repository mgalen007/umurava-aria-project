import { z } from 'zod';

export const registerDto = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, underscores, and hyphens'),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginDto = z
  .object({
    identifier: z.string().trim().min(1).optional(),
    username: z.string().trim().min(1).optional(),
    email: z.string().trim().min(1).optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => Boolean(data.identifier || data.username || data.email), {
    message: 'Username or email is required',
    path: ['identifier'],
  });

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
