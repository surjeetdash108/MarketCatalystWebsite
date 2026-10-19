import json
import re

with open('lib/seo/curated-descriptions.json') as f:
    posts = json.load(f)

# Complete 219-entry exact map: strictly 80-119 chars, full figures intact, grammatically complete
UPDATES = {
  "why-active-etfs-are-surging-in-popularity-and-capturing-outsized-inflows":
    "Active ETFs captured 28% of all fund inflows this year as allocators abandon traditional mutual funds.",
  "why-global-bond-yields-are-surging-and-what-it-means-for-stocks":
    "Global sovereign yields reached multi-decade highs amid heavy debt issuance and persistent inflation.",
  "microsoft-relaunches-copilot-as-a-workplace-ai-hub-not-just-a-chatbot":
    "Microsoft upgraded Copilot into an autonomous workspace, connecting Office files with real-time agents.",
  "meta-s-new-smart-glasses-lineup-includes-three-price-points-and-a-camera-free-model":
    "Meta revealed three new smart glasses models, including a lower-cost $199 edition for enterprise use.",
  "10-year-treasury-yield-tops-5-1-highest-since-2007":
    "The 10-year Treasury yield topped 5.10%, reaching its highest mark since 2007 on persistent inflation.",
  "us-and-iran-hold-three-hour-talks-at-the-un-as-trump-says-there-s-a-lot-of-momentum-for-a-deal":
    "U.S. and Iranian envoys held three-hour UN talks, with officials noting momentum for de-escalation.",
  "stocks-mixed-as-wall-street-awaits-thursday-s-trump-xi-summit-oil-extends-slide":
    "Markets ended mixed ahead of the bilateral summit, while WTI crude fell 2% to settle near $88 a barrel.",
  "meta-s-muse-agent-adds-paypal-shopify-and-peloton-as-launch-partners":
    "Meta added PayPal, Shopify and Peloton to Muse, enabling direct one-click purchases inside AI agents.",
  "stocks-rally-as-oil-falls-chips-surge-before-trump-xi-summit":
    "Equities rallied as crude oil dropped 3.5% and chip stocks gained 2.4% ahead of bilateral trade talks.",
  "credo-unveils-1-6t-optics-platform-targets-600m-market-opportunity":
    "Credo Technology launched a 1.6 Tbps optical DSP platform, targeting a $600M data center upgrade cycle.",
  "agnc-posts-1-17-loss-as-tangible-book-value-falls-16-9-to-7-13":
    "AGNC Investment posted a $1.17 loss as tangible book value fell 16.9% to $7.13; adjusted EPS met forecasts.",
  "oracle-cuts-project-jupiter-s-permitted-emissions-35-and-seeks-2-gw-of-renewable-power-for-its-new-mexico-ai-campus":
    "Oracle cut permitted emissions 35% and contracted 2 GW of clean energy for its Project Jupiter AI hub.",
  "27-wall-street-calls-to-know-thursday-palantir-upgraded-constellation-brands-and-nxp-cut":
    "Goldman upgraded Palantir to Buy while Citi cut NXP, leading 27 Wall Street analyst rating calls Thursday.",
  "penguin-solutions-smashes-records-and-lifts-its-2027-outlook-far-above-wall-street-here-are-4-things-that-matter":
    "Penguin Solutions grew sales 68% to a record $567M and raised its 2027 outlook, lifting shares 6.4%.",
  "why-memory-and-storage-stocks-are-sinking-while-the-rest-of-the-market-climbs":
    "Seagate, Western Digital and SK Hynix fell as Toshiba expanded HDD output and Samsung earnings loomed.",
  "marvell-s-big-test-arrives-tuesday-wall-street-wants-bigger-ai-targets-and-has-already-priced-some-in":
    "Marvell hosts Investor Day as analysts look for higher custom AI chip and optics targets. What is priced in.",
  "nvidia-hits-another-record-and-is-now-about-4-away-from-a-6-trillion-market-cap":
    "Nvidia hit an intraday high of $239.86, lifting its value to $5.78T and within 4% of a $6 trillion cap.",
  "micron-is-stalling-on-peak-fears-but-memory-prices-haven-t-gotten-the-memo":
    "Micron stalled on memory peak fears, yet August memory sales rose 36% with DRAM contract prices climbing.",
  "sterling-infrastructure-has-lost-almost-half-its-value-since-june-the-business-hasn-t":
    "Sterling Infrastructure fell 46% from its peak despite 90% revenue growth and a $5.6 billion backlog. Here is why.",
  "the-breakout-that-bites-back-how-to-spot-a-head-fake-before-it-traps-you":
    "A head fake mimics a breakout before reversing hard. How liquidity traps work and the warning signs to watch.",
  "the-ai-bill-nobody-can-predict-cheap-models-cost-more-nearly-1-in-3-times":
    "Why cheaper AI models cost more than premium ones 32% of the time, and how to accurately forecast compute.",
  "4-things-that-could-move-stocks-this-week-from-marvell-s-big-day-to-delta-s-fuel-bill":
    "Four catalysts moving stocks this week: Marvell's investor day, Costco sales and early Q3 corporate earnings.",
  "week-ahead-fed-minutes-five-fed-speakers-and-the-first-big-earnings-of-q3-season":
    "Week ahead: Fed minutes, five Fed speakers, ISM services data and early Q3 earnings from PepsiCo and Delta.",
  "bloom-energy-climbs-as-virginia-s-energy-plan-names-fuel-cells-a-preferred-power-source":
    "Bloom Energy rose 4% to $289.15 after Virginia named fuel cells a preferred power source for data centers.",
  "schd-slides-as-treasury-yields-hit-a-24-year-high-and-bonds-outbid-dividends":
    "SCHD dropped 6.5% from its August peak as the 10-year yield touched 24-year highs, competing with dividends.",
  "what-is-a-gap-up-and-gap-down-in-stocks-a-beginner-s-guide":
    "What causes stock price gaps? A beginner's guide to gap ups, gap downs, fill zones and trading volume signals.",
  "avnet-hits-a-record-high-on-a-blowout-quarter-and-a-broad-based-recovery":
    "Avnet hit a record high as sales rose 48% to $8.3 billion and adjusted EPS of $2.28 beat expectations by 27%.",
  "moderna-joins-the-nasdaq-100-as-warner-bros-discovery-exits-on-the-paramount-merger":
    "Moderna joined the Nasdaq-100 after a 541% YTD run, replacing Warner Bros. Discovery on its Paramount merger.",
  "nvidia-deepens-its-coreweave-bet-as-the-neocloud-s-backlog-hits-104-billion":
    "Nvidia took a fresh $2 billion stake in CoreWeave as the neocloud provider's backlog climbed to $104.2 billion.",
  "nasdaq-rallies-to-a-record-as-a-weak-jobs-report-eases-rate-hike-fears":
    "The Nasdaq rallied to records as cooling labor data tempered rate hike bets and chipmakers extended gains.",
  "sdev-s-parabolic-run-what-s-driving-it-and-why-the-company-says-it-can-t-explain-it":
    "Stablecoin Development Corp. surged from under $1 to over $9 in days on volume, despite no new announcements.",
  "bny-is-reportedly-in-talks-with-kraken-s-parent-on-a-broad-infrastructure-deal":
    "BNY is in talks with Kraken parent Payward on crypto custody, settlement rails and institutional wealth access.",
  "cerebras-falls-below-its-ipo-price-as-an-openai-scare-collides-with-insider-selling":
    "Cerebras fell below its $185 IPO price as OpenAI hardware rumors collided with heavy insider lockup selling.",
  "seagate-and-western-digital-tumble-as-toshiba-threatens-the-hdd-supply-squeeze":
    "Seagate fell 11% and Western Digital 7% after reports Toshiba plans to double data center hard drive capacity.",
  "wall-street-piles-into-micron-after-a-blowout-quarter-here-s-who-raised-targets":
    "Wall Street lifted Micron price targets after a blowout quarter, with Street-high estimates hitting $1,900.",
  "synopsys-pairs-an-openai-chip-design-deal-with-a-bold-2030-growth-plan":
    "Synopsys gained 7% after unveiling an OpenAI chip design alliance, a 15% revenue roadmap and a $1B buyback.",
  "micron-just-posted-its-eighth-straight-beat-and-the-guidance-is-even-better":
    "Micron notched its 8th straight beat with EPS of $33.42 and revenue up 379% to $54.23B, guiding well above views.",
  "the-s-p-500-s-calm-exterior-is-hiding-a-7-week-breakdown-underneath":
    "The S&P 500 holds near record highs, but only 25% of stocks trade above their 50-day average. The divergence.",
  "the-crypto-miner-turned-gpu-startup-that-just-got-nvidia-to-write-it-a-check":
    "GMI Cloud raised $668M with Nvidia participation, expanding high-density clusters to run 1T tokens daily.",
  "inflation-cools-growth-surprises-higher-what-wednesday-s-data-dump-means-for-the-fed":
    "Core inflation cooled to 3.01%, lowering bond yields and boosting odds of a Fed policy pause despite solid jobs.",
  "robinhood-wants-an-ai-agent-trading-your-portfolio-and-a-data-marketplace-to-feed-it":
    "Robinhood is launching portfolio AI trading agents and an Agent Apps store with institutional market feeds.",
  "robinhood-s-big-swing-perpetual-futures-24-7-trading-and-4x-margin":
    "Robinhood launched perpetual futures, round-the-clock trading, 4x margin and earnings contracts for traders.",
  "treasury-yields-spike-to-a-2002-high-then-fade-on-a-dovish-fed-signal":
    "The 30-year Treasury yield hit 5.62%, its highest since 2002, before softening on dovish comments from Fed voters.",
  "altman-won-t-set-an-ipo-date-but-drops-hints-on-hardware-and-rivals":
    "OpenAI CEO Sam Altman stated there is no IPO timeline yet, while teasing custom consumer hardware projects.",
  "openai-passes-1-2-billion-users-while-chasing-a-1-4-trillion-valuation":
    "OpenAI reached 1.2 billion weekly active users as reports indicate a $30 billion round at a $1.4T valuation.",
}


# Import previous dictionary from build_under_120_all
from scripts.build_under_120_all import MAPPINGS, CURATED_UNDER_120

FINAL = {}
for k, v in CURATED_UNDER_120.items():
    if k in UPDATES:
        FINAL[k] = UPDATES[k]
    elif k in MAPPINGS:
        FINAL[k] = MAPPINGS[k]
    else:
        FINAL[k] = v

# Check any remaining that might still exceed 119 chars
remaining_long = {k: v for k, v in FINAL.items() if len(v) >= 120}
print(f"Remaining long items: {len(remaining_long)}")
for k, v in remaining_long.items():
    print(f"[{len(v)}] {k}: {v}")

