import { z } from 'zod';

const skillDto = z.object({
  name:              z.string().min(1),
  level:             z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  yearsOfExperience: z.number().min(0),
});

const languageDto = z.object({
  name:        z.string().min(1),
  proficiency: z.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
});

const experienceDto = z.object({
  company:      z.string().min(1),
  role:         z.string().min(1),
  startDate:    z.string().min(1),
  endDate:      z.string().optional(),
  description:  z.string().min(1),
  technologies: z.array(z.string()).default([]),
  isCurrent:    z.boolean().default(false),
});

const educationDto = z.object({
  institution:  z.string().min(1),
  degree:       z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startYear:    z.number(),
  endYear:      z.number().optional(),
});

const certificationDto = z.object({
  name:      z.string().min(1),
  issuer:    z.string().min(1),
  issueDate: z.string().min(1),
});

const projectDto = z.object({
  name:         z.string().min(1),
  description:  z.string().min(1),
  technologies: z.array(z.string()).default([]),
  role:         z.string().min(1),
  link:         z.url().optional(),
  startDate:    z.string().min(1),
  endDate:      z.string().optional(),
});

const availabilityDto = z.object({
  status:    z.enum(['Available', 'Open to Opportunities', 'Not Available']),
  type:      z.enum(['Full-time', 'Part-time', 'Contract']),
  startDate: z.string().optional(),
});

const socialLinksDto = z.object({
  linkedin:  z.url().optional(),
  github:    z.url().optional(),
  portfolio: z.url().optional(),
}).catchall(z.string());

const candidateFields = {
  firstName:      z.string().min(1, 'First name is required'),
  lastName:       z.string().min(1, 'Last name is required'),
  email:          z.email('Invalid email address'),
  headline:       z.string().min(1, 'Headline is required'),
  bio:            z.string().optional(),
  location:       z.string().min(1, 'Location is required'),
  skills:         z.array(skillDto).default([]),
  languages:      z.array(languageDto).default([]),
  experience:     z.array(experienceDto).default([]),
  education:      z.array(educationDto).default([]),
  certifications: z.array(certificationDto).default([]),
  projects:       z.array(projectDto).default([]),
  availability:   availabilityDto,
  socialLinks:    socialLinksDto.optional(),
};

const candidateBaseDto = z.object(candidateFields);

export const ingestCandidateDto = candidateBaseDto;

export const createCandidateDto = ingestCandidateDto.superRefine((data, ctx) => {
  if (data.skills.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one skill is required',
      path: ['skills'],
    });
  }

  if (data.experience.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one experience entry is required',
      path: ['experience'],
    });
  }

  if (data.education.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one education entry is required',
      path: ['education'],
    });
  }

  if (data.projects.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one project is required',
      path: ['projects'],
    });
  }
});

export const updateCandidateDto = candidateBaseDto.partial();

export type CreateCandidateDto = z.infer<typeof createCandidateDto>;
export type UpdateCandidateDto = z.infer<typeof updateCandidateDto>;
export type IngestCandidateDto = z.infer<typeof ingestCandidateDto>;
