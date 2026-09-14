import "./loading.css";

/**
 * Route-level loading UI for a blog post.
 *
 * The page is a dynamic server component — it reads `searchParams.slug` and
 * resolves the post from Firestore on every request, with no ISR — so there is
 * a real wait before any markup arrives. Next renders this as the Suspense
 * fallback while that work happens, which turns a blank white page into
 * something that shows the request is alive.
 *
 * Shaped like the article it is replacing (same max-width, same padding, a
 * title-sized bar then body lines) so the content does not appear to jump when
 * it swaps in.
 */
export default function Loading() {
  return (
    <div
      className="flex flex-col gap-4"
      style={{ maxWidth: 840, margin: "0 auto", padding: "28px 24px 80px" }}
      role="status"
      aria-live="polite"
      aria-label="Loading article"
    >
      <div className="postSkeleton">
        <div className="postSpinner" aria-hidden="true" />
        <span className="postLoadingText">Loading article…</span>
      </div>

      {/* Skeleton in the article's own proportions. aria-hidden: the status
          text above already announces the state to a screen reader. */}
      <div className="postSkeletonBody" aria-hidden="true">
        <div className="skLine skTitle" />
        <div className="skLine skSub" />
        <div className="skLine" />
        <div className="skLine" />
        <div className="skLine short" />
        <div className="skLine" />
        <div className="skLine short" />
      </div>
    </div>
  );
}
