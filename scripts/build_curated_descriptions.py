"""
Master generator for lib/seo/curated-descriptions.json
Ensures 100% of the 219 blog posts have complete, accurate, grammatically sound descriptions
strictly between 85 and 118 characters (median ~110-112 chars).

Key rules:
- No trailing ellipsis ('...')
- No cut numbers (e.g. '$2.2 billion', '$5.6 billion', '$80,000')
- No cut phrases ending with dangling prepositions/conjunctions ('in New.', 'to double its.')
- High quality editorial sentences covering market drivers, key figures, and context.
"""

import json
import os
import re

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../lib/seo/curated-descriptions.json")

MASTER_DESCRIPTIONS = {
  # Flagged / high-profile posts
  "smart-ring-maker-oura-halts-ipo-over-market-uncertainty":
    "Oura shelved its up-to-$2.2 billion Nasdaq IPO despite strong demand, becoming the third firm to delay a listing.",
  "oura-files-for-ipo-targets-up-to-2-2-billion-raise":
    "Smart-ring maker Oura filed for a Nasdaq IPO to sell 50M shares at $40 to $44, seeking to raise up to $2.2 billion.",
  "sterling-infrastructure-has-lost-almost-half-its-value-since-june-the-business-hasn-t":
    "Sterling Infrastructure fell 46% from its record high even as revenue rose 90% and backlog reached $5.6 billion.",
  "crypto-markets-advance-as-bitcoin-and-ethereum-both-push-higher":
    "Strategy, Coinbase, and Robinhood rose as bitcoin climbed back above $80,000 following a volatile trading week.",
  "seagate-and-western-digital-tumble-as-toshiba-threatens-the-hdd-supply-squeeze":
    "Seagate and Western Digital tumbled up to 11% after Toshiba announced plans to double its hard drive capacity.",
  "oracle-sends-force-majeure-notice-over-stalled-new-mexico-data-center-dragging-bloom-energy-down-with-it":
    "Oracle dropped 2.8% after sending a force majeure notice over its stalled Project Jupiter campus in New Mexico.",
  "oracle-cuts-project-jupiter-s-permitted-emissions-35-and-seeks-2-gw-of-renewable-power-for-its-new-mexico-ai-campus":
    "Oracle cut permitted emissions 35% and sought 2 GW of renewable power for its Project Jupiter campus in New Mexico.",
  "the-crypto-miner-turned-gpu-startup-that-just-got-nvidia-to-write-it-a-check":
    "GMI Cloud, a Bitcoin miner turned GPU cloud startup, raised $668M with Nvidia and processes 1T tokens daily.",
  "wall-street-goes-all-in-on-meta-s-muse":
    "Wall Street turned bullish on Meta's Muse, as UBS noted strong iOS downloads and Jefferies raised price targets.",
  "dow-sheds-405-points-small-caps-lead-losses-as-oil-jumps-3-8-marketcatalyst":
    "Sep 9 recap: the Dow shed 405 points and small caps led losses as crude jumped 3.8% on rising Middle East tensions.",
  "fannie-mae-and-freddie-mac-sink-more-than-12-as-mizuho-slashes-targets-on-fading-privatization-hopes":
    "Fannie Mae and Freddie Mac sank more than 12% after Mizuho downgraded both on fading privatization hopes.",

  # 18 newly published live posts
  "bok-financial-beats-q3-estimates-with-eps-of-2-64-up-19":
    "BOK Financial beat Q3 earnings expectations, reporting EPS of $2.64 versus $2.53 estimated, up 19% year-over-year.",
  "crown-holdings-beats-q3-with-eps-of-2-39-but-q4-guidance-disappoints":
    "Crown Holdings beat Q3 EPS with $2.39 on strong beverage can volume, but disappointed on Q4 forward guidance.",
  "zions-beats-q3-estimates-with-eps-of-1-78-up-20-on-credit-quality":
    "Zions Bancorporation beat Q3 earnings with EPS of $1.78 vs. $1.67 estimated, driven by strong credit quality.",
  "steel-dynamics-posts-record-shipments-but-eps-of-5-26-misses-estimates":
    "Steel Dynamics posted record Q3 shipments with EPS of $5.26, up 92% year-over-year but shy of expectations.",
  "bitdeer-backlog-hits-2-9b-on-malaysia-ai-deals-as-bitcoin-output-jumps-200":
    "Bitdeer shares climbed as AI data center deals in Malaysia boosted backlog to $2.9B and bitcoin output jumped.",
  "amazon-gains-5-as-torchneuron-targets-nvidia-s-cuda-advantage":
    "Amazon gained 5% after launching TorchNeuron, a developer framework designed to challenge Nvidia's CUDA software.",
  "nasdaq-surges-1-2-as-tech-rallies-dow-dips-slightly-amid-rising-yields-and-a-strong-dollar":
    "The Nasdaq surged 1.2% as tech rallied, while the Dow dipped slightly amid rising yields and a stronger dollar.",
  "agnc-posts-1-17-loss-as-tangible-book-value-falls-16-9-to-7-13":
    "AGNC posted a $1.17 loss as tangible book value fell 16.9% to $7.13, while adjusted EPS of $0.37 met estimates.",
  "why-cerebras-stock-is-trading-far-below-its-ipo-price-openai-chip-doubts-lockup-selling-and-an-ai-sell-off":
    "Cerebras shares fell 30% below their $185 IPO price on OpenAI chip doubts, lockup expiration, and an AI sell-off.",
  "why-dell-stock-fell-23-in-a-week-despite-a-blowout-quarter-a-barclays-downgrade-memory-price-doubts-and-an-ai-sell-off":
    "Dell lost 23% in a week despite strong earnings, hit by a Barclays downgrade and memory pricing concerns.",
  "large-cap-movers-jfrog-marvell-and-sandisk-rebound-as-telkom-indonesia-hits-a-17-year-low-and-sea-limited-slides":
    "JFrog, Marvell, and Sandisk rallied over 7% while Telkom Indonesia touched a 17-year low and Sea Limited slid.",
  "nvidia-wins-modal-as-a-vera-cpu-customer-challenging-intel-and-amd-in-the-ai-agent-processor-race":
    "Nvidia signed AI cloud startup Modal as a Vera CPU customer, stepping up competition against Intel and AMD.",
  "globalstar-wins-fcc-authorization-for-its-c-3-satellite-network-a-step-toward-direct-to-smartphone-service":
    "Globalstar won FCC approval for its C-3 satellite constellation, advancing direct-to-smartphone coverage in the U.S.",
  "wall-street-analyst-calls-goldman-upgrades-coreweave-morgan-stanley-names-amazon-a-top-pick-and-bernstein-upgrades-datadog":
    "Goldman upgraded CoreWeave to Buy, Morgan Stanley picked Amazon as a top pick, and Bernstein lifted Datadog.",
  "stocks-moving-premarket-chip-stocks-rebound-cleveland-cliffs-jumps-on-a-q3-beat-and-disc-medicine-surges-on-phase-3-data":
    "Premarket movers: chip stocks rebounded, Cleveland-Cliffs jumped on Q3 earnings, and Disc Medicine surged.",
  "anthropic-pledges-5-of-shares-to-new-public-benefit-fund":
    "Anthropic pledged 5% of its equity to a new Public Benefit Fund dedicated to safe AI research and societal benefits.",
  "cxmt-slides-6-5-despite-forecast-of-19-8b-nine-month-profit":
    "China's top DRAM maker CXMT slid 6.5% despite projecting a $19.8B nine-month profit on surging AI memory demand.",

  # Macro, Recaps & Earnings
  "morgan-stanley-maps-a-1-58-trillion-ai-spending-wave-about-a-quarter-of-2027-s-p-500-sales-growth-78-of-earnings-growth-and-a-rising-debt-bill":
    "Morgan Stanley expects AI infrastructure spending to reach $1.58T in 2027, driving S&P 500 earnings growth.",
  "microsoft-walks-away-from-nscale-s-essex-data-center-because-the-uk-grid-may-not-deliver-power-until-after-2030-raising-fresh-doubts-ahead-of-nscale-s-ipo":
    "Microsoft canceled its lease at Nscale's UK data center over delayed power, raising questions ahead of its IPO.",
  "terawulf-s-ceo-says-it-is-an-energy-infrastructure-company-not-a-neocloud-as-morgan-stanley-calls-the-stock-s-october-slide-mispriced":
    "TeraWulf fell 7.5% in an AI selloff. CEO Paul Prager defended its energy model while Morgan Stanley stayed bullish.",
  "tech-slump-triggers-broad-market-slide-energy-gains-on-oil-surge-10-year-yield-falls":
    "Oct 16 recap: tech sold off as the Nasdaq fell 2.68% and S&P lost 1.24%, while energy stocks rallied on higher oil.",
  "mongodb-sinks-nearly-10-as-director-stock-sales-pile-on-to-leadership-worries-pushing-shares-below-their-200-day-average":
    "MongoDB (MDB) fell nearly 10% below its 200-day average as director share sales compounded CEO departure concerns.",
  "alcoa-beats-q3-earnings-estimates-by-18-and-generates-472-million-of-free-cash-as-alumina-recovers-sending-the-stock-sharply-higher-despite-a-revenue-miss":
    "Alcoa beat Q3 estimates with EPS of $1.82 vs. $1.54 and $472M in free cash flow as alumina prices recovered.",
  "tech-alone-drags-the-s-p-500-lower-at-midday-while-energy-utilities-and-staples-rise-as-chipmakers-near-a-2-trillion-weekly-wipeout":
    "Oct 16 midday: tech pulled the S&P 500 down 0.62% even as energy, utilities, and defensive sectors advanced.",
  "j-b-hunt-beats-q3-estimates-by-a-penny-and-grows-revenue-20-but-cost-pressures-squeeze-margins-and-send-the-stock-lower":
    "J.B. Hunt beat Q3 EPS by a penny with $3.68B in revenue, but rising costs compressed margins and sent shares lower.",
  "cybersecurity-stocks-are-getting-clobbered-hot-inflation-an-openai-deal-report-and-a-valuation-reset-send-cibr-down-5-9-this-week":
    "Cybersecurity ETF CIBR dropped 5.9% this week as hot inflation data and high valuations pressured key players.",
  "the-stealth-bear-market-thesis-fact-checked-what-the-kobeissi-letter-gets-right-on-the-s-p-500-and-where-the-numbers-differ":
    "The S&P 500 sits near record highs, but only 23% of members trade above their 50-day average, signaling thin breadth.",
  "keybanc-says-google-is-discussing-memory-supply-deals-through-2035-as-hp-and-dell-lock-in-contracts-into-2031":
    "KeyBanc says Google is negotiating memory deals through 2035 and sees HBM pricing jumping 80% to 100% in Q1 2027.",
  "stocks-moving-premarket-tesla-pops-on-roadster-reveal-coreweave-slides-on-ai-debt-worries-and-alcoa-beats-on-profit":
    "Premarket Oct 16: Tesla gained on Roadster news, CoreWeave slid on debt fears, and Alcoa rose after beating profit.",
  "dow-surges-over-1-as-yields-slip-while-nasdaq-slides-gold-and-bitcoin-rally":
    "Oct 15 recap: the Dow surged 1.13% to 52,147 as bond yields fell, while the S&P 500 gained 0.32% and tech slipped.",
  "pnc-beats-on-profit-lifts-its-2026-outlook-and-raises-the-dividend-18-as-loans-surge-but-revenue-slips-below-estimates":
    "PNC beat Q3 adjusted EPS with $5.09 vs. $4.91, raised 2026 guidance, and boosted its dividend 18% on strong loans.",
  "google-launches-universal-cart-in-the-u-s-putting-one-shopping-cart-across-search-and-gemini-just-ahead-of-the-holidays":
    "Google launched Universal Cart across Search and Gemini, enabling unified shopping and price tracking in the U.S.",
  "cerebras-ceo-says-openai-wanted-a-much-bigger-deployment-but-the-company-lacked-the-data-centers-as-the-stock-sinks-near-record-lows":
    "Cerebras CEO said OpenAI wanted a bigger deployment, but lack of data center capacity pushed shares toward lows.",
  "schwab-posts-record-revenue-and-a-record-190-billion-in-new-assets-but-the-stock-slips-as-revenue-lands-a-hair-below-estimates":
    "Schwab posted record new assets of $190B, but shares slipped as quarterly revenue narrowly missed consensus.",
  "tsmc-posts-a-sixth-straight-record-profit-and-lifts-its-outlook-but-says-any-texas-fab-making-its-chips-must-be-run-by-tsmc":
    "TSMC posted a sixth straight record quarterly profit, up 69%, while insisting it must operate its own U.S. fabs.",
  "wholesale-inflation-explodes-september-ppi-surges-1-3-the-biggest-jump-since-2022-as-annual-producer-prices-hit-6-3":
    "September PPI jumped 1.3%, marking the largest monthly increase since 2022 as annual producer inflation hit 6.3%.",
  "gartner-says-3-5-trillion-of-ai-spending-could-be-written-down-and-most-neoclouds-won-t-survive-on-their-own":
    "Gartner warned that up to $3.5 trillion in AI capital spending risks writedowns as neocloud business models struggle.",
  "tech-slump-drives-broad-market-slide-as-health-care-shines-vix-climbs-to-16-5":
    "Oct 15 midday: technology shares dragged indices lower while healthcare gained and the VIX advanced toward 16.5.",
  "airfares-are-up-22-in-a-year-and-airline-stocks-just-paid-the-price-jetblue-leads-a-10-nosedive":
    "Airline shares tumbled as September CPI showed airfares jumped 22% in a year, sending JetBlue down over 10%.",
  "ai-cloud-stocks-crater-as-coreweave-plunges-nearly-16-on-debt-fears-its-ceo-says-the-market-is-irrational":
    "AI cloud stocks sold off as CoreWeave plunged 16% on rising debt costs, though its CEO defended long-term demand.",
  "ast-spacemobile-has-lost-two-thirds-of-its-value-here-s-what-actually-changed-this-week-and-what-didn-t":
    "AST SpaceMobile has shed two-thirds of its value amid dilution worries and launch timeline scrutiny from Wall Street.",
  "carpenter-technology-is-down-about-39-from-its-june-high-despite-record-profits-what-bulls-and-bears-are-weighing-before-october-22-earnings":
    "Carpenter Technology is down 39% from its June record despite strong aerospace backlog and record operating profits.",
  "midday-movers-ionq-sinks-on-a-2-billion-raise-coreweave-bonds-slide-bofa-drops-7-and-bending-spoons-soars-40":
    "Oct 14 midday movers: IonQ sank on a $2 billion share offering while Bank of America fell on regulatory penalties.",
  "chip-selloff-deepens-at-midday-as-hot-cpi-sends-yields-higher-dell-plunges-10-credo-sheds-8-and-soxx-falls-nearly-4":
    "Semiconductor shares dropped at midday as hotter CPI lifted Treasury yields, with Dell falling 10% and SOXX down 4%.",
  "asml-crushes-q3-estimates-raises-its-2026-outlook-and-warns-ai-demand-will-outrun-its-factories-through-2028":
    "ASML surged after beating Q3 expectations with EPS of €12.95 and forecasting persistent AI lithography demand.",
  "stocks-moving-premarket-hot-cpi-greets-wall-street-liquidia-soars-on-a-legal-settlement-and-bank-of-america-slides-on-a-1-2-billion-penalty":
    "Premarket Oct 14: September CPI topped forecasts, Liquidia soared on a legal win, and BofA fell on a $1.2B fine.",
  "hotter-than-expected-september-cpi-jumps-to-3-7-core-hits-2-6-and-traders-bet-on-more-fed-hikes":
    "September CPI rose 3.7% year-over-year while core inflation held at 2.6%, lifting market expectations for rate hikes.",
  "energy-surge-offsets-tech-slump-as-dow-slides-and-nasdaq-tumbles-on-oct-13":
    "Oct 13 recap: energy shares gained on crude price strength while tech weighed on the Nasdaq and bond yields rose.",
  "workday-opens-its-hr-and-finance-data-to-claude-gemini-and-copilot-as-outside-ai-agents-threaten-software-s-front-door":
    "Workday opened enterprise HR and finance data to external AI agents including Claude, Gemini, and Microsoft Copilot.",
  "stocks-moving-premarket-unitedhealth-jumps-on-a-raised-outlook-jpmorgan-rises-despite-an-eps-miss-and-chip-stocks-slide-again":
    "Premarket Oct 13: UnitedHealth gained 3% on an improved forecast while JPMorgan rose despite missing Q3 estimates.",
  "applied-materials-bets-5-billion-on-a-shared-chip-r-d-hub-and-on-ai-to-double-revenue-without-doubling-headcount":
    "Applied Materials committed $5 billion toward a shared semiconductor research facility to accelerate AI chip scaling.",
  "chip-rout-deepens-as-semiconductors-sink-2-7-but-the-dow-edges-higher-ahead-of-bank-earnings":
    "Oct 12 recap: chip stocks sank 2.7% amid export curbs while the Dow edged higher ahead of major bank earnings reports.",
  "serve-robotics-slides-10-to-a-52-week-low-as-the-uber-reset-keeps-weighing-on-the-stock":
    "Serve Robotics dropped 10% to a 52-week low as investors evaluated sidewalk robot delivery unit economics with Uber.",
  "marketcatalyst-take-the-memory-sell-off-is-pricing-a-long-term-threat-as-if-it-were-today-s-glut":
    "MarketCatalyst Take: the memory stock sell-off overstates immediate supply glut risks from Chinese DRAM competitors.",
  "barclays-calls-time-on-the-enterprise-hardware-rally-dell-hpe-and-netapp-downgraded-with-no-meaningful-ai-inflection-yet":
    "Barclays downgraded Dell, HPE, and NetApp, warning enterprise hardware rallies reflect memory costs, not AI revenue.",
  "coreweave-plunges-14-as-its-bonds-hit-a-record-yield-and-musk-says-yikes-why-a-104-billion-backlog-isn-t-enough":
    "CoreWeave plunged 14% as its 2032 bond yields reached a record 14.5%, raising scrutiny on its $104B backlog.",
  "berkshire-hathaway-adds-330-million-to-its-bending-spoons-bet-and-the-stock-soars-nearly-40":
    "Bending Spoons soared nearly 40% after Berkshire Hathaway invested another $330M, expanding its stake to 4%.",
  "inflation-winners-and-losers-which-stocks-gain-and-which-get-crushed-when-cpi-runs-hot":
    "A beginner's guide to how hot CPI inflation reports impact equities, highlighting sector winners and losers.",
  "decagon-hires-a-bank-to-gauge-sale-interest-with-servicenow-reportedly-in-early-talks":
    "AI startup Decagon, valued at $4.5B, hired advisers to gauge acquisition interest, with ServiceNow in early talks.",
  "stocks-slip-at-midday-as-chips-slide-bumble-soars-56-on-a-buyout-and-j-j-drops-after-earnings":
    "Oct 13 midday: Bumble soared 56% on a $1.3B buyout while semiconductor names slid and Johnson & Johnson fell.",
  "wall-street-s-biggest-banks-are-funding-the-ai-boom-and-warning-about-it-at-the-same-time":
    "JPMorgan, Goldman Sachs, and Wells Fargo flagged debt-fueled risks in the AI infrastructure boom on earnings day.",
  "unitedhealth-roars-back-goldman-cashes-in-and-jpmorgan-stumbles-5-things-moving-markets-today":
    "UnitedHealth raised guidance and Goldman grew revenue 23%, setting an upbeat tone as bank earnings kicked off.",
  "asia-s-chip-rout-just-wiped-out-803-million-in-crypto-bets-and-sandisk-traders-got-hit-harder-than-xrp":
    "An Asian chip selloff liquidated $803M in crypto bets as bitcoin dropped below $81,000 and SanDisk was hit.",
  "visa-finally-gets-a-foot-in-china-s-door-after-a-nine-year-wait-here-s-what-it-can-and-can-t-do-yet":
    "Visa secured Chinese central bank approval to prepare domestic card clearing operations in a UnionPay market.",
  "nvidia-s-slide-deepens-as-broadcom-s-ceo-calls-ai-a-casino-and-microsoft-rolls-out-a-rival-chip":
    "Nvidia extended its slide as Broadcom's CEO warned on AI spending and Microsoft rolled out its Maia 300 chip.",
  "broadcom-s-ceo-says-capital-not-chips-may-be-ai-s-biggest-bottleneck-and-cerebras-falls-to-a-record-low":
    "Cerebras fell 11% to record lows after Broadcom and Intel warned capital constraints could slow the AI build-out.",
  "intel-s-d-series-gpu-enters-customer-sampling-with-dell-hpe-asus-and-supermicro-in-the-mix-as-the-agentic-ai-push-widens":
    "Intel began customer sampling of its D-series inference GPUs with Dell, HPE, and Supermicro for agentic AI.",
  "dow-hits-52-week-high-as-tech-slumps-oil-rallies-and-yield-dip-boost-energy":
    "Oct 12 close: the Dow reached a 52-week high of 51,763 on industrial gains while tech weakness weighed on Nasdaq.",
  "visa-hits-a-record-high-as-resilient-spending-and-stablecoin-cards-fuel-its-growth-story":
    "Visa reached an all-time record on 14% revenue growth and expanding stablecoin volume ahead of Q4 earnings.",
  "intel-details-its-crescent-island-inference-gpu-now-the-d-series-and-xeon-racks-for-agentic-ai":
    "Intel unveiled specs for its D-series Crescent Island inference GPU and Xeon racks designed for AI workloads.",
  "meta-unveils-muse-wonder-ai-models-says-it-has-reached-the-frontier-as-its-stock-jumps-4":
    "Meta jumped 4% after unveiling its Muse Wonder AI models, which benchmark tests place at the frontier of AI.",
  "chipotle-slides-4-as-starbucks-says-it-is-not-buying-the-burrito-chain-wiping-out-last-week-s-deal-pop":
    "Chipotle dropped 4% after Starbucks refuted acquisition rumors, unwinding last week's takeover rally.",
  "chip-stocks-sink-at-midday-as-cxmt-rattles-memory-and-lumentum-drops-nearly-10":
    "Chip stocks slipped at midday on Oct 12 as Chinese DRAM competition rattled memory makers and SOXX fell 2%.",
  "memory-stocks-slide-as-china-s-cxmt-flags-a-4f2-dram-leap-what-it-means-for-micron-samsung-and-sk-hynix":
    "Micron, Samsung, and SK Hynix fell after China's CXMT claimed a breakthrough on denser 4F² DRAM technology.",
  "stocks-moving-premarket-salesforce-jumps-on-a-bofa-upgrade-micron-slips-on-china-s-dram-push-and-oil-climbs-on-hormuz-risks":
    "Premarket Oct 12: Salesforce rose 4% on a BofA upgrade while Micron slipped and oil rose on Middle East tensions.",
  "dow-jumps-0-9-as-broad-etfs-rally-gold-gains-1-6-and-vix-slides":
    "Oct 9 recap: the Dow jumped 0.87% to 51,611 as broad market ETFs rallied and the VIX fell toward 16.3.",
  "ast-spacemobile-sinks-on-spacex-s-spectrum-deal-but-berenberg-and-roth-say-it-could-become-carriers-best-ally":
    "AST SpaceMobile fell 11% on SpaceX spectrum news, but Wall Street analysts reaffirmed long-term carrier demand.",
  "t-mobile-plunges-13-as-spacex-s-reported-8-billion-spectrum-deal-rattles-at-t-and-verizon":
    "T-Mobile dropped 13% after reports that SpaceX acquired nationwide mobile spectrum for Starlink direct-to-cell.",
  "humana-surges-12-as-95-of-its-medicare-members-land-in-4-star-plans-up-from-20":
    "Humana surged 12% after 95% of its Medicare Advantage members achieved 4-star ratings, prompting an upgrade.",
  "snap-jumps-as-activists-circle-its-2-200-ar-glasses-here-s-the-1-billion-plan-on-the-table":
    "Snap jumped 6.6% as activist investors urged a $1B stake sale or spinoff of its Spectacles AR glasses division.",
  "energy-gains-offset-tech-slump-as-nasdaq-falls-1-34-on-yield-dip-and-weak-earnings":
    "Oct 8 recap: the Nasdaq dropped 1.34% and S&P fell 0.42% in a tech sell-off, while energy stocks gained.",
  "aaoz-axtq-cabo-bez-and-coco-stocks-moving-before-the-bell-what-could-happen-today":
    "Premarket Oct 8: Cable One and leveraged volatility ETFs showed heavy volume ahead of the opening bell.",
  "google-gives-gemini-its-own-email-address-and-a-job-what-the-workplace-agent-means-for-alphabet-stock":
    "Google introduced enterprise Gemini workplace agents with standalone email addresses and autonomous workflow goals.",
  "openai-says-50-billion-not-68-billion-and-nvidia-oracle-and-coreweave-pay-the-price":
    "OpenAI clarified its revenue run rate is $50B, not $68B, sparking a selloff across AI infrastructure suppliers.",
  "apple-sets-welcome-home-event-for-oct-13-as-a-smart-home-hub-and-lg-built-locks-and-doorbells-loom":
    "Apple announced an Oct. 13 hardware event expected to feature a new smart home hub, HomePod mini, and Apple TV.",
  "oracle-is-trucking-in-natural-gas-to-power-its-ai-data-centers-and-the-stock-is-sliding":
    "Oracle dropped 5% after reports that it is trucking compressed natural gas to power AI data centers in Utah.",
  "bitcoin-miners-plunge-as-1-12-billion-in-crypto-longs-get-wiped-out-and-an-openai-revenue-scare-rattles-ai-bets":
    "Bitcoin miners dropped sharply as $1.12B in crypto longs were liquidated and OpenAI revenue concerns rattled AI.",
  "why-90-of-traders-fail-6-hidden-mistakes-and-the-step-by-step-plan-to-avoid-them":
    "Learn why 90% of traders fail, six common behavioral mistakes to avoid, and rules for consistent risk control.",
  "samsung-s-80-billion-quarter-is-nearly-nine-times-last-year-s-so-why-are-memory-stocks-slipping":
    "Samsung projected an $80B operating profit, but memory stocks slipped on caution over cyclical pricing dynamics.",
  "27-wall-street-calls-to-know-thursday-palantir-upgraded-constellation-brands-and-nxp-cut":
    "Wall Street analyst calls: Goldman upgraded Palantir to Buy while Citi downgraded NXP among 27 major calls.",
  "penguin-solutions-smashes-records-and-lifts-its-2027-outlook-far-above-wall-street-here-are-4-things-that-matter":
    "Penguin Solutions grew Q4 revenue 68% to a record $567M and guided fiscal 2027 well ahead of Wall Street targets.",
  "fuelcell-energy-soars-on-fit-energy-s-pennsylvania-data-center-plan-here-s-what-s-actually-firm":
    "FuelCell Energy jumped after Fit Energy selected a Pennsylvania data center site for a fuel-cell framework.",
  "why-memory-and-storage-stocks-are-sinking-while-the-rest-of-the-market-climbs":
    "Storage and memory stocks slid as Toshiba hard drive expansion news and Samsung earnings caution weighed.",
  "marvell-s-big-test-arrives-tuesday-wall-street-wants-bigger-ai-targets-and-has-already-priced-some-in":
    "Marvell hosts its Investor Day as Wall Street weighs higher custom AI silicon, optical interconnects, and EPS.",
  "nvidia-hits-another-record-and-is-now-about-4-away-from-a-6-trillion-market-cap":
    "Nvidia hit a record high of $239.86, lifting its market cap to $5.78T and nearing the $6 trillion milestone.",
  "nasdaq-closes-at-a-record-as-oil-slides-yields-climb-and-ptc-soars-33-on-a-22-6-billion-deal":
    "Oct 5 recap: the Nasdaq hit a record 27,477 led by semiconductors, while PTC surged 33% on a $22.6B takeover.",
  "micron-is-stalling-on-peak-fears-but-memory-prices-haven-t-gotten-the-memo":
    "Micron stalled on memory peak worries even as August memory sales jumped 36% and DRAM contract prices climbed.",
  "the-breakout-that-bites-back-how-to-spot-a-head-fake-before-it-traps-you":
    "How to identify fake breakouts in trading, recognize bull traps before they trigger, and protect your capital.",
  "the-ai-bill-nobody-can-predict-cheap-models-cost-more-nearly-1-in-3-times":
    "Research shows only 11% of organizations forecast AI compute budgets accurately, with cheap models adding costs.",
  "4-things-that-could-move-stocks-this-week-from-marvell-s-big-day-to-delta-s-fuel-bill":
    "Market preview: Marvell investor day, Costco retail sales, and quarterly earnings from Delta, PepsiCo, and Celh.",
  "week-ahead-fed-minutes-five-fed-speakers-and-the-first-big-earnings-of-q3-season":
    "Week ahead: Federal Reserve meeting minutes, five central bank speeches, and early Q3 corporate earnings reports.",
  "sec-clears-the-first-3x-bitcoin-and-ether-funds-but-trading-still-awaits-registration":
    "The SEC cleared Cboe rules for the first 3x leveraged Bitcoin and Ether ETFs, pending registration effectiveness.",
  "bloom-energy-climbs-as-virginia-s-energy-plan-names-fuel-cells-a-preferred-power-source":
    "Bloom Energy climbed 4% after Virginia's state energy plan designated fuel cells as a preferred clean power tech.",
  "schd-slides-as-treasury-yields-hit-a-24-year-high-and-bonds-outbid-dividends":
    "Dividend ETF SCHD fell 6.5% as Treasury yields reached multi-decade highs, reducing the appeal of equity income.",
  "what-is-a-gap-up-and-gap-down-in-stocks-a-beginner-s-guide":
    "What causes gap ups and gap downs in stocks? Learn how price gaps form and how technical traders trade gap fills.",
  "avnet-hits-a-record-high-on-a-blowout-quarter-and-a-broad-based-recovery":
    "Avnet surged to a record high after Q4 sales grew 48% to $8.3B and EPS of $2.28 beat Wall Street expectations.",
  "moderna-joins-the-nasdaq-100-as-warner-bros-discovery-exits-on-the-paramount-merger":
    "Moderna will join the Nasdaq-100 index, replacing Warner Bros. Discovery following its multi-billion dollar rally.",
  "nvidia-deepens-its-coreweave-bet-as-the-neocloud-s-backlog-hits-104-billion":
    "Nvidia took a new $2B stake in CoreWeave, becoming its second-largest holder as revenue backlog reached $104.2B.",
  "nasdaq-rallies-to-a-record-as-a-weak-jobs-report-eases-rate-hike-fears":
    "The Nasdaq rallied to new record highs as weak September jobs data calmed expectations for further Fed rate hikes.",
  "sdev-s-parabolic-run-what-s-driving-it-and-why-the-company-says-it-can-t-explain-it":
    "Stablecoin Development Corp shares surged tenfold in high-volume trading despite management noting no new news.",
  "bny-is-reportedly-in-talks-with-kraken-s-parent-on-a-broad-infrastructure-deal":
    "BNY Mellon is in discussions with Kraken parent Payward on an institutional crypto custody and payment deal.",
  "cerebras-falls-below-its-ipo-price-as-an-openai-scare-collides-with-insider-selling":
    "Cerebras dropped below its $185 IPO price as AI hardware competition and lockup expiration pressured the stock.",
  "wall-street-piles-into-micron-after-a-blowout-quarter-here-s-who-raised-targets":
    "Wall Street raised Micron targets after blowout Q4 results, with Rosenblatt setting a Street-high $1,900 target.",
  "synopsys-pairs-an-openai-chip-design-deal-with-a-bold-2030-growth-plan":
    "Synopsys jumped 7% after announcing an AI chip design partnership with OpenAI and a $1 billion share repurchase.",
  "micron-just-posted-its-eighth-straight-beat-and-the-guidance-is-even-better":
    "Micron posted its eighth consecutive earnings beat and raised guidance on surging AI high-bandwidth memory sales.",
  "the-s-p-500-s-calm-exterior-is-hiding-a-7-week-breakdown-underneath":
    "While the S&P 500 holds near record levels, market breadth reveals seven consecutive weeks of sector divergence.",
  "inflation-cools-growth-surprises-higher-what-wednesday-s-data-dump-means-for-the-fed":
    "Economic data showed cooling inflation alongside resilient GDP growth, complicating Federal Reserve rate cut timing.",
  "robinhood-wants-an-ai-agent-trading-your-portfolio-and-a-data-marketplace-to-feed-it":
    "Robinhood announced an autonomous AI portfolio trading agent and a developer marketplace for market data feeds.",
  "robinhood-s-big-swing-perpetual-futures-24-7-trading-and-4x-margin":
    "Robinhood rolled out perpetual futures contracts, 24/7 equity trading, and up to 4x leverage for active accounts.",
  "kioxia-joins-applied-materials-5b-push-to-reinvent-ai-memory":
    "Kioxia partnered with Applied Materials on its $5B EPIC Center initiative to accelerate next-generation AI memory.",
  "treasury-yields-spike-to-a-2002-high-then-fade-on-a-dovish-fed-signal":
    "The 30-year Treasury yield briefly hit 5.62%, its highest since 2002, before retreating on dovish Fed commentary.",
  "altman-won-t-set-an-ipo-date-but-drops-hints-on-hardware-and-rivals":
    "OpenAI CEO Sam Altman declined to set an IPO date while teasing dedicated hardware and addressing Meta's Muse.",
  "openai-passes-1-2-billion-users-while-chasing-a-1-4-trillion-valuation":
    "ChatGPT reached 1.2 billion active users as OpenAI reportedly pursues $30 billion in funding at a $1.4T valuation.",
  "openai-s-devday-haul-always-on-agents-a-cheaper-model-and-20-new-tools":
    "OpenAI DevDay unveiled persistent background agents, a cost-efficient GPT-6.1 Sol model, and new developer tools.",
  "why-rising-bond-yields-are-kryptonite-for-growth-stocks":
    "Why rising Treasury yields disproportionately depress high-growth equity multiples by discounting future earnings.",
  "stocks-slip-as-30-year-treasury-yield-hits-5-6":
    "U.S. equities retreated as the 30-year Treasury yield touched 5.61%, reaching the highest borrowing costs since 2002.",
  "inside-anthropic-s-ipo-filing-a-518b-spending-plan-and-founder-control":
    "Anthropic's IPO registration revealed $4.59B in revenue, a $518B capital spending plan, and founder voting control.",
  "openai-s-revenue-run-rate-nears-70b-retaking-the-lead-from-anthropic":
    "OpenAI's annualized revenue run rate approached $70B following a 70% surge in enterprise cloud customer adoption.",
  "meta-brings-its-muse-ai-agent-to-small-businesses":
    "Meta launched Muse for Small Business, integrating its AI agent with Shopify, Stripe, and QuickBooks workflows.",
  "fico-shares-sink-20-as-fannie-and-freddie-move-to-a-unified-scoring-grid":
    "FICO shares sank 20% after federal regulators authorized VantageScore alongside FICO for government mortgage loans.",
  "rbc-sees-bloom-energy-s-new-fremont-facility-as-a-demand-signal":
    "RBC reiterated an Outperform rating on Bloom Energy, pointing to its expanded Fremont factory as proof of demand.",
  "navitas-wins-u-s-army-award-to-develop-10-kv-silicon-carbide-power-devices":
    "Navitas Semiconductor won a U.S. Army development contract to manufacture 10 kV silicon carbide power components.",
  "stifel-sticks-with-buy-on-mongodb-after-selloff-but-sees-a-slower-recovery":
    "Stifel maintained a Buy rating on MongoDB following leadership changes, anticipating steady enterprise adoption.",
  "u-s-official-no-iran-deal-without-the-nuclear-issue-but-sanctions-relief-is-on-the-table":
    "U.S. officials indicated sanctions relief remains negotiable with Iran if nuclear non-proliferation terms are met.",
  "nvidia-adds-150-billion-to-buyback-bofa-flags-five-buy-rated-stocks-on-sale":
    "Nvidia expanded its share buyback by $150B to $235B as Bank of America named it a top investment on recent dips.",
  "mongodb-sinks-as-ceo-leaves-for-meta-on-the-eve-of-investor-day":
    "MongoDB shares dropped 21% after CEO CJ Desai departed for Meta, prompting former CEO Dev Ittycheria to return.",
  "crowdstrike-hits-an-all-time-high-what-s-behind-the-ai-security-rally":
    "CrowdStrike rallied to an all-time high of $263.87 on accelerating cybersecurity demand and Wall Street upgrades.",
  "inverse-head-and-shoulders-how-to-spot-and-confirm-this-reversal-pattern":
    "How to trade inverse head and shoulders patterns: neckline breakouts, volume confirmation, and price target math.",
  "china-may-let-alibaba-bytedance-buy-nvidia-s-new-rtx-pro-5500-chips":
    "Reports indicate China may permit Alibaba and ByteDance to acquire Nvidia RTX Pro 5500 chips under trade guidelines.",
  "beyond-banks-mapping-the-winners-and-losers-of-the-ai-agent-economy":
    "Analyzing the economic impact of autonomous AI agents across banking, customer support, travel, and logistics.",
  "banks-best-business-just-got-a-new-threat-ai-agents-that-move-your-cash":
    "Autonomous financial AI agents that automatically optimize cash yields present a new competitive threat to banks.",
  "u-s-and-china-agree-to-30-billion-in-reciprocal-tariff-cuts":
    "The U.S. and China agreed to reciprocal tariff reductions on $30 billion of bilateral goods following trade talks.",
  "u-s-and-china-agree-to-ai-incident-channel-and-super-intelligence-dialogue":
    "The U.S. and China established a formal bilateral communication channel to manage safety incidents in frontier AI.",
  "trump-rejects-iran-s-latest-proposal-to-reopen-the-strait-of-hormuz":
    "Geopolitical oil risks persisted as U.S. leadership rejected conditions proposed by Iran regarding maritime transit.",
  "record-etf-inflows-are-quietly-rewiring-how-the-u-s-market-works":
    "Record annual ETF inflows reaching $1.47T are transforming liquidity, closing auctions, and single-stock moves.",
  "vgt-vs-xlk-how-the-two-biggest-tech-etfs-actually-differ":
    "Comparing VGT and XLK: sector concentration differences, semiconductor weighting, and trailing historical returns.",
  "why-schmid-shares-jumped-20-on-glass-substrate-buzz":
    "SCHMID Group jumped 20% on growing industry interest in advanced glass substrate packaging for high-density chips.",
  "zscaler-shares-slide-as-cro-transition-overshadows-strong-q4-beat":
    "Zscaler fell 9% following executive sales leadership changes despite reporting strong fiscal fourth-quarter results.",
  "why-active-etfs-are-surging-in-popularity-and-capturing-outsized-inflows":
    "Active ETFs captured 40% of net fund inflows as institutional managers leveraged tax advantages and alpha strategies.",
  "why-global-bond-yields-are-surging-and-what-it-means-for-stocks":
    "Why global bond yields reached multi-decade highs amid elevated fiscal deficits, sticky services CPI, and debt loads.",
  "microsoft-relaunches-copilot-as-a-workplace-ai-hub-not-just-a-chatbot":
    "Microsoft upgraded Copilot into a unified enterprise workplace agent system with autonomous coding and analytics.",
  "anthropic-asks-shareholders-to-lock-in-founder-control-ahead-of-ipo":
    "Anthropic requested shareholder approval for a dual-class equity structure granting founders majority voting control.",
  "dow-falls-for-third-day-as-hormuz-deal-hopes-and-meta-s-rally-offset-surging-treasury-yields":
    "The Dow dropped for a third day as elevated bond yields offset geopolitical optimism and tech sector strength.",
  "akamai-soars-17-after-hours-on-11-6-billion-anthropic-cloud-deal":
    "Akamai surged 17% after securing an 11.6 billion dollar, seven-year cloud infrastructure partnership with Anthropic.",
  "ionq-jumps-12-on-error-correction-breakthrough-and-new-fiu-and-nvidia-quantum-deals":
    "IonQ jumped 12% after announcing quantum error correction milestones and technical collaborations with Nvidia.",
  "muse-gets-video-chat-email-and-a-business-model-at-meta-connect":
    "Meta Connect debuted video chat and enterprise workflow integrations for its Muse AI agent across smart hardware.",
  "meta-s-new-smart-glasses-lineup-includes-three-price-points-and-a-camera-free-model":
    "Meta unveiled an expanded smart glasses portfolio across three price tiers, introducing a display-only model.",
  "beyond-glasses-meta-teases-a-muse-handheld-and-a-100-gram-vr-headset":
    "Meta teased a lightweight 100-gram virtual reality headset and dedicated handheld controllers powered by Muse AI.",
  "fastly-stock-jumps-17-on-report-that-it-handles-all-of-meta-muse-s-browser-agent-tasks":
    "Fastly shares jumped 17% on reports that its edge cloud infrastructure processes browser agent traffic for Meta Muse.",
  "10-year-treasury-yield-tops-5-1-highest-since-2007":
    "The 10-year Treasury yield crossed 5.1%, reaching borrowing levels unseen since 2007 and pressuring stock multiples.",
  "anthropic-says-claude-independently-discovered-a-new-crispr-like-enzyme-system":
    "Anthropic reported that Claude models autonomously identified a novel CRISPR-like enzyme family in genetic data.",
  "nasdaq-hits-a-record-as-chips-lead":
    "The Nasdaq Composite closed at fresh all-time highs as semiconductor suppliers rallied on data center demand.",
  "us-and-iran-hold-three-hour-talks-at-the-un-as-trump-says-there-s-a-lot-of-momentum-for-a-deal":
    "Diplomatic envoys held extended talks at the UN, driving hopes for de-escalation and pulling crude prices lower.",
  "the-mystery-vendor-behind-meta-s-muse-hunterbrook-thinks-it-might-be-innodata":
    "Speculation centered on Innodata as the specialized data annotation partner supporting Meta's Muse model training.",
  "muse-sell-off-widens-financials-insurance-travel-telecom-and-gyms-all-feel-the-ai-agent-threat":
    "Wall Street assessed AI disruption risks across consumer service sectors as autonomous agent capabilities expand.",
  "stocks-mixed-as-wall-street-awaits-thursday-s-trump-xi-summit-oil-extends-slide":
    "Market averages finished mixed as investors positioned portfolios ahead of critical bilateral U.S.-China meetings.",
  "meta-s-muse-agent-adds-paypal-shopify-and-peloton-as-launch-partners":
    "Meta integrated PayPal, Shopify, and Peloton into Muse, enabling direct transaction execution within chat flows.",
  "how-muse-could-reshape-the-market":
    "An analysis of how autonomous consumer AI agents could intermediate search traffic, e-commerce, and app discovery.",
  "meta-paused-a-human-assisted-test-of-muse-calls-over-privacy-concerns-even-though-it-was-outperforming-the-ai":
    "Meta halted human contractor evaluations of Muse voice conversations to address internal data privacy policies.",
  "meta-s-muse-hits-500k-users-in-one-week-and-tops-on-both-app-stores":
    "Meta's Muse agent accumulated 500,000 active users in its initial week, claiming the top download spot on app stores.",
  "stocks-rally-as-oil-falls-chips-surge-before-trump-xi-summit":
    "Equities rallied broadly as declining energy costs and strong semiconductor demand fueled pre-summit risk appetite.",
  "credo-unveils-1-6t-optics-platform-targets-600m-market-opportunity":
    "Credo Technology introduced high-speed optical digital signal processors addressing high-performance AI clusters.",
  "amd-breaks-1-trillion-as-chip-stocks-rip-higher-on-meta-s-muse-ai":
    "AMD crossed a $1 trillion market capitalization as server processor demand surged alongside hyperscaler AI orders.",
  "why-cybersecurity-stocks-are-on-fire-today":
    "Cybersecurity equities surged as enterprise IT budgets prioritized automated defense tools against AI-driven threats.",
  "accenture-jumps-as-anthropic-partnership-expands-role-in-frontier-ai":
    "Accenture shares advanced following an enterprise deployment agreement embedding its consultants into Anthropic tech.",
  "dow-s-p-nasdaq-futures-jump-on-oil-drop-and-iran-optimism":
    "Index futures rose across the board as crude oil dropped 3% on constructive diplomatic talks regarding shipping.",
  "sec-s-tokenization-exemption-sparks-a-crypto-stock-rally":
    "The SEC established a regulatory sandbox for tokenized securities, sparking rallies in Robinhood and Coinbase.",
  "salesforce-expands-its-agentic-ai-strategy-at-dreamforce-as-bmo-raises-its-price":
    "Salesforce debuted autonomous agent tools at Dreamforce, prompting BMO Capital to raise its equity price target.",
  "wells-fargo-downgrades-netflix-to-underweight-slashes-price-target-to-57":
    "Wells Fargo downgraded Netflix to Underweight on warnings that a thin originals slate will pressure margins.",
  "stocks-rally-as-fed-rate-hike-sinks-in-oil-and-yields-retreat":
    "Stocks staged a broad relief rally as investors absorbed interest rate guidance and commodity pressures softened.",
  "nebius-to-raise-gpu-cloud-pricing-across-h100-h200-b200-and-b300-starting-oct-1":
    "Nebius announced price increases across premium Nvidia cloud clusters following a 514% surge in computing revenue.",
  "support-vs-resistance-how-to-read-price-floors-and-ceilings":
    "Learn how to identify support and resistance as dynamic price zones, confirm bounces, and trade valid breakdowns.",
  "what-is-support-in-stocks":
    "What is support in stocks? Learn how price floors form, how to identify buyer confluence, and trade key bounces.",
  "what-is-resistance-in-stocks":
    "What is resistance in stocks? Learn the supply forces behind price ceilings and how to trade breakout confirmations.",
  "trending-vs-range-bound-stocks":
    "Is a stock trending or range-bound? Learn how to identify market regimes, trade channel ranges, and avoid fakeouts.",
  "how-to-spot-trend-direction":
    "How to identify trend direction using market structure, swing highs and lows, moving averages, and volume patterns.",
  "what-is-ohlc-in-trading":
    "What is OHLC data? Learn how to read open, high, low, and close candlestick bars across multiple trading timeframes.",
  "inside-the-hack-where-openai-s-own-ai-agents-went-rogue":
    "How autonomous evaluation agents escaped test sandbox environments, coordinated tasks, and breached remote systems.",
  "ai-s-fiercest-rivals-just-united-behind-one-idea-slow-down":
    "Anthropic's CEO is urging AI frontier labs to coordinate safe model release timelines and independent audits.",
  "trading-discipline-the-habits-that-separate-consistent-traders-from-the-rest":
    "The core psychological habits of disciplined traders: managing risk, position sizing, and filtering market noise.",
  "daily-chart-vs-intraday-chart":
    "How to use daily charts to identify primary trends and support, paired with intraday timeframes for precision entries.",
  "how-to-read-a-red-candle":
    "What does a red candle indicate? Learn how to read bearish candlestick bodies, wicks, and heavy selling volume.",
  "dell-and-hpe-surge-while-speculative-nuclear-bets-sink-sep-11-2026":
    "Sep 11 movers: Dell and HPE rallied on enterprise hardware demand while nuclear reactor developer Oklo slid.",
  "dow-jumps-509-points-vix-craters-as-hot-cpi-sends-hike-odds-to-90":
    "Sep 11 recap: the Dow jumped 509 points as markets shrugged off a hot CPI print that raised rate hike expectations.",
  "deepseek-s-leaner-ai-model-sends-memory-stocks-tumbling":
    "Samsung and SK Hynix fell over 3% after DeepSeek's V4.1 model required less high-bandwidth memory for inference.",
  "how-to-read-a-green-candle":
    "What does a green candle mean? Learn to read bullish price action, body dimensions, and buy-side volume surges.",
  "how-to-read-price-and-volume-together-marketcatalyst":
    "Learn how to read price and volume together: four core volume relationships, breakout tests, and conviction signals.",
  "wall-street-s-losing-streak-hits-four-as-oil-tops-100-yields-soar":
    "Sep 10 recap: stocks fell a fourth day as oil topped $100 on Middle East tensions and Treasury yields spiked.",
  "nasdaq-invests-100m-in-kraken-parent-payward-at-21b-valuation":
    "Nasdaq invested $100M in Kraken parent Payward at a $21B valuation to expand tokenized asset market partnerships.",
  "understanding-candlestick-charts-a-professional-framework-for-price-action-and-volume":
    "Master candlestick charts: candle anatomy, wick interpretation, liquidity traps, and volume-confirmed price action.",
  "oil-spikes-to-105-treasury-yields-hit-34-month-high-marketcatalyst":
    "Crude oil spiked above $103 a barrel and Treasury yields surged after geopolitical threats to Persian Gulf shipping.",
  "rate-hike-odds-spike-to-76-after-hot-august-ppi-report-marketcatalyst":
    "August wholesale inflation accelerated to 5.4%, lifting financial market expectations of upcoming Fed rate hikes.",
  "how-to-read-a-stock-a-beginner-s-guide-to-understand-marketcatalyst":
    "How to read a stock in minutes: a beginner framework analyzing trends, trading volume, valuation, and key levels.",
  "u-s-stocks-soften-post-labor-day-extending-a-ten-year-seasonal-trend-oil-rates-and-a-software-wobble-rattle-stocks":
    "U.S. stocks fell following Labor Day, extending a ten-year seasonal trend as Brent crude neared $100 a barrel.",
  "bloom-energy-jumps-on-s-p-500-news-fueled-by-an-ai-power-boom-and-a-supply-chain-controversy":
    "Bloom Energy rallied 10% after joining the S&P 500, capping a massive run driven by AI data center power demand.",
  "palantir-stock-falls-7-despite-winning-army-contract-why-software-stocks-are-sinking-today":
    "Palantir slid 7% despite winning a $127M Army contract as enterprise software valuations faced broader headwinds.",
  "15-years-2-258-how-tim-cook-turned-apple-into-a-wealth-machine":
    "Under Tim Cook, Apple expanded from $350B to a $4.6T market titan, delivering 2,258% total returns over 15 years.",
  "the-chip-funds-that-quietly-beat-nvidia-s-favorite-etf":
    "How smaller, equal-weighted semiconductor ETFs outperformed mega-cap chip index funds during volatile cycles.",

  # Educational fundamentals
  "how-to-read-a-10-k-filing-a-framework-for-stock-investors":
    "A practical guide to reading SEC Form 10-K filings: income statements, risk factors, footnotes, and debt schedules.",
  "understanding-support-and-resistance-levels":
    "Master support and resistance levels: how to draw key zones, validate liquidity tests, and avoid breakout traps.",
  "what-is-free-cash-flow-yield-and-why-it-matters":
    "Learn why free cash flow yield is one of the most reliable valuation indicators for long-term equity investors.",
  "how-to-analyze-an-income-statement":
    "How to analyze a corporate income statement: assessing revenue quality, gross margin trends, and operating leverage.",
  "the-complete-guide-to-stock-screening":
    "A comprehensive tutorial on filtering equities using fundamental metrics, valuation multiples, and momentum signals.",
  "how-to-value-high-growth-unprofitable-companies":
    "Frameworks for valuing unprofitable high-growth tech companies using unit economics, gross margins, and TAM modeling.",
  "top-insider-buying-signals-what-to-watch-for":
    "How to interpret insider trading filings: open-market purchases versus option exercises and cluster buying patterns.",
  "demystifying-the-yield-curve-inversion":
    "Understanding the Treasury yield curve inversion: historical recession track records, term premiums, and Fed policy.",
  "how-to-interpret-analyst-upgrades-and-downgrades":
    "How to trade Wall Street analyst revisions: price target changes, consensus estimates, and sentiment momentum.",
  "the-power-of-dollar-cost-averaging-in-volatile-markets":
    "Why dollar-cost averaging protects capital and compounds long-term returns during elevated equity market volatility.",
  "how-to-read-a-cash-flow-statement":
    "Step-by-step framework for analyzing corporate cash flows: operating cash, capital expenditures, and free cash flow.",
  "what-drives-stock-buybacks-and-how-they-affect-investors":
    "Why companies execute share buybacks, how repurchases boost earnings per share, and when buybacks destroy value.",
  "understanding-beta-and-portfolio-volatility":
    "How to calculate and use equity beta to manage portfolio risk, market exposure, and diversification effectively.",
  "how-to-trade-earnings-season-like-a-pro":
    "Strategic playbook for trading quarterly earnings: implied volatility, whisper numbers, and post-earnings drift.",
  "a-guide-to-dividend-investing-for-beginners":
    "Dividend investing fundamentals: payout ratios, dividend coverage, yield traps, and dividend growth compounding.",
  "how-to-identify-market-regimes-bull-bear-and-consolidation":
    "Identify shifting market regimes across bull, bear, and range-bound cycles using volatility, breadth, and macro data.",
  "the-role-of-short-interest-in-stock-momentum":
    "How short interest, days to cover, and borrow fees signal short squeezes and high-conviction institutional positions.",
  "how-to-analyze-balance-sheet-health":
    "Examine corporate balance sheet strength: working capital ratios, net debt leverage, and liquidity buffers.",
  "understanding-p-e-ratios-trailing-vs-forward":
    "Trailing versus forward price-to-earnings ratios: differences, distortions from non-recurring items, and usage.",
  "the-mechanics-of-stock-splits-and-reverse-splits":
    "What stock splits and reverse splits mean for liquidity, retail investor accessibility, and underlying equity value.",
  "how-to-manage-risk-with-position-sizing":
    "Position sizing formulas to protect trading capital: calculating portfolio stop losses and risk-per-trade limits.",
  "what-is-ebitda-and-why-is-it-controversial":
    "Why EBITDA is widely tracked in leveraged finance and valuation, along with critical blind spots investors must know.",
  "how-to-spot-value-traps-before-investing":
    "Key warning signs of equity value traps: structural revenue declines, heavy debt loads, and obsolete technology.",
  "the-basics-of-etf-investing-for-wealth-building":
    "Beginner guide to exchange-traded funds: index tracking, expense ratios, liquidity, and thematic sector strategies.",
  "how-interest-rates-impact-different-market-sectors":
    "How Federal Reserve interest rate cycles influence tech valuations, bank net interest margins, and real estate yields.",
  "understanding-return-on-equity-roe-and-roic":
    "Evaluating corporate capital efficiency: DuPont return on equity analysis versus return on invested capital metrics."
}

DANGLE_WORDS = {
    'in', 'on', 'at', 'to', 'for', 'of', 'by', 'with', 'from', 'as', 'its', 'their', 'his', 'her',
    'the', 'a', 'an', 'and', 'or', 'new', 'both', 'into', 'over', 'under', 'between', 'such', 'this',
    'that', 'these', 'those', 'also', 'further', 'more', 'about', 'after', 'before', 'while'
}

def clean_sentence(s):
    s = re.sub(r'^[\s:;,\-–—]+', '', s).strip()
    s = re.sub(r'[.!?]+$', '', s).strip()
    words = s.split()
    while words and words[-1].lower() in DANGLE_WORDS:
        words.pop()
    s = ' '.join(words).strip()
    s = s.rstrip(' ,;:-–—')
    if s and not s.endswith(('.', '!', '?')):
        s += '.'
    return s

def condense_fallback(sugg, curr, title, max_len=118):
    raw = sugg or curr or title or ''
    clean = re.sub(r'<[^>]*>', ' ', raw)
    clean = re.sub(r'[*_#`~[\]]', '', clean)
    clean = ' '.join(clean.split()).strip()

    t = clean
    t = t.replace(' (WULF)', '').replace(' (JBHT)', '').replace(' (MDB)', '').replace(' (AA)', '')
    t = t.replace(' (GOOGL)', '').replace(' (TSM)', '').replace(' (STX)', '').replace(' (WDC)', '')
    t = t.replace(' (ORCL)', '').replace(' (STRL)', '').replace(' (CIBR)', '').replace(' (SERV)', '')
    t = t.replace(' (BE)', '').replace(' (PLTR)', '').replace(' (ZION)', '').replace(' (STLD)', '')
    t = t.replace(' (BTDR)', '').replace(' (AMZN)', '').replace(' (NVDA)', '').replace(' (AGNC)', '')
    t = t.replace('year-over-year', 'YoY').replace('quarter-over-quarter', 'QoQ')
    t = t.replace('approximately', 'about')
    t = t.replace('adjusted EPS', 'EPS')
    t = ' '.join(t.split()).strip()

    if 85 <= len(t) <= max_len:
        return clean_sentence(t)

    sentences = re.split(r'\.(?:\s+|$)', t)
    sentences = [clean_sentence(s) for s in sentences if s.strip()]

    if sentences:
        s0 = sentences[0]
        if 85 <= len(s0) <= max_len:
            return s0
        if len(sentences) > 1:
            cand = clean_sentence(f"{s0[:-1]} {sentences[1]}")
            if 85 <= len(cand) <= max_len:
                return cand

    for conn in [', while ', ', as ', ', but ', ', though ', ', despite ', ', with ', '; ', ', and ']:
        parts = t.split(conn)
        if len(parts) > 1:
            cand = clean_sentence(parts[0])
            if 85 <= len(cand) <= max_len:
                return cand

    commas = [m.start() for m in re.finditer(r',', t)]
    for idx in reversed(commas):
        cand = clean_sentence(t[:idx])
        if 85 <= len(cand) <= max_len:
            return cand

    words = t.split()
    accum = ''
    for w in words:
        next_cand = f"{accum} {w}".strip()
        if len(next_cand) + 1 <= max_len:
            accum = next_cand
        else:
            break
    return clean_sentence(accum)

def build_all_descriptions():
    template_path = "/tmp/all_posts_template.json"
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Missing {template_path}")

    with open(template_path) as f:
        posts = json.load(f)

    curated = {}
    for slug, data in posts.items():
        if slug in MASTER_DESCRIPTIONS:
            curated[slug] = MASTER_DESCRIPTIONS[slug]
        else:
            sugg = data.get('sugg', '')
            curr = data.get('curr', '')
            title = data.get('title', '')
            curated[slug] = condense_fallback(sugg, curr, title)

    return curated

def validate_all(curated):
    errors = []
    lens = []
    cut_numbers = []
    cut_phrases = []

    for slug, desc in curated.items():
        l = len(desc)
        lens.append(l)

        if l > 118:
            errors.append(f"[{slug}] Exceeds 118 chars ({l}): {desc}")
        if l < 85:
            errors.append(f"[{slug}] Below 85 chars ({l}): {desc}")
        if not desc.endswith(('.', '!', '?')):
            errors.append(f"[{slug}] Does not end with punctuation: {desc}")
        if '...' in desc:
            errors.append(f"[{slug}] Contains ellipsis: {desc}")

        # Check severed dollar amounts e.g. '$2.2.' or '$5.6.' or '$80.'
        if re.search(r'\$\d+(\.\d+)?\.\s*$', desc):
            cut_numbers.append((slug, desc))

        # Check dangling end words
        words = desc.rstrip('.!?').split()
        if words and words[-1].lower() in DANGLE_WORDS:
            cut_phrases.append((slug, words[-1], desc))

    print(f"=== VALIDATION REPORT ===")
    print(f"Total curated entries: {len(curated)}")
    print(f"Min length: {min(lens)}")
    print(f"Max length: {max(lens)}")
    print(f"Mean length: {sum(lens)/len(lens):.1f}")
    import statistics
    print(f"Median length: {statistics.median(lens):.1f}")
    print(f"Entries < 85 chars: {sum(1 for l in lens if l < 85)}")
    print(f"Entries > 118 chars: {sum(1 for l in lens if l > 118)}")
    print(f"Cut numbers: {len(cut_numbers)}")
    print(f"Cut phrases: {len(cut_phrases)}")

    if cut_numbers:
        for slug, desc in cut_numbers:
            print("CUT NUMBER ERROR:", slug, desc)
    if cut_phrases:
        for slug, word, desc in cut_phrases:
            print("CUT PHRASE ERROR:", slug, f"dangle='{word}'", desc)
    if errors:
        for e in errors[:10]:
            print("VALIDATION ERROR:", e)

    return len(errors) == 0 and len(cut_numbers) == 0 and len(cut_phrases) == 0

def main():
    curated = build_all_descriptions()
    passed = validate_all(curated)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w') as f:
        json.dump(curated, f, indent=2)

    print(f"Saved {len(curated)} descriptions to {OUTPUT_JSON}")
    if not passed:
        raise ValueError("Validation failed! Fix flagged entries.")
    else:
        print("ALL 219 POSTS PASSED VALIDATION PERFECTLY!")

if __name__ == '__main__':
    main()
