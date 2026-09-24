"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { FeatureGroup, FeatureView } from "@/lib/features/features";
import { FEATURE_GROUPS } from "@/lib/features/features";

/**
 * The filterable grid of workspace cards on the /features index.
 *
 * A client component for the same reason FaqBoard is one: the filtering is
 * instant and in-memory, so there is no page to reload and no endpoint to
 * call. The AI layer above it is not filterable and stays server-rendered in
 * app/features/page.tsx — only the workspace grid needs state.
 */
export function FeatureBoard({ features }: { features: FeatureView[] }) {
  const [group, setGroup] = useState<"All" | FeatureGroup>("All");

  const counts = useMemo(() => {
    const c = new Map<string, number>();
    for (const f of features) c.set(f.group, (c.get(f.group) ?? 0) + 1);
    return c;
  }, [features]);

  const shown = useMemo(
    () => (group === "All" ? features : features.filter((f) => f.group === group)),
    [features, group],
  );

  const chips: { label: string; value: "All" | FeatureGroup; count: number }[] = [
    { label: "All", value: "All", count: features.length },
    ...FEATURE_GROUPS.map((g) => ({ label: g, value: g, count: counts.get(g) ?? 0 })),
  ];

  return (
    <div>
      <div className="mcf-chips mc-rev mc-rev-sm">
        {chips.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`mcf-chip${group === c.value ? " is-active" : ""}`}
            onClick={() => setGroup(c.value)}
            aria-pressed={group === c.value}
          >
            {c.label} <span className="mcf-chip-n">{c.count}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mcf-empty mc-rev mc-rev-sm">Nothing in this group yet.</div>
      ) : (
        <div className="mcf-grid mc-rev mc-rev-sm">
          {shown.map((f) => (
            <Link key={f.slug} href={f.href} className="mcf-card">
              <div className="mcf-card-top">
                <span>{f.group}</span>
                {f.num && <span>{f.num}</span>}
              </div>
              <div className="mcf-card-title">{f.title}</div>
              <p className="mcf-card-blurb">{f.blurb}</p>
              <span className="mcf-card-go">Explore →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
