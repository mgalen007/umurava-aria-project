import { z } from 'zod';

export const createJobDto = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  department: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill'),
  niceToHaveSkills: z.array(z.string()).default([]),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']),
  minYearsExperience: z.number().min(0),
  maxYearsExperience: z.number().optional(),
  location: z.string().min(2, 'Location is required'),
  remote: z.boolean().default(false),
  hardRequirements: z.array(z.string()).default([]),
});

export const updateJobDto = createJobDto.partial();

export type CreateJobDto = z.infer<typeof createJobDto>;
export type UpdateJobDto = z.infer<typeof updateJobDto>;