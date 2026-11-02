import { shortenSlug } from "../seo/shorten";

// Pure string utility — safe to import from both client and server code.
// A long headline gets a slug cut between words at MAX_SLUG_CHARS: a slug over
// ~83 characters makes a URL over the audit's 115-character limit.
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return shortenSlug(slug);
}
