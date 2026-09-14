"use client";

import { useState } from "react";

interface ArticleHeroProps {
  src?: string | null;
  alt?: string;
}

function isValidHeroSrc(src: unknown): src is string {
  if (typeof src !== "string") return false;
  const clean = src.trim();
  if (!clean || clean === "null" || clean === "undefined") return false;
  if (!/^https?:\/\//i.test(clean) && !clean.startsWith("/")) return false;
  return true;
}

/**
 * Editorial medium-sized article hero image.
 *
 * Designed to enhance the article header without dominating the whole viewport.
 * Handling is strictly optional:
 * - Returns null if src is omitted, empty, null, undefined, or invalid.
 * - If the image encounters a 404 or network error, state hides the container
 *   completely so the page opens naturally without broken frames or empty space.
 */
export function ArticleHero({ src, alt = "" }: ArticleHeroProps) {
  const [failed, setFailed] = useState(false);

  if (!isValidHeroSrc(src) || failed) {
    return null;
  }

  return (
    <div className="article-hero" data-has-hero="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src.trim()}
        alt={alt}
        loading="eager"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
