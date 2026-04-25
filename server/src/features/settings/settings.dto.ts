import { z } from 'zod';

const dataUrlOrUrl = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith('data:image/') || /^https?:\/\//.test(value),
    'Profile photo must be a valid image URL or data URL'
  );

export const updateProfileDto = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  jobTitle: z.string().trim().min(2, 'Job title must be at least 2 characters').max(120),
  profilePhotoUrl: z.union([dataUrlOrUrl, z.null()]).optional(),
});

export const changePasswordDto = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: 'New password and confirmation must match',
    path: ['confirmNewPassword'],
  });

export const updateAiPreferencesDto = z
  .object({
    defaultShortlistSize: z.enum(['5', '10', '20', 'all']),
    defaultScreeningMode: z.enum(['umurava', 'external', 'both']),
    weights: z.object({
      skills: z.number().min(0).max(100),
      experience: z.number().min(0).max(100),
      education: z.number().min(0).max(100),
    }),
    showReasoning: z.boolean(),
  })
  .refine(
    (value) => value.weights.skills + value.weights.experience + value.weights.education === 100,
    {
      message: 'AI scoring weights must add up to exactly 100',
      path: ['weights'],
    }
  );

export const updateParsingPreferencesDto = z
  .object({
    fields: z.object({
      name: z.boolean(),
      email: z.boolean(),
      skills: z.boolean(),
      experience: z.boolean(),
      education: z.boolean(),
      location: z.boolean(),
      certifications: z.boolean(),
    }),
    fallbackBehavior: z.enum(['blank', 'flag']),
  })
  .refine((value) => Object.values(value.fields).some(Boolean), {
    message: 'Select at least one field to extract',
    path: ['fields'],
  });

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
export type ChangePasswordDto = z.infer<typeof changePasswordDto>;
export type UpdateAiPreferencesDto = z.infer<typeof updateAiPreferencesDto>;
export type UpdateParsingPreferencesDto = z.infer<typeof updateParsingPreferencesDto>;
