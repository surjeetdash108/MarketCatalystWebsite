/**
 * The blog's five sections and the URLs of its listing pages.
 *
 * Shared by the server (app/posts/page.tsx reads ?section= and ?page= to render
 * and canonicalise the right page) and the client board (BlogIndex draws the
 * filter pills and pager as real links to these same URLs). No "use client"
 * and no imports: both sides load it.
 */

export type Section = "Recap" | "Analysis" | "Educational" | "News" | "Earnings";
export const SECTIONS: Section[] = ["Recap", "Analysis", "Educational", "News", "Earnings"];

/** Cards per listing page. */
export const PER_PAGE = 6;

/** Post.type is the stored zone; the board names them differently. */
export const SECTION_OF: Record<string, Section> = {
  recap: "Recap",
  research: "Analysis",
  educational: "Educational",
  news: "News",
  earnings: "Earnings",
};

export function sectionOfType(type: string): Section {
  return SECTION_OF[type] ?? "Educational";
}

/** `?section=` value for a section: "Recap" -> "recap". */
export function sectionSlug(section: Section): string {
  return section.toLowerCase();
}

/** The section a `?section=` value names, or undefined for anything else. */
export function sectionFromSlug(value: string | undefined): Section | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase();
  return SECTIONS.find((s) => sectionSlug(s) === v);
}

/**
 * The listing URL for a section and page. Page 1 and "all" are left out so each
 * view has exactly one URL ("/posts", not "/posts?page=1").
 */
export function postsHref(section: Section | "all", page: number): string {
  const params: string[] = [];
  if (section !== "all") params.push(`section=${sectionSlug(section)}`);
  if (page > 1) params.push(`page=${page}`);
  return params.length ? `/posts?${params.join("&")}` : "/posts";
}
