import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { FEATURE_VIEWS, getFeatureView, prevNextFeature } from "@/lib/features/features";
import "../../pages.css";
import "../../features.css";

// Fully static — the feature list is authored content, not Firestore data —
// so every slug below is built once and served from the edge.
export async function generateStaticParams() {
  return FEATURE_VIEWS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const f = getFeatureView(slug);
  if (!f) return {};
  return {
    title: `${f.title} — MarketCatalyst Features`,
    description: f.blurb,
    alternates: { canonical: `/features/${f.slug}` },
  };
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = getFeatureView(slug);
  if (!f) notFound();
  const nav = prevNextFeature(slug)!;
  const groupLabel = f.group === "AI" ? "AI layer" : f.group;

  return (
    <ReaderShell active="features">
      <main className="mc-article">
        <section className="mcf-detail-sec">
          <div className="mcp-inner">
            <div className="mcf-crumb mc-rev mc-rev-sm">
              <Link href="/features">← Features</Link>
              <span>/</span>
              <span>{groupLabel}</span>
              <span>/</span>
              <span>{f.title}</span>
            </div>

            <div className="mcf-head mc-rev mc-rev-sm">
              <div>
                <div className="mcp-kicker">
                  <i />
                  <span>{f.num ? `${groupLabel} · ${f.num}` : groupLabel}</span>
                </div>
                <h1 className="mcp-h1" style={{ marginTop: 18 }}>
                  {f.title}
                </h1>
              </div>
              <p className="mcf-head-lede">{f.lede}</p>
            </div>

            <div className="mcf-body mc-rev mc-rev-sm">
              <div className="mcf-points-card">
                <span className="mcf-panel-k">What you get</span>
                <div className="mcf-points">
                  {f.points.map((p, i) => (
                    <div className="mcf-point" key={p}>
                      <span className="mcf-point-n">{String(i + 1).padStart(2, "0")}</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mcf-ai-panel">
                <span className="mcf-panel-k">◆ AI read</span>
                <div className="mcf-ai-quote">
                  <i />
                  <p>&ldquo;{f.ai}&rdquo;</p>
                </div>
                <a className="mcp-cta" href={APP_SIGNUP_URL}>
                  Open {f.title} <i>→</i>
                </a>
              </div>
            </div>

            <div className="mcf-pager mc-rev mc-rev-sm">
              <Link href={nav.prev.href} className="mcf-pager-card">
                <span className="mcf-pager-k">← Previous</span>
                <span className="mcf-pager-t">{nav.prev.title}</span>
              </Link>
              <Link href={nav.next.href} className="mcf-pager-card mcf-pager-next">
                <span className="mcf-pager-k">Next →</span>
                <span className="mcf-pager-t">{nav.next.title}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ReaderShell>
  );
}
