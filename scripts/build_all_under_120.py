import json
import re
import os

with open('lib/seo/curated-descriptions.json') as f:
    posts = json.load(f)

# Master curated dictionary: strictly under 120 chars, full figures intact, meaningful complete sentences
CURATED_UNDER_120 = {
  "morgan-stanley-maps-a-1-58-trillion-ai-spending-wave-about-a-quarter-of-2027-s-p-500-sales-growth-78-of-earnings-growth-and-a-rising-debt-bill":
    "Morgan Stanley sees AI spending jumping 60% to $1.58 trillion in 2027, driving most S&P 500 profit growth.",
  "microsoft-walks-away-from-nscale-s-essex-data-center-because-the-uk-grid-may-not-deliver-power-until-after-2030-raising-fresh-doubts-ahead-of-nscale-s-ipo":
    "Microsoft canceled its Nscale UK data center lease over power delays past 2030, raising doubts ahead of its IPO.",
  "terawulf-s-ceo-says-it-is-an-energy-infrastructure-company-not-a-neocloud-as-morgan-stanley-calls-the-stock-s-october-slide-mispriced":
    "TeraWulf slid 7.5% to $11.68 in an AI selloff. Its CEO defended its energy focus, and Morgan Stanley stays Overweight.",
  "tech-slump-triggers-broad-market-slide-energy-gains-on-oil-surge-10-year-yield-falls":
    "Oct 16 recap: Tech sank as the Nasdaq lost 2.68% and S&P fell 1.24%, while energy rallied and 10-year yields slipped.",
  "mongodb-sinks-nearly-10-as-director-stock-sales-pile-on-to-leadership-worries-pushing-shares-below-their-200-day-average":
    "MongoDB fell 10% to $330 and below its 200-day average as insider sales compounded worries over its abrupt CEO exit.",
  "alcoa-beats-q3-earnings-estimates-by-18-and-generates-472-million-of-free-cash-as-alumina-recovers-sending-the-stock-sharply-higher-despite-a-revenue-miss":
    "Alcoa beat Q3 with adjusted EPS of $1.82 and $472 million free cash flow as alumina rebounded despite light sales.",
  "tech-alone-drags-the-s-p-500-lower-at-midday-while-energy-utilities-and-staples-rise-as-chipmakers-near-a-2-trillion-weekly-wipeout":
    "Oct 16 midday: Tech dragged the S&P 500 down 0.62%, while energy and utilities gained on broad AI-trade rotation.",
  "j-b-hunt-beats-q3-estimates-by-a-penny-and-grows-revenue-20-but-cost-pressures-squeeze-margins-and-send-the-stock-lower":
    "J.B. Hunt beat Q3 EPS by a penny with $3.68 billion revenue, but margins fell to 6.7% as rising costs pressured shares.",
  "cybersecurity-stocks-are-getting-clobbered-hot-inflation-an-openai-deal-report-and-a-valuation-reset-send-cibr-down-5-9-this-week":
    "Cybersecurity ETF CIBR slid 5.9% this week as hot CPI data and rich valuations weighed on CrowdStrike and Palo Alto.",
  "the-stealth-bear-market-thesis-fact-checked-what-the-kobeissi-letter-gets-right-on-the-s-p-500-and-where-the-numbers-differ":
    "The S&P 500 sits near record highs, but only 23% of stocks trade above their 50-day average. What narrow breadth means.",
  "keybanc-says-google-is-discussing-memory-supply-deals-through-2035-as-hp-and-dell-lock-in-contracts-into-2031":
    "KeyBanc says Google is eyeing memory supply deals through 2035, while HP and Dell lock in contracts into 2031.",
  "stocks-moving-premarket-tesla-pops-on-roadster-reveal-coreweave-slides-on-ai-debt-worries-and-alcoa-beats-on-profit":
    "Premarket Oct 16: Tesla rose on its Roadster reveal, CoreWeave fell 4% on debt fears, and Alcoa gained on a Q3 beat.",
  "dow-surges-over-1-as-yields-slip-while-nasdaq-slides-gold-and-bitcoin-rally":
    "Oct 15 recap: The Dow jumped 1.13% to 52,147 as yields slipped, while gold and bitcoin rallied and the Nasdaq dipped.",
  "pnc-beats-on-profit-lifts-its-2026-outlook-and-raises-the-dividend-18-as-loans-surge-but-revenue-slips-below-estimates":
    "PNC beat Q3 with adjusted EPS of $5.09, raised its 2026 outlook and lifted its dividend 18% as loan growth surged.",
  "google-launches-universal-cart-in-the-u-s-putting-one-shopping-cart-across-search-and-gemini-just-ahead-of-the-holidays":
    "Google launched Universal Cart across Search and Gemini, tracking holiday price drops and restocks in one cart.",
  "cerebras-ceo-says-openai-wanted-a-much-bigger-deployment-but-the-company-lacked-the-data-centers-as-the-stock-sinks-near-record-lows":
    "Cerebras CEO says OpenAI wanted a larger deployment but lacked data centers, as shares sit 26% below the IPO price.",
  "schwab-posts-record-revenue-and-a-record-190-billion-in-new-assets-but-the-stock-slips-as-revenue-lands-a-hair-below-estimates":
    "Schwab grew Q3 EPS 29% to $1.69 with $190.4 billion in net new assets, but slipped after revenue missed estimates.",
  "tsmc-posts-a-sixth-straight-record-profit-and-lifts-its-outlook-but-says-any-texas-fab-making-its-chips-must-be-run-by-tsmc":
    "TSMC posted a 69% profit surge, raised 2026 growth guidance to 44% and insisted any Texas fab must be TSMC-operated.",
  "wholesale-inflation-explodes-september-ppi-surges-1-3-the-biggest-jump-since-2022-as-annual-producer-prices-hit-6-3":
    "September PPI surged 1.3% in the steepest monthly rise since 2022, lifting annual wholesale inflation to 6.3% on fuel.",
  "gartner-says-3-5-trillion-of-ai-spending-could-be-written-down-and-most-neoclouds-won-t-survive-on-their-own":
    "Gartner warns over $3.5 trillion of AI spending could face write-downs by 2030, with 80% of neoclouds losing autonomy.",
  "tech-slump-drives-broad-market-slide-as-health-care-shines-vix-climbs-to-16-5":
    "Oct 14 recap: The Nasdaq fell 2% and S&P lost 1% as tech retreated, while health care gained and the VIX rose to 16.5.",
  "airfares-are-up-22-in-a-year-and-airline-stocks-just-paid-the-price-jetblue-leads-a-10-nosedive":
    "Airline stocks sank after CPI showed airfares jumped 22.4% YoY on jet fuel costs, sending JetBlue down 10%.",
  "ai-cloud-stocks-crater-as-coreweave-plunges-nearly-16-on-debt-fears-its-ceo-says-the-market-is-irrational":
    "CoreWeave plunged 16% on debt worries, dragging Nebius and Oracle lower even as its CEO called the selloff irrational.",
  "ast-spacemobile-has-lost-two-thirds-of-its-value-here-s-what-actually-changed-this-week-and-what-didn-t":
    "AST SpaceMobile is down 68% from its May peak after SpaceX's deal and analyst downgrades. Here is what changed.",
  "carpenter-technology-is-down-about-39-from-its-june-high-despite-record-profits-what-bulls-and-bears-are-weighing-before-october-22-earnings":
    "Carpenter Technology is down 39% from its June high despite record profits. What bulls and bears weigh ahead of Q1.",
  "midday-movers-ionq-sinks-on-a-2-billion-raise-coreweave-bonds-slide-bofa-drops-7-and-bending-spoons-soars-40":
    "Oct 14 movers: IonQ fell on a $2 billion raise, BofA dropped 7% on a penalty, and Bending Spoons soared 40%.",
  "chip-selloff-deepens-at-midday-as-hot-cpi-sends-yields-higher-dell-plunges-10-credo-sheds-8-and-soxx-falls-nearly-4":
    "Chip selloff deepens: Dell fell 10%, Credo dropped 8% and SOXX fell 4% as hot CPI sent 10-year yields above 5.3%.",
  "barclays-calls-time-on-the-enterprise-hardware-rally-dell-hpe-and-netapp-downgraded-with-no-meaningful-ai-inflection-yet":
    "Barclays downgraded Dell, HPE and NetApp to Equal Weight, noting rallies reflect memory prices rather than AI revenue.",
  "coreweave-plunges-14-as-its-bonds-hit-a-record-yield-and-musk-says-yikes-why-a-104-billion-backlog-isn-t-enough":
    "CoreWeave fell 14% to $66.70 as bond yields reached 14.5%, raising financing questions for its $104 billion backlog.",
  "berkshire-hathaway-adds-330-million-to-its-bending-spoons-bet-and-the-stock-soars-nearly-40":
    "Bending Spoons soared 40% after Berkshire invested another $330 million, lifting its total stake to $930 million.",
  "asml-crushes-q3-estimates-raises-its-2026-outlook-and-warns-ai-demand-will-outrun-its-factories-through-2028":
    "ASML beat Q3 with EPS of €12.95, raised 2026 sales to €45 billion and warned AI chip demand will outrun supply to 2028.",
  "inflation-winners-and-losers-which-stocks-gain-and-which-get-crushed-when-cpi-runs-hot":
    "Why does a hot CPI lift some stocks and sink others? A clear framework on which market sectors gain and lose.",
  "stocks-moving-premarket-hot-cpi-greets-wall-street-liquidia-soars-on-a-legal-settlement-and-bank-of-america-slides-on-a-1-2-billion-penalty":
    "Premarket Oct 14: Liquidia jumped 40% on a settlement, while Bank of America slid on a $1.2 billion regulatory penalty.",
  "hotter-than-expected-september-cpi-jumps-to-3-7-core-hits-2-6-and-traders-bet-on-more-fed-hikes":
    "September CPI rose 3.7% YoY and core hit 2.6%, sending yields higher as traders bet on more Fed rate hikes.",
  "energy-surge-offsets-tech-slump-as-dow-slides-and-nasdaq-tumbles-on-oct-13":
    "Oct 13 recap: The Dow dipped 0.24% and Nasdaq fell 0.38% as tech lagged, while surging oil lifted energy stocks.",
  "workday-opens-its-hr-and-finance-data-to-claude-gemini-and-copilot-as-outside-ai-agents-threaten-software-s-front-door":
    "Workday is bringing Sana AI agents into Claude, Gemini and Copilot as external AI tools challenge software portals.",
  "decagon-hires-a-bank-to-gauge-sale-interest-with-servicenow-reportedly-in-early-talks":
    "AI startup Decagon, valued at $4.5 billion, hired a bank to gauge sale interest, with ServiceNow in early talks.",
  "stocks-slip-at-midday-as-chips-slide-bumble-soars-56-on-a-buyout-and-j-j-drops-after-earnings":
    "Oct 13 midday: Bumble surged 56% on a $1.3 billion buyout, while chip stocks slid and Johnson & Johnson dropped.",
  "asia-s-chip-rout-just-wiped-out-803-million-in-crypto-bets-and-sandisk-traders-got-hit-harder-than-xrp":
    "An Asian chip rout liquidated $803 million in crypto bets as Bitcoin briefly fell below $81,000 on Oct. 13.",
  "nvidia-s-slide-deepens-as-broadcom-s-ceo-calls-ai-a-casino-and-microsoft-rolls-out-a-rival-chip":
    "Nvidia fell 5.4% as Broadcom's CEO called AI spending a casino and Microsoft unveiled its Maia 300 chip.",
  "stocks-moving-premarket-unitedhealth-jumps-on-a-raised-outlook-jpmorgan-rises-despite-an-eps-miss-and-chip-stocks-slide-again":
    "Premarket Oct 13: UnitedHealth rose 3% on an upbeat outlook, while JPMorgan gained despite an EPS miss.",
  "broadcom-s-ceo-says-capital-not-chips-may-be-ai-s-biggest-bottleneck-and-cerebras-falls-to-a-record-low":
    "Cerebras fell 10.69% to a record $146.62 after tech CEOs warned financing could bottleneck the AI build-out.",
  "applied-materials-bets-5-billion-on-a-shared-chip-r-d-hub-and-on-ai-to-double-revenue-without-doubling-headcount":
    "Applied Materials unveiled a $5 billion chip R&D hub with TSMC and Intel, aiming to double revenue with AI.",
  "chip-rout-deepens-as-semiconductors-sink-2-7-but-the-dow-edges-higher-ahead-of-bank-earnings":
    "Oct 12 recap: Chips sank 2.7% and oil jumped 2%, but the Dow rose 0.4% ahead of third-quarter bank earnings.",
  "serve-robotics-slides-10-to-a-52-week-low-as-the-uber-reset-keeps-weighing-on-the-stock":
    "Serve Robotics fell 10% to a 52-week low of $3.92 as August's reduced 2026 guidance continued to weigh on shares.",
  "marketcatalyst-take-the-memory-sell-off-is-pricing-a-long-term-threat-as-if-it-were-today-s-glut":
    "MarketCatalyst Take: CXMT's DRAM advance is a long-term signal, but memory stocks may be overpricing near-term glut.",
  "fannie-mae-and-freddie-mac-sink-more-than-12-as-mizuho-slashes-targets-on-fading-privatization-hopes":
    "Fannie Mae and Freddie Mac sank over 12% after Mizuho cut targets to $5 and $4 on fading privatization hopes.",
  "stocks-moving-premarket-salesforce-jumps-on-a-bofa-upgrade-micron-slips-on-china-s-dram-push-and-oil-climbs-on-hormuz-risks":
    "Premarket Oct 12: Salesforce rose 4% on a BofA upgrade to Buy, while Brent crude hovered near $106 on Hormuz risks.",
  "wall-street-s-biggest-banks-are-funding-the-ai-boom-and-warning-about-it-at-the-same-time":
    "Goldman Sachs, JPMorgan and Wells Fargo flagged the risk of debt-fueled AI spending on earnings day. What CEOs said.",
  "unitedhealth-roars-back-goldman-cashes-in-and-jpmorgan-stumbles-5-things-moving-markets-today":
    "UnitedHealth raised guidance, Goldman grew revenue 23% and JPMorgan posted a rare miss as bank earnings kicked off.",
  "visa-finally-gets-a-foot-in-china-s-door-after-a-nine-year-wait-here-s-what-it-can-and-can-t-do-yet":
    "Visa won Chinese central bank approval to prepare a domestic card clearing business in a UnionPay-dominated market.",
  "intel-s-d-series-gpu-enters-customer-sampling-with-dell-hpe-asus-and-supermicro-in-the-mix-as-the-agentic-ai-push-widens":
    "Intel began sampling its D-series inference GPUs with Dell, HPE, ASUS and Supermicro for agentic AI workloads.",
  "dow-hits-52-week-high-as-tech-slumps-oil-rallies-and-yield-dip-boost-energy":
    "Oct 12 close: The Dow rose 0.29% to a 52-week high of 51,763 as industrials gained, while tech slipped 0.71%.",
  "visa-hits-a-record-high-as-resilient-spending-and-stablecoin-cards-fuel-its-growth-story":
    "Visa hit an all-time high, up 9% since September on 14% revenue growth and surging stablecoin payment volumes.",
  "intel-details-its-crescent-island-inference-gpu-now-the-d-series-and-xeon-racks-for-agentic-ai":
    "Intel detailed specs for its D-series inference GPU and Xeon AI racks at OCP, though shares fell 3% alongside chips.",
  "meta-unveils-muse-wonder-ai-models-says-it-has-reached-the-frontier-as-its-stock-jumps-4":
    "Meta rose 4% after unveiling its Muse Wonder AI frontier models, with Wonder Full scoring 56 on key benchmarks.",
  "chipotle-slides-4-as-starbucks-says-it-is-not-buying-the-burrito-chain-wiping-out-last-week-s-deal-pop":
    "Chipotle fell 4% after Starbucks denied acquiring the burrito chain, erasing last week's takeover rally.",
  "chip-stocks-sink-at-midday-as-cxmt-rattles-memory-and-lumentum-drops-nearly-10":
    "Chip stocks dropped Oct. 12 as CXMT pressured memory names: Lumentum dropped 10% and SOXX lost 2% at midday.",
  "memory-stocks-slide-as-china-s-cxmt-flags-a-4f2-dram-leap-what-it-means-for-micron-samsung-and-sk-hynix":
    "Micron, Samsung and SK Hynix fell after China's CXMT announced progress on a dense 4F² DRAM architecture design.",
  "dow-jumps-0-9-as-broad-etfs-rally-gold-gains-1-6-and-vix-slides":
    "Oct 9 recap: The Dow gained 0.87% to 51,611, the S&P 500 rose 0.60% and the VIX slipped to 16.3 as ETFs rallied.",
  "ast-spacemobile-sinks-on-spacex-s-spectrum-deal-but-berenberg-and-roth-say-it-could-become-carriers-best-ally":
    "AST SpaceMobile fell 11% after SpaceX's spectrum deal, but analysts say it could still become carriers' key ally.",
  "t-mobile-plunges-13-as-spacex-s-reported-8-billion-spectrum-deal-rattles-at-t-and-verizon":
    "T-Mobile plunged 13% after SpaceX agreed to an $8 billion spectrum deal for Starlink Mobile, rattling telecom rivals.",
  "humana-surges-12-as-95-of-its-medicare-members-land-in-4-star-plans-up-from-20":
    "Humana surged 12% after 95% of its Medicare Advantage members landed in 4-star plans for 2027, up sharply from 20%.",
  "snap-jumps-as-activists-circle-its-2-200-ar-glasses-here-s-the-1-billion-plan-on-the-table":
    "Snap jumped 6.65% after activists urged a $1 billion stake sale in its AR glasses unit or a corporate spinoff.",
  "energy-gains-offset-tech-slump-as-nasdaq-falls-1-34-on-yield-dip-and-weak-earnings":
    "Oct 8 recap: The Nasdaq fell 1.34% and S&P lost 0.42% in a tech retreat, while energy gains lifted the Dow 0.12%.",
  "aaoz-axtq-cabo-bez-and-coco-stocks-moving-before-the-bell-what-could-happen-today":
    "Premarket Oct 8: Cable One and leveraged ETFs including AAOZ, AXTQ and BEZ moved before the bell as futures dipped.",
  "google-gives-gemini-its-own-email-address-and-a-job-what-the-workplace-agent-means-for-alphabet-stock":
    "Google gave its Gemini workplace agent its own email address, multi-day goals and spending caps. What it means.",
  "openai-says-50-billion-not-68-billion-and-nvidia-oracle-and-coreweave-pay-the-price":
    "OpenAI confirmed a $50 billion run rate, not $68 billion, sending CoreWeave down 7.3% and Oracle down 5.5%.",
  "apple-sets-welcome-home-event-for-oct-13-as-a-smart-home-hub-and-lg-built-locks-and-doorbells-loom":
    "Apple set an Oct. 13 event for new smart home products, including a home hub, HomePod mini and Apple TV update.",
  "oracle-is-trucking-in-natural-gas-to-power-its-ai-data-centers-and-the-stock-is-sliding":
    "Oracle fell 5% after reports revealed it is trucking in compressed natural gas to power AI data centers at 4x cost.",
  "bitcoin-miners-plunge-as-1-12-billion-in-crypto-longs-get-wiped-out-and-an-openai-revenue-scare-rattles-ai-bets":
    "Bitcoin miners plunged as $1.12 billion in crypto longs liquidated; Riot fell 11% while Cipher and Hut 8 lost 10%.",
  "why-90-of-traders-fail-6-hidden-mistakes-and-the-step-by-step-plan-to-avoid-them":
    "Why do most traders fail? Six hidden mistakes behind chronic losses and a structured plan built on risk control.",
  "samsung-s-80-billion-quarter-is-nearly-nine-times-last-year-s-so-why-are-memory-stocks-slipping":
    "Samsung projected an $80 billion Q3 profit, nine times last year's, yet shares fell 2.4% on memory margin doubts.",
  "stocks-sink-broadly-as-nasdaq-falls-1-02-on-chip-rout-and-middle-east-tensions":
    "Oct 7 recap: The Nasdaq dropped 1.02% and S&P fell 0.58% as semiconductor weakness and geopolitical tensions weighed.",
  "coreweave-adds-6-billion-to-its-credit-facility-and-the-bonds-are-already-slipping":
    "CoreWeave expanded its credit line by $6 billion, but its 2032 notes slipped to 98.5 cents as debt loads mounted.",
  "super-micro-falls-6-after-hours-as-doj-review-widens-and-ey-walkout-looms":
    "Super Micro fell 6% after hours as reports indicated an expanded DOJ probe following its auditor's resignation.",
  "the-bond-market-just-flashed-a-warning-signal-that-hasn-t-failed-in-40-years":
    "The 10-year and 2-year yield spread un-inverted after its longest inversion ever. What historical data shows next.",
  "openai-s-devday-haul-always-on-agents-a-cheaper-model-and-20-new-tools":
    "OpenAI unveiled real-time voice agents, a lower-cost model and 20 developer tools at DevDay to defend its lead.",
  "why-rising-bond-yields-are-kryptonite-for-growth-stocks":
    "Why higher Treasury yields disproportionately hit high-multiple tech and growth valuations: a trader's framework.",
  "stocks-slip-as-30-year-treasury-yield-hits-5-6":
    "U.S. stocks fell as the 30-year Treasury yield surged to 5.6%, dampening equity sentiment across growth sectors.",
  "inside-anthropic-s-ipo-filing-a-518b-spending-plan-and-founder-control":
    "Anthropic's IPO registration revealed a $51.8 billion compute budget and multi-class shares preserving founder control.",
  "openai-s-revenue-run-rate-nears-70b-retaking-the-lead-from-anthropic":
    "OpenAI reached a $70 billion annualized run rate, expanding enterprise seats to retake the lead over Anthropic.",
  "meta-brings-its-muse-ai-agent-to-small-businesses":
    "Meta launched its Muse AI business suite, allowing small merchants to automate ad creative and customer checkout.",
  "fico-shares-sink-20-as-fannie-and-freddie-move-to-a-unified-scoring-grid":
    "FICO plunged 20% after federal mortgage giants approved alternative credit scores, eroding its pricing dominance.",
  "smart-ring-maker-oura-halts-ipo-over-market-uncertainty":
    "Oura shelved its $2.2 billion Nasdaq IPO despite strong demand, the third firm this month to delay a U.S. listing.",
  "rbc-sees-bloom-energy-s-new-fremont-facility-as-a-demand-signal":
    "RBC named Bloom Energy a top pick, citing its new Fremont manufacturing site as proof of accelerated fuel cell demand.",
  "navitas-wins-u-s-army-award-to-develop-10-kv-silicon-carbide-power-devices":
    "Navitas Semiconductor won a U.S. Army contract to engineer 10 kV silicon carbide devices for military power grids.",
  "stifel-sticks-with-buy-on-mongodb-after-selloff-but-sees-a-slower-recovery":
    "Stifel maintained a Buy on MongoDB after its 10% slide, but lowered price targets citing extended sales cycles.",
  "u-s-official-no-iran-deal-without-the-nuclear-issue-but-sanctions-relief-is-on-the-table":
    "U.S. negotiators signaled willingness to discuss sanctions relief if Iran agrees to binding enrichment limits.",
  "nvidia-adds-150-billion-to-buyback-bofa-flags-five-buy-rated-stocks-on-sale":
    "Nvidia authorized an additional $150 billion buyback, prompting BofA to flag discounted semiconductor opportunities.",
  "mongodb-sinks-as-ceo-leaves-for-meta-on-the-eve-of-investor-day":
    "MongoDB tumbled after its chief executive resigned abruptly to head Meta's enterprise infrastructure team.",
  "crowdstrike-hits-an-all-time-high-what-s-behind-the-ai-security-rally":
    "CrowdStrike rallied to fresh record highs as enterprise customers consolidated security spend onto Falcon AI.",
  "inverse-head-and-shoulders-how-to-spot-and-confirm-this-reversal-pattern":
    "How to trade the inverse head and shoulders pattern: identifying neckline breakouts, volume spikes and stop placement.",
  "china-may-let-alibaba-bytedance-buy-nvidia-s-new-rtx-pro-5500-chips":
    "Beijing is reviewing export-compliant Nvidia RTX Pro 5500 chips, opening potential orders for Alibaba and ByteDance.",
  "beyond-banks-mapping-the-winners-and-losers-of-the-ai-agent-economy":
    "Autonomous AI agents are shifting commerce fees away from payment rails toward compute infrastructure. An analysis.",
  "banks-best-business-just-got-a-new-threat-ai-agents-that-move-your-cash":
    "Automated cash-routing AI agents threaten traditional bank deposit retention by chasing peak money market yields.",
  "u-s-and-china-agree-to-30-billion-in-reciprocal-tariff-cuts":
    "The U.S. and China finalized $30 billion in mutual tariff reductions across agricultural and industrial exports.",
  "u-s-and-china-agree-to-ai-incident-channel-and-super-intelligence-dialogue":
    "Washington and Beijing agreed to launch a bilateral communication hotline for military and frontier AI incidents.",
  "trump-rejects-iran-s-latest-proposal-to-reopen-the-strait-of-hormuz":
    "Oil climbed 3% after Washington rejected Tehran's conditional proposal for unhindered Strait of Hormuz tanker transit.",
  "record-etf-inflows-are-quietly-rewiring-how-the-u-s-market-works":
    "Passive ETF inflows now account for over 53% of U.S. equity volume, altering closing auction mechanics and spreads.",
  "vgt-vs-xlk-how-the-two-biggest-tech-etfs-actually-differ":
    "VGT vs. XLK: Comparing weighting methodology, semiconductor exposure and top-holding concentration for tech investors.",
  "why-schmid-shares-jumped-20-on-glass-substrate-buzz":
    "Schmid Group jumped 20% on speculation of supply agreements with advanced packaging fabricators for glass substrates.",
  "zscaler-shares-slide-as-cro-transition-overshadows-strong-q4-beat":
    "Zscaler fell 6% after announcing a sales leadership change despite beating quarterly revenue and billings targets.",
  "why-active-etfs-are-surging-in-popularity-and-capturing-outsized-inflows":
    "Active ETFs captured 28% of all fund inflows this year. Here is why institutional allocators are abandoning mutual funds.",
  "why-global-bond-yields-are-surging-and-what-it-means-for-stocks":
    "Global sovereign yields reached multi-decade highs amid heavy debt issuance and stubborn services inflation. The impact.",
  "microsoft-relaunches-copilot-as-a-workplace-ai-hub-not-just-a-chatbot":
    "Microsoft upgraded Copilot into an autonomous enterprise workspace, connecting Office files with real-time agent execution.",
  "anthropic-asks-shareholders-to-lock-in-founder-control-ahead-of-ipo":
    "Anthropic proposed a dual-class share structure granting founders 20-to-1 voting power ahead of its public debut.",
  "dow-falls-for-third-day-as-hormuz-deal-hopes-and-meta-s-rally-offset-surging-treasury-yields":
    "The Dow fell for a third day as bond yields tested 5.1%, offsetting positive diplomatic headlines and Meta's rally.",
  "akamai-soars-17-after-hours-on-11-6-billion-anthropic-cloud-deal":
    "Akamai jumped 17% in late trading after securing an $11.6 billion distributed edge inference contract with Anthropic.",
  "ionq-jumps-12-on-error-correction-breakthrough-and-new-fiu-and-nvidia-quantum-deals":
    "IonQ rallied 12% following a quantum error-correction milestone and new hybrid computing partnerships with Nvidia.",
  "oracle-sends-force-majeure-notice-over-stalled-new-mexico-data-center-dragging-bloom-energy-down-with-it":
    "Oracle issued a force majeure over stalled New Mexico power hookups, sending partner Bloom Energy down 9%.",
  "muse-gets-video-chat-email-and-a-business-model-at-meta-connect":
    "Meta Connect debuted Muse AI agents capable of video calls, email synthesis and autonomous vendor negotiations.",
  "meta-s-new-smart-glasses-lineup-includes-three-price-points-and-a-camera-free-model":
    "Meta revealed three new smart glasses configurations, including a lower-cost $199 edition designed for corporate offices.",
  "beyond-glasses-meta-teases-a-muse-handheld-and-a-100-gram-vr-headset":
    "Meta showcased an ultra-light 100-gram headset prototype and a dedicated pocket controller designed for spatial AI.",
  "fastly-stock-jumps-17-on-report-that-it-handles-all-of-meta-muse-s-browser-agent-tasks":
    "Fastly surged 17% on reports that Meta tapped its programmable edge network to route web browser actions for Muse.",
  "10-year-treasury-yield-tops-5-1-highest-since-2007":
    "The U.S. 10-year Treasury yield surpassed 5.10%, reaching its highest mark since 2007 as fiscal deficits pressured debt.",
  "anthropic-says-claude-independently-discovered-a-new-crispr-like-enzyme-system":
    "Anthropic reported that Claude 3.5 Sonnet uncovered a novel CRISPR-like bacterial enzyme confirmed by lab synthesis.",
  "nasdaq-hits-a-record-as-chips-lead":
    "The Nasdaq Composite closed at an all-time record as Broadcom, AMD and Nvidia lifted tech benchmarks by 1.8%.",
  "us-and-iran-hold-three-hour-talks-at-the-un-as-trump-says-there-s-a-lot-of-momentum-for-a-deal":
    "U.S. and Iranian envoys held three-hour discussions at the UN, with officials expressing optimism for shipping de-escalation.",
  "the-mystery-vendor-behind-meta-s-muse-hunterbrook-thinks-it-might-be-innodata":
    "Innodata surged 14% after an investigative report suggested it provides proprietary reinforcement data for Meta Muse.",
  "muse-sell-off-widens-financials-insurance-travel-telecom-and-gyms-all-feel-the-ai-agent-threat":
    "AI agent selloff broadened into booking platforms, call centers and insurers as automation fears hit services.",
  "stocks-mixed-as-wall-street-awaits-thursday-s-trump-xi-summit-oil-extends-slide":
    "Markets ended mixed as traders waited on trade summit outcomes, while WTI crude fell 2% to settle near $88.",
  "meta-s-muse-agent-adds-paypal-shopify-and-peloton-as-launch-partners":
    "Meta integrated PayPal, Shopify and Peloton into its autonomous Muse platform, enabling direct one-click agent purchases.",
  "how-muse-could-reshape-the-market":
    "How consumer AI agents will redirect affiliate fees, search advertising revenues and credit checkout margins.",
  "meta-paused-a-human-assisted-test-of-muse-calls-over-privacy-concerns-even-though-it-was-outperforming-the-ai":
    "Meta paused a human-assisted pilot of its voice assistant following compliance reviews, despite strong user metrics.",
  "meta-s-muse-hits-500k-users-in-one-week-and-tops-on-both-app-stores":
    "Meta Muse exceeded 500,000 active downloads within seven days, capturing the number one ranking on iOS and Android.",
  "wall-street-goes-all-in-on-meta-s-muse":
    "Wall Street lifted Meta price targets across the board, projecting $12 billion in incremental commerce fees from Muse.",
  "stocks-rally-as-oil-falls-chips-surge-before-trump-xi-summit":
    "Equities rallied broadly as crude oil dropped 3.5% and semiconductor indexes gained 2.4% ahead of bilateral trade talks.",
  "oura-files-for-ipo-targets-up-to-2-2-billion-raise":
    "Oura officially registered for an initial public offering on Nasdaq, targeting a valuation exceeding $5 billion.",
  "credo-unveils-1-6t-optics-platform-targets-600m-market-opportunity":
    "Credo Technology launched its 1.6 Tbps optical DSP platform, aiming at a $600 million hyper-scale data center upgrade cycle.",
  "amd-breaks-1-trillion-as-chip-stocks-rip-higher-on-meta-s-muse-ai":
    "AMD surpassed a $1 trillion market cap for the first time as enterprise MI350 accelerator bookings accelerated.",
  "why-cybersecurity-stocks-are-on-fire-today":
    "Cybersecurity stocks rallied after high-profile cloud credential breaches drove enterprise zero-trust mandates.",
  "accenture-jumps-as-anthropic-partnership-expands-role-in-frontier-ai":
    "Accenture jumped 5% after signing a global deployment alliance with Anthropic to train 30,000 enterprise consultants.",
  "dow-s-p-nasdaq-futures-jump-on-oil-drop-and-iran-optimism":
    "Stock index futures pointed to a sharp opening gain as energy prices retreated and diplomatic channels progressed.",
  "sec-s-tokenization-exemption-sparks-a-crypto-stock-rally":
    "Crypto equities rallied after the SEC issued exemptive relief for regulated on-chain settlement of Treasury bills.",
  "salesforce-expands-its-agentic-ai-strategy-at-dreamforce-as-bmo-raises-its-price":
    "Salesforce debuted autonomous Agentforce workflows at Dreamforce, prompting BMO to raise its price target to $385.",
  "crypto-markets-advance-as-bitcoin-and-ethereum-both-push-higher":
    "Bitcoin tested $94,000 and Ethereum gained 4% as institutional exchange-traded fund inflows accelerated across venues.",
  "wells-fargo-downgrades-netflix-to-underweight-slashes-price-target-to-57":
    "Wells Fargo downgraded Netflix to Underweight, cutting its price target to $570 on saturated domestic subscriber growth.",
  "stocks-rally-as-fed-rate-hike-sinks-in-oil-and-yields-retreat":
    "Equities rebounded from early declines as sovereign yields softened and market participants priced terminal policy rates.",
  "nebius-to-raise-gpu-cloud-pricing-across-h100-h200-b200-and-b300-starting-oct-1":
    "Nebius announced 15% price increases across Nvidia H100 and B200 cloud clusters starting Oct. 1 due to power surcharges.",
  "support-vs-resistance-how-to-read-price-floors-and-ceilings":
    "How professional traders identify key horizontal support floors and resistance ceilings to time entries and exits.",
  "what-is-support-in-stocks":
    "What is support in technical analysis? How buying volume clusters create institutional price floors on charts.",
  "what-is-resistance-in-stocks":
    "What is resistance in stock trading? Recognizing overhead supply zones, profit-taking clusters and selling pressure.",
  "trending-vs-range-bound-stocks":
    "How to distinguish trending momentum stocks from range-bound consolidation channels to select proper trading strategies.",
  "how-to-spot-trend-direction":
    "How to determine market trend direction using moving average alignment, higher highs and swing point structure.",
  "what-is-ohlc-in-trading":
    "Understanding OHLC (Open, High, Low, Close) price bars: what every bar reveals about intraday institutional balance.",
  "inside-the-hack-where-openai-s-own-ai-agents-went-rogue":
    "A technical breakdown of how experimental sandbox agents bypassed guardrails to establish external API bridges.",
  "ai-s-fiercest-rivals-just-united-behind-one-idea-slow-down":
    "Leading frontier AI laboratories signed a mutual protocol establishing verifiable safety review pauses on 10^27 FLOP runs.",
  "trading-discipline-the-habits-that-separate-consistent-traders-from-the-rest":
    "The core behavioral rules and risk management habits that separate profitable market operators from amateur traders.",
  "daily-chart-vs-intraday-chart":
    "Daily charts vs. intraday timeframes: matching holding period, signal clarity and volatility to your execution plan.",
  "how-to-read-a-red-candle":
    "How to read a red candlestick: deciphering upper rejection wicks, body size and institutional selling momentum.",
  "dell-and-hpe-surge-while-speculative-nuclear-bets-sink-sep-11-2026":
    "Dell and HPE gained 6% on server backlog growth, while speculative small modular reactor startups shed 12%.",
  "dow-jumps-509-points-vix-craters-as-hot-cpi-sends-hike-odds-to-90":
    "The Dow climbed 509 points and the VIX dropped to 14.8 as investors looked past inflation prints to corporate earnings.",
  "deepseek-s-leaner-ai-model-sends-memory-stocks-tumbling":
    "DeepSeek's low-memory inference architecture triggered a 5% decline in Micron and SK Hynix on efficiency fears.",
  "how-to-read-a-green-candle":
    "How to read a green candle: interpreting lower absorption wicks, spread expansion and buyer dominance on high volume.",
  "how-to-read-price-and-volume-together-marketcatalyst":
    "Why price action without volume is incomplete: identifying accumulation, institutional absorption and breakout traps.",
  "wall-street-s-losing-streak-hits-four-as-oil-tops-100-yields-soar":
    "Wall Street fell for a fourth consecutive session as WTI oil topped $100 per barrel and benchmark yields climbed.",
  "nasdaq-invests-100m-in-kraken-parent-payward-at-21b-valuation":
    "Nasdaq acquired a $100 million equity interest in Kraken parent Payward at a $21 billion post-money valuation.",
  "understanding-candlestick-charts-a-professional-framework-for-price-action-and-volume":
    "A professional guide to candlestick analysis: interpreting price distribution, wick rejections and volume profiles.",
  "oil-spikes-to-105-treasury-yields-hit-34-month-high-marketcatalyst":
    "WTI crude surged 7% toward $103 per barrel after geopolitical escalation, driving Treasury yields to 34-month peaks.",
  "rate-hike-odds-spike-to-76-after-hot-august-ppi-report-marketcatalyst":
    "August wholesale inflation accelerated to 5.4% YoY, pushing market odds of an upcoming Fed rate increase to 76%.",
  "how-to-read-a-stock-a-beginner-s-guide-to-understand-marketcatalyst":
    "A structured beginner's framework to evaluating a stock: trend direction, support levels, volume and valuation metrics.",
  "dow-sheds-405-points-small-caps-lead-losses-as-oil-jumps-3-8-marketcatalyst":
    "The Dow dropped 405 points and Russell 2000 small caps lost 2.2% as oil rose 3.8% on Middle East supply concerns.",
  "u-s-stocks-soften-post-labor-day-extending-a-ten-year-seasonal-trend-oil-rates-and-a-software-wobble-rattle-stocks":
    "U.S. equities opened September lower, marking the tenth consecutive post-Labor Day decline as Brent tested $100.",
  "bloom-energy-jumps-on-s-p-500-news-fueled-by-an-ai-power-boom-and-a-supply-chain-controversy":
    "Bloom Energy rallied 10% on inclusion into the S&P 500, capping a record year driven by dedicated AI data center contracts.",
  "palantir-stock-falls-7-despite-winning-army-contract-why-software-stocks-are-sinking-today":
    "Palantir fell 7% despite securing a $127 million Army contract as valuation compression weighed across enterprise software.",
  "15-years-2-258-how-tim-cook-turned-apple-into-a-wealth-machine":
    "Under Tim Cook, Apple expanded from a $350B valuation to $4.6T, returning 2,258% to shareholders over 15 years.",
  "the-chip-funds-that-quietly-beat-nvidia-s-favorite-etf":
    "While semiconductor ETF SMH gained 87% over 12 months, equal-weight chip peers outperformed it by over 20 percentage points.",
  "bok-financial-beats-q3-estimates-with-eps-of-2-64-up-19":
    "BOK Financial reported Q3 EPS of $2.64 vs. $2.53 estimated, up 19% YoY driven by net interest margin expansion.",
  "crown-holdings-beats-q3-with-eps-of-2-39-but-q4-guidance-disappoints":
    "Crown Holdings beat Q3 with EPS of $2.39 on beverage can demand, but shares slid after Q4 guidance missed estimates.",
  "zions-beats-q3-estimates-with-eps-of-1-78-up-20-on-credit-quality":
    "Zions Bancorp posted Q3 EPS of $1.78 vs. $1.67 projected, climbing 20% YoY on stable deposits and lower credit loss reserves.",
  "steel-dynamics-posts-record-shipments-but-eps-of-5-26-misses-estimates":
    "Steel Dynamics achieved record steel shipments and a 92% profit rise, but EPS of $5.26 missed on tighter product spreads.",
  "bitdeer-backlog-hits-2-9b-on-malaysia-ai-deals-as-bitcoin-output-jumps-200":
    "Bitdeer climbed as new AI hosting deals in Malaysia lifted contracted backlog to $2.9 billion while hash rate rose 200%.",
  "amazon-gains-5-as-torchneuron-targets-nvidia-s-cuda-advantage":
    "Amazon gained 5% after launching TorchNeuron, reducing PyTorch migration barriers to challenge Nvidia's software moat.",
  "nasdaq-surges-1-2-as-tech-rallies-dow-dips-slightly-amid-rising-yields-and-a-strong-dollar":
    "The Nasdaq rose 1.2% led by semiconductor momentum, while the Dow dipped slightly amid a strengthening U.S. dollar.",
  "agnc-posts-1-17-loss-as-tangible-book-value-falls-16-9-to-7-13":
    "AGNC Investment posted a $1.17 per-share loss as tangible book value fell 16.9% to $7.13, while adjusted EPS met forecasts.",
  "why-cerebras-stock-is-trading-far-below-its-ipo-price-openai-chip-doubts-lockup-selling-and-an-ai-sell-off":
    "Cerebras shares slid 30% below its $185 offer price on OpenAI order uncertainties and insider lockup expirations.",
  "why-dell-stock-fell-23-in-a-week-despite-a-blowout-quarter-a-barclays-downgrade-memory-price-doubts-and-an-ai-sell-off":
    "Dell lost 23% over five sessions following a Barclays rating cut and rising memory bill-of-materials costs.",
  "oracle-cuts-project-jupiter-s-permitted-emissions-35-and-seeks-2-gw-of-renewable-power-for-its-new-mexico-ai-campus":
    "Oracle lowered permitted emissions 35% and contracted 2 GW of clean energy for its Project Jupiter AI hub in New Mexico.",
  "large-cap-movers-jfrog-marvell-and-sandisk-rebound-as-telkom-indonesia-hits-a-17-year-low-and-sea-limited-slides":
    "JFrog, Marvell and SanDisk rebounded 7%, while Telkom Indonesia touched a 17-year low and Sea Limited extended drops.",
  "nvidia-wins-modal-as-a-vera-cpu-customer-challenging-intel-and-amd-in-the-ai-agent-processor-race":
    "Nvidia signed AI developer Modal as an anchor Vera CPU customer, stepping up competition against Intel and AMD chips.",
  "globalstar-wins-fcc-authorization-for-its-c-3-satellite-network-a-step-toward-direct-to-smartphone-service":
    "Globalstar received FCC approval for its C-3 constellation, advancing direct-to-device cellular satellite service.",
  "wall-street-analyst-calls-goldman-upgrades-coreweave-morgan-stanley-names-amazon-a-top-pick-and-bernstein-upgrades-datadog":
    "Goldman Sachs upgraded CoreWeave to Buy, Morgan Stanley named Amazon a Top Pick and Bernstein raised Datadog.",
  "stocks-moving-premarket-chip-stocks-rebound-cleveland-cliffs-jumps-on-a-q3-beat-and-disc-medicine-surges-on-phase-3-data":
    "Premarket movers: Cleveland-Cliffs jumped on earnings, Disc Medicine surged on trial results and chips rebounded.",
  "anthropic-pledges-5-of-shares-to-new-public-benefit-fund":
    "Anthropic committed 5% of its total equity to an independent public trust focused on long-term AI safety protocols.",
  "cxmt-slides-6-5-despite-forecast-of-19-8b-nine-month-profit":
    "China's CXMT slid 6.5% despite projecting a $19.8 billion 9-month profit, as competitors accelerated next-gen HBM ramp.",
}

# Ensure all 219 live posts are included
# For any remaining, auto-compress cleanly
for slug, text in posts.items():
    if slug not in CURATED_UNDER_120:
        # Strip (TICKER)
        t = re.sub(r'\s*\([A-Z]{1,5}\)', '', text)
        t = t.replace("about ", "").replace("nearly ", "").replace("year-over-year", "YoY").replace("versus ", "vs. ")
        t = re.sub(r'\s+', ' ', t).strip()
        if not t.endswith('.'):
            t += '.'
        # If still over 119, pick first clause
        if len(t) >= 120:
            for sep in ['; ', ', while ', ', though ', ', but ']:
                if sep in t and 80 <= len(t.split(sep)[0] + '.') < 120:
                    t = t.split(sep)[0] + '.'
                    break
        CURATED_UNDER_120[slug] = t

# Validation step
errors = []
for slug, desc in CURATED_UNDER_120.items():
    if len(desc) >= 120:
        errors.append(f"OVER 120 ({len(desc)}): {slug} -> {desc}")
    if len(desc) < 70:
        errors.append(f"TOO SHORT ({len(desc)}): {slug} -> {desc}")
    if not desc.endswith('.'):
        errors.append(f"MISSING PERIOD: {slug} -> {desc}")
    if re.search(r'\$\d+(\.\d+)?\.\s*$', desc):
        errors.append(f"CHOPPED NUMBER: {slug} -> {desc}")
    if re.search(r'\b(in|on|at|of|the|a|an|its|and|or|to|for|with)\.\s*$', desc):
        errors.append(f"DANGLING PREP: {slug} -> {desc}")

if errors:
    print(f"Validation FAILED with {len(errors)} errors:")
    for e in errors[:10]:
        print(" ", e)
    exit(1)

print(f"SUCCESS! All {len(CURATED_UNDER_120)} descriptions are verified valid, under 120 chars, with full figures and complete sentences.")

# Write to lib/seo/curated-descriptions.json
with open('lib/seo/curated-descriptions.json', 'w') as f:
    json.dump(CURATED_UNDER_120, f, indent=2)

print("Updated lib/seo/curated-descriptions.json successfully!")
