import fallback from "./catalog.json";
import { APP_URL } from "@/components/marketing/app-url";

/**
 * Plan prices for the pricing tiles. Source of truth: the backend catalog
 * (GET /plans). lib/pricing/catalog.json is generated from the same registry
 * (MarketCatalystBackEnd/scripts/export-catalog.ts) and used only when the
 * live catalog is unreachable or incomplete, so the page always renders.
 */
export type Interval = "monthly" | "annual";
export interface CatalogPlan {
  id: string;
  name: string;
  prices: Partial<Record<Interval, { amount: number; lookupKey: string }>>;
}

export const TILE_PLANS = ["starter", "pro", "elite"] as const;
export const CATALOG_URL = process.env.CATALOG_URL ?? `${APP_URL}/plans`;

/** True when every tile plan has both a monthly and an annual price. */
export function isCompleteCatalog(plans: CatalogPlan[] | undefined): plans is CatalogPlan[] {
  return Array.isArray(plans) && TILE_PLANS.every((id) => {
    const p = plans.find((x) => x.id === id);
    return !!p?.prices?.monthly?.amount && !!p?.prices?.annual?.amount;
  });
}

export function fallbackCatalog(): CatalogPlan[] {
  return (fallback as { plans: CatalogPlan[] }).plans;
}

export async function loadCatalog(fetchImpl: typeof fetch = fetch): Promise<{ plans: CatalogPlan[]; source: "live" | "fallback" }> {
  try {
    const res = await fetchImpl(CATALOG_URL, { signal: AbortSignal.timeout(3000), next: { revalidate: 3600 } } as RequestInit);
    if (res.ok) {
      const body = (await res.json()) as { plans?: CatalogPlan[] };
      if (isCompleteCatalog(body.plans)) return { plans: body.plans, source: "live" };
    }
  } catch {
    /* fall through to the bundled copy */
  }
  return { plans: fallbackCatalog(), source: "fallback" };
}

/** "$39", "$31.20", "$1,791". */
export function money(amountMinor: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2 }).format(amountMinor / 100);
}

/** Fills {{PRICE:<plan>:monthly|annual|annual_per_month}} and {{SAVE:<plan>|max}} tokens. */
export function fillPriceTokens(html: string, plans: CatalogPlan[]): string {
  const save = (id: string) => {
    const p = plans.find((x) => x.id === id);
    const m = p?.prices.monthly?.amount ?? 0;
    const a = p?.prices.annual?.amount ?? 0;
    return m ? Math.round((1 - a / (m * 12)) * 100) : 0;
  };
  const out = html
    .replace(/\{\{PRICE:([a-z]+):(monthly|annual|annual_per_month)\}\}/g, (_t, id: string, kind: string) => {
      const p = plans.find((x) => x.id === id);
      if (!p) throw new Error(`pricing tile for unknown plan ${id}`);
      if (kind === "monthly") return money(p.prices.monthly!.amount);
      if (kind === "annual") return money(p.prices.annual!.amount);
      return money(Math.round(p.prices.annual!.amount / 12));
    })
    .replace(/\{\{SAVE:([a-z]+)\}\}/g, (_t, id: string) => String(id === "max" ? Math.max(...TILE_PLANS.map(save)) : save(id)));
  if (/\{\{(PRICE|SAVE):/.test(out)) throw new Error("unfilled pricing token");
  return out;
}
