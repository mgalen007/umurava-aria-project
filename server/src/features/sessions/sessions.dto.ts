import { z } from "zod";

export const createSessionDto = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  name: z.string().min(3, "Session name must be at least 3 characters"),
  candidateIds: z
    .array(
      z
        .string({ error: "Candidate ID is required" })
        .trim()
        .min(1, "Candidate ID is required")
    )
    .min(1, "At least one candidate is required")
    .refine(
      (candidateIds) => new Set(candidateIds).size === candidateIds.length,
      {
        message: "Candidate IDs must be unique",
      },
    ),
  modelUsed: z
    .enum(["gemini-2.5-flash-lite", "gemini-1.5-pro"])
    .default("gemini-2.5-flash-lite"),
});

export const feedbackDto = z
  .object({
    candidateId: z.string().min(1, "Candidate ID is required"),
    action: z.enum(["approved", "overridden", "disqualified"]),
    adjustedScore: z.number().min(0).max(100).optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => data.action !== "overridden" || data.adjustedScore !== undefined,
    {
      message: "Adjusted score is required when action is overridden",
      path: ["adjustedScore"],
    },
  );

export type CreateSessionDto = z.infer<typeof createSessionDto>;
export type FeedbackDto = z.infer<typeof feedbackDto>;
