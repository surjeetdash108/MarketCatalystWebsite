import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const seoSchema = z.object({
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(200).optional().or(z.literal("")),
  ogImageUrl: z.string().trim().url().optional().or(z.literal("")),
  canonicalUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugPattern, "Slug must be lowercase, alphanumeric, hyphen-separated"),
  excerpt: z.string().trim().max(400).optional().or(z.literal("")),
  content: z.string().max(200_000),
  type: z.enum(["stock", "featured", "educational", "market"]).default("featured"),
  categories: z.array(z.string().trim().max(60)).max(20).default([]),
  tags: z.array(z.string().trim().max(60)).max(30).default([]),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  seo: seoSchema.optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().trim().min(1),
});

export const publishPostSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["draft", "published"]),
});

export const deletePostSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
