/**
 * One-shot seed of the public FAQ content into the `faqs` Firestore
 * collection, so the admin doesn't have to hand-enter each entry. Idempotent:
 * each FAQ has a stable doc id (`faq-01` … `faq-NN`), so re-running updates in
 * place instead of creating duplicates. `createdAt` is spaced one second apart
 * per item so getPublicFaqs()'s `orderBy("createdAt","asc")` renders them in
 * the intended order.
 *
 * Usage:
 *   npm run seed:faqs -- --project=market-catalyst-502415
 *
 * Auth mirrors seed-admin.ts: ADC (`gcloud auth application-default login`) or
 * FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY for local cert-based auth.
 *
 * Self-contained (does not import lib/faq or lib/firebase/admin) — those use
 * the `server-only` marker, which throws outside Next's bundler.
 */
import { getApps, getApp, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

const SEED_AUTHOR = "seed-script";

// Ordered exactly as the source FAQ. Categories from the source doc are folded
// into a single sequence (the collection schema has no category field).
const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is MarketCatalyst?",
    answer:
      "MarketCatalyst is an AI-powered market intelligence terminal that gathers the day's most important market information — news, earnings, sector moves, analyst actions, options data, insider activity and more — and organizes it into a single, fast-to-scan workspace. It is designed to help you understand what is driving the market at any moment.",
  },
  {
    question: "Is MarketCatalyst a stock-picking or alert service?",
    answer:
      "No. MarketCatalyst is a data provider, not a stock-picks or alert service. It is not a registered investment advisor and does not manage client assets. Every feature is for informational and educational purposes only and does not constitute investment advice.",
  },
  {
    question: "Do I need trading experience to use it?",
    answer:
      "No. The dashboard is built to be readable at a glance, and each section includes plain-language AI summaries. More advanced tools such as the options chain and the technical screener are available when you want them, but you are never required to use them.",
  },
  {
    question: "How current is the data?",
    answer:
      'The top-line index strip and most panels reflect live or end-of-day market data, and the "What Matters Now" digest refreshes on a rolling basis throughout the trading day. Some panels display a data-source label (for example "live · Polygon") indicating where the numbers come from.',
  },
  {
    question: "Can I switch between light and dark mode?",
    answer:
      "Yes. Use the theme toggle in the top navigation bar to switch between light and dark appearance.",
  },
  {
    question: 'What is "What Matters Now"?',
    answer:
      "It is an AI-curated digest on the dashboard that ranks and explains the day's most consequential developments and refreshes continuously. A 30-second audio version is available if you prefer to listen.",
  },
  {
    question: "What does the Earnings Hub show?",
    answer:
      'It presents an earnings calendar organized by day and by before-open / after-close timing, plus per-company detail including EPS estimate versus actual, guidance, the stock\'s reaction, a 10-quarter earnings history, and an income statement, with an AI "earnings read" summarizing the print.',
  },
  {
    question: 'What is the Screener and what is "RS"?',
    answer:
      'The Screener lets you filter the market using presets or custom criteria across relative strength, growth, technical rating, and liquidity/market cap. "RS" is a relative-strength rank (roughly 1–99) that compares a stock\'s price performance to the broader market — higher means stronger relative performance.',
  },
  {
    question: "What are Themes?",
    answer:
      "Themes are curated baskets of related stocks — for example Magnificent Seven, AI & Semiconductors, Software & Cloud, Fintech, and Deep Value — each with an AI summary highlighting the day's leaders, laggards, and momentum.",
  },
  {
    question: "Does the Options section show real-time quotes?",
    answer:
      "The options chain is an educational tool for exploring calls and puts across strikes and expirations, including open interest, volume, and implied volatility. Some option figures are illustrative/simulated for demonstration; always confirm live pricing with your broker before trading.",
  },
  {
    question: "What is the Fear & Greed index and the VIX gauge?",
    answer:
      'Both are sentiment indicators. The Fear & Greed reading summarizes overall market mood on a simple scale, while the VIX gauge reflects expected volatility. The Macro & VIX page adds a daily "market regime" read (for example Risk-On Rally) derived from breadth, yields, and sector rotation.',
  },
  {
    question: "How do I track my own holdings?",
    answer:
      'Open Portfolio Pulse and add holdings manually with "Add holding," or use "Import from photo." You will then see an AI summary of your day\'s drivers, leaders, and laggards, plus full analysis for each position.',
  },
  {
    question: "Is a Watchlist different from a Portfolio?",
    answer:
      "Yes. A Watchlist tracks stocks you want to monitor without owning them, while Portfolio Pulse tracks positions you actually hold, including day P/L.",
  },
  {
    question: "Are the Recaps downloadable?",
    answer:
      "Yes. The Recaps page offers structured end-of-day and weekly executive summaries as downloadable PDFs, along with a 60-second audio recap.",
  },
  {
    question: "Does MarketCatalyst tell me what to buy or sell?",
    answer:
      "No. All ratings, technical readings, and summaries are informational only. Trading decisions are always yours, and trading carries risk — consult your own financial advisor.",
  },
  {
    question: "Where can I learn how each tool works?",
    answer:
      "See the How-To Guides, which walk through every page of the terminal step by step.",
  },
];

function initAdminApp(projectId: string) {
  if (getApps().length) return getApp();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
  return initializeApp({ credential: applicationDefault(), projectId });
}

async function main() {
  const project = parseArg("project") ?? process.env.GOOGLE_CLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;
  if (!project) {
    console.error("Missing --project=<firebase-project-id>. Refusing to guess.");
    process.exit(1);
  }

  const db = getFirestore(initAdminApp(project));
  const base = Date.now();

  console.log(`Seeding ${FAQS.length} FAQ(s) into "faqs" in project ${project}…`);
  let n = 0;
  for (const [i, faq] of FAQS.entries()) {
    const id = `faq-${String(i + 1).padStart(2, "0")}`;
    const ts = Timestamp.fromMillis(base + i * 1000);
    await db
      .collection("faqs")
      .doc(id)
      .set({
        question: faq.question,
        answer: faq.answer,
        authorId: SEED_AUTHOR,
        editorId: SEED_AUTHOR,
        createdAt: ts,
        updatedAt: ts,
      });
    n++;
    console.log(`  ✓ ${id}  ${faq.question}`);
  }
  console.log(`Done. ${n} FAQ(s) written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
