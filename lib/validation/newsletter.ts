import { z } from "zod";

export const newsletterSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(320),
  /** Where the signup came from (e.g. "posts"), for the subscriber list. */
  source: z.string().trim().max(40).regex(/^[a-z0-9-]*$/).optional(),
});

export type NewsletterSignupInput = z.infer<typeof newsletterSignupSchema>;
