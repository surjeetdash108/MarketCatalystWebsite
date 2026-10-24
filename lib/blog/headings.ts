/**
 * Keeps an article to one <h1>.
 *
 * The article page prints the post's title as the <h1> unless the post's own
 * markup already has one (see `hasOwnHeadline` in app/posts/[slug]/page.tsx).
 * Posts that carry a second one in their body (a markdown `# Heading`, or an
 * uploaded design with two) ended up with two <h1>s, which blurs what the page
 * is about. This renames the surplus ones to <h2>, opening and closing tags
 * together.
 *
 * `keepFirst`: true when the post's own first <h1> IS the page's headline (the
 * site printed none), so only the ones after it are demoted; false when the site
 * already printed the title, so every <h1> in the body is demoted.
 *
 * A demoted heading keeps its classes and ids, but a stylesheet rule written
 * against the bare `h1` selector no longer matches it. That is the visible cost,
 * and it only applies to posts that had a second <h1> to begin with.
 */
export function demoteH1(html: string, keepFirst: boolean): string {
  let opened = -1;
  return html.replace(/<(\/?)h1\b/gi, (match, slash: string) => {
    // A closing tag belongs to the most recent opening one.
    if (!slash) opened += 1;
    const demote = keepFirst ? opened >= 1 : true;
    return demote ? `<${slash}h2` : match;
  });
}
