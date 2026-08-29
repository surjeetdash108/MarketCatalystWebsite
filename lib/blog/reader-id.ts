/**
 * A per-browser reader identity for the public blog.
 *
 * /posts has no sign-in, so this is what "each user" can honestly mean here:
 * an id this browser generated for itself and keeps in localStorage. It is not
 * an account, carries nothing about the person, and is thrown away with the
 * browser's storage — enough to hand a reader back their own sections, and not
 * enough to identify them.
 *
 * Deliberately not a cookie: a cookie would travel on every request to the
 * site, including ones that have nothing to do with the blog.
 */
const KEY = "mc-blog-reader";

export function readerId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    // Private browsing, or storage disabled. The blog works without a history;
    // it simply does not remember this reader.
    return null;
  }
}
