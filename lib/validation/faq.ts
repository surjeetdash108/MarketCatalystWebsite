import { z } from "zod";

// A FAQ is deliberately just two text fields: question + answer.
export const createFaqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(500),
  answer: z.string().trim().min(1, "Answer is required").max(5000),
});

export const updateFaqSchema = createFaqSchema.partial().extend({
  id: z.string().trim().min(1),
});

export const deleteFaqSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
