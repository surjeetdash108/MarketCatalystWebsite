import { z } from "zod";

// Message is expected to be plain text from a public contact form — if it
// looks like it contains markup, reject rather than try to sanitize it,
// since a contact message has no legitimate reason to contain HTML.
const noHtmlLike = (value: string) => !/<[a-z][\s\S]*>/i.test(value);

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000)
    .refine(noHtmlLike, "Message must be plain text"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
