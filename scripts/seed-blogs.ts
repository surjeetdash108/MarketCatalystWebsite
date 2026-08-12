/**
 * One-shot seed of the static/demo blog content into the `blogs` Firestore
 * collection so the public board (/posts) and the admin panel (/admin/posts)
 * have real data to render. Idempotent: each blog has a stable doc id
 * (`blog-01` … `blog-NN`), so re-running updates in place instead of creating
 * duplicates.
 *
 * Content mirrors the approved "MarketCatalyst blog" reference board, grouped
 * by `type`: stock (Stock 101), featured (Featured), educational
 * (Educational 101), market (Market 101). Every doc is `status: "published"`,
 * so it appears on the public site immediately.
 *
 * Usage:
 *   npm run seed:blogs -- --project=market-catalyst-502415
 *
 * Auth mirrors seed-faqs.ts: ADC (`gcloud auth application-default login`) or
 * FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY for local cert-based auth.
 *
 * Self-contained (does not import lib/blog or lib/firebase/admin) — those use
 * the `server-only` marker, which throws outside Next's bundler.
 */
import { getApps, getApp, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

const SEED_AUTHOR = "seed-script";

type BlogType = "stock" | "featured" | "educational" | "market";

interface SeedBlog {
  type: BlogType;
  title: string;
  excerpt: string;
  /** ISO date used for publishedAt/createdAt so the board orders sensibly. */
  date: string;
  /** Extra body paragraphs (markdown) after the excerpt lead. */
  body: string[];
}

const BLOGS: SeedBlog[] = [
  // ── Stock 101 ─────────────────────────────────────────────────────────────
  {
    type: "stock", date: "2026-08-08",
    title: "Salesforce: three upgrades in a week",
    excerpt: "A cluster of upgrades usually front-runs a sentiment shift.",
    body: [
      "When three sell-side desks move in the same direction inside five trading days, the signal is rarely the price target itself — it is the change in the *narrative* the target is attached to.",
      "The common thread across the notes is margin durability: each desk raised its out-year operating-margin assumption rather than its revenue line. That is the more defensible kind of upgrade, and it tends to hold through the next print.",
      "Watch whether the stock can hold the gap it opened on the third upgrade. A cluster that fades within a week is noise; one that consolidates is a re-rating.",
    ],
  },
  {
    type: "stock", date: "2026-08-07",
    title: "Apple services margin quietly sets a record",
    excerpt: "The hardware story gets the headlines; services pays the bills.",
    body: [
      "Unit shipments are what the tape reacts to, but the services gross margin is what compounds. This quarter it set a fresh high, and almost nobody on the call asked about it.",
      "The mix shift matters more than the absolute number: every incremental services dollar carries roughly double the margin of a hardware dollar, so the blended figure drifts up even when devices are flat.",
    ],
  },
  {
    type: "stock", date: "2026-08-06",
    title: "What the loan-loss provision is telling you",
    excerpt: "Provisions are a forecast dressed up as an accounting entry.",
    body: [
      "A provision is management's view of future credit losses, booked today. Read the *direction* of the change, not the level: a build signals caution, a release signals confidence.",
      "The tell this cycle is that provisions rose while charge-offs stayed low — banks are pre-funding a slowdown they cannot yet see in the data.",
    ],
  },
  {
    type: "stock", date: "2026-08-10",
    title: "Q2 delivery review",
    excerpt: "A quick read of the quarter's delivery numbers and what they imply for the back half.",
    body: [
      "Deliveries came in a shade ahead of the whisper, but the mix skewed to the lower-priced trims, which is why the revenue line lagged the unit line.",
      "Guidance was reiterated, not raised — a sign management wants the option to beat rather than the risk of a miss.",
    ],
  },

  // ── Featured ────────────────────────────────────────────────────────────
  {
    type: "featured", date: "2026-08-10",
    title: "Nvidia's guidance raise rewires the AI trade",
    excerpt: "The beat was expected. The raised outlook was not, and that is the part worth reading closely.",
    body: [
      "Consensus had already priced a beat, so the print itself was a non-event. The surprise was the forward guide, which moved the next-quarter revenue bar up by high-single digits and reset the whole supply-chain conversation with it.",
      "The read-through runs downstream: every hyperscaler capex assumption now has to be marked higher, which is why the memory and networking names rallied alongside.",
      "The risk is that the guide bakes in a level of data-center demand that leaves no room for a single quarter of digestion. This is a story to hold, not to chase on the gap.",
    ],
  },
  {
    type: "featured", date: "2026-08-09",
    title: "The rate-cut trade is crowded again",
    excerpt: "Positioning has run ahead of the data twice this year.",
    body: [
      "The rates market is pricing more easing than the data supports, and positioning surveys show the consensus is once again leaning the same way.",
      "That does not make it wrong — it makes it fragile. A single firm inflation print unwinds a crowded trade faster than it was built.",
    ],
  },
  {
    type: "featured", date: "2026-08-05",
    title: "Why defensives stopped acting defensive",
    excerpt: "Rates explain most of it.",
    body: [
      "Utilities and staples are supposed to cushion a drawdown. This year they sold off with everything else, and the reason is duration: with yields elevated, a bond-proxy equity trades like the bond, not the equity.",
      "Until the back end of the curve settles, the classic defensive rotation will keep misfiring.",
    ],
  },

  // ── Educational 101 ───────────────────────────────────────────────────────
  {
    type: "educational", date: "2026-08-08",
    title: "What is Relative Strength (RS) rank?",
    excerpt: "A 1–99 score for how a stock performs against the market.",
    body: [
      "RS rank is a percentile: a reading of 90 means the stock has outperformed 90% of the market over the lookback window. It measures *relative* price performance, nothing else.",
      "Use it as a filter, not a thesis. A high RS tells you the market already likes the name; it says nothing about why, or whether the move is sustainable.",
    ],
  },
  {
    type: "educational", date: "2026-08-06",
    title: "Read an earnings report in five minutes",
    excerpt: "The four lines that matter, and the noise you can skip.",
    body: [
      "Start with revenue versus guide, then gross margin, then operating cash flow, then the forward outlook. Those four lines carry most of the information.",
      "Everything else — adjusted this, one-time that — is context you can read later. The market trades the guide first and the quarter second.",
    ],
  },
  {
    type: "educational", date: "2026-08-03",
    title: "Market cap, enterprise value, and which to use",
    excerpt: "They answer different questions.",
    body: [
      "Market cap is what the equity is worth. Enterprise value adds net debt, so it is what it would cost to buy the whole business.",
      "Use market cap for per-share valuation, enterprise value for comparing companies with different capital structures — an EV/EBITDA multiple is apples-to-apples where a P/E is not.",
    ],
  },
  {
    type: "educational", date: "2026-08-10",
    title: "Candlestick basics",
    excerpt: "What a candle actually encodes, and the two or three patterns worth knowing.",
    body: [
      "Each candle is four numbers — open, high, low, close — drawn as a body and two wicks. The body shows the session's net move; the wicks show the range it was rejected from.",
      "Ignore the exotic pattern names. A long lower wick after a downtrend and an engulfing body at a level are the two setups that carry real information.",
    ],
  },

  // ── Market 101 ────────────────────────────────────────────────────────────
  {
    type: "market", date: "2026-08-12",
    title: "Cooler CPI sends stocks to record highs",
    excerpt: "Softer inflation revived rate-cut bets across the curve.",
    body: ["The core reading came in a tenth below consensus, and the reaction was immediate: the front end repriced, the dollar softened, and equities took out prior highs into the close."],
  },
  {
    type: "market", date: "2026-08-11",
    title: "Semis lead as AI capex guidance climbs",
    excerpt: "Chip names paced the tape for a third session.",
    body: ["The leadership is narrow but powerful — a handful of large-cap semis are doing most of the index's work as capex guidance keeps drifting higher."],
  },
  {
    type: "market", date: "2026-08-11",
    title: "Two-year yield slips below 4%",
    excerpt: "The short end moved first, as it usually does.",
    body: ["The two-year leads the easing conversation, and it just broke a round number. The long end is lagging, steepening the curve."],
  },
  {
    type: "market", date: "2026-08-10",
    title: "Retailers flag a cautious consumer",
    excerpt: "Three of four majors trimmed their outlook.",
    body: ["The guide-downs clustered around the same theme: the low-end consumer is trading down, and the trend accelerated into quarter-end."],
  },
  {
    type: "market", date: "2026-08-09",
    title: "Crude holds range despite supply headlines",
    excerpt: "The market has stopped reacting to announcements alone.",
    body: ["Another supply headline, another muted move. When a market stops reacting to its own catalysts, positioning — not news — is in control."],
  },
  {
    type: "market", date: "2026-08-08",
    title: "Dollar softens on narrowing rate differentials",
    excerpt: "The move tracked the rates story almost exactly.",
    body: ["The dollar is trading as a pure rate-differential story right now: as the market prices more domestic easing, the currency gives back its carry premium."],
  },
  {
    type: "market", date: "2026-08-07",
    title: "Banks lead as the curve steepens",
    excerpt: "Net interest margin guidance did the talking.",
    body: ["A steeper curve is a tailwind for net interest margins, and the banks' guidance leaned into it. The group led the tape for the session."],
  },
  {
    type: "market", date: "2026-08-06",
    title: "Gold sets a fresh high on real-rate relief",
    excerpt: "Positioning was already long going in.",
    body: ["Falling real rates lifted gold to a new high, though the crowded long positioning going in leaves it exposed to a sharp unwind on any data surprise."],
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function contentMarkdown(b: SeedBlog): string {
  return [b.excerpt, ...b.body].join("\n\n");
}

async function main() {
  const projectId =
    parseArg("project") ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error("Set --project=<id> or FIREBASE_PROJECT_ID");
  }

  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    initializeApp({
      credential:
        clientEmail && privateKey
          ? cert({ projectId, clientEmail, privateKey })
          : applicationDefault(),
      projectId,
    });
  } else {
    getApp();
  }

  const db = getFirestore();
  const batch = db.batch();

  BLOGS.forEach((b, i) => {
    const id = `blog-${String(i + 1).padStart(2, "0")}`;
    const at = Timestamp.fromDate(new Date(`${b.date}T14:00:00Z`));
    const ref = db.collection("blogs").doc(id);
    batch.set(ref, {
      title: b.title,
      slug: slugify(b.title),
      excerpt: b.excerpt,
      content: contentMarkdown(b),
      status: "published",
      type: b.type,
      authorId: SEED_AUTHOR,
      editorId: SEED_AUTHOR,
      categories: [b.type],
      tags: [],
      coverImageUrl: null,
      seo: { metaTitle: null, metaDescription: null, ogImageUrl: null, canonicalUrl: null },
      publishedAt: at,
      createdAt: at,
      updatedAt: at,
    });
  });

  await batch.commit();
  console.log(`Seeded ${BLOGS.length} blogs into 'blogs' (project ${projectId}).`);
  const counts = BLOGS.reduce<Record<string, number>>((m, b) => ((m[b.type] = (m[b.type] || 0) + 1), m), {});
  console.log("By type:", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
