import sanitizeHtml from "sanitize-html";

// Applied at write time (before a post's rendered HTML is stored/derived)
// AND again at render time immediately before any dangerouslySetInnerHTML
// use on the public blog — defense in depth against stored XSS from a
// compromised or malicious editor account, and against any write path that
// bypassed the primary sanitization step.
const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "strong", "em", "a", "ul", "ol", "li",
  "blockquote", "img", "code", "pre", "br", "hr", "span",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "rel", "target"],
  img: ["src", "alt"],
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}
