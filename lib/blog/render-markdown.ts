import { marked } from "marked";
import { sanitizePostHtml } from "@/lib/security/sanitize";

// The single authoritative path from stored Markdown to displayed HTML —
// every place that renders post content (public blog pages; an admin
// preview, if one is added later) must go through this function rather
// than calling `marked` or `dangerouslySetInnerHTML` directly. `marked`
// passes through raw HTML embedded in Markdown source by default (GFM
// allows it), so the sanitize-html allowlist pass afterward is what
// actually blocks stored XSS from a compromised/malicious editor account —
// not the Markdown parsing step itself.
export function renderPostContent(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  return sanitizePostHtml(html);
}
