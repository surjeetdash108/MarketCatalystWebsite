/**
 * Posts whose stored slug makes a URL over 115 characters (the SEO audit's
 * limit), as [stored slug, public slug].
 *
 * Only the URL changes. The post keeps its stored slug in Firestore, so
 * everything keyed by that slug (curated descriptions, read counts, the
 * duplicate and legacy tables) is untouched. Everything that builds a link or
 * reads a request goes through the helpers below:
 *
 *   - `postPath()` / `publicPostSlug()` turn a stored slug into the URL to link,
 *     list in the sitemap and canonicalise.
 *   - `storedPostSlug()` turns the slug in a request back into the stored one,
 *     so /posts/<public slug> finds its post.
 *   - next.config.ts 301s each stored slug to its public one, so the old
 *     address keeps its ranking and any link to it.
 *
 * New posts never need a line here: slugify() caps a slug at MAX_SLUG_CHARS
 * (lib/seo/shorten.ts). If one of these public slugs is ever given to a
 * different post, delete its line first or that post will be unreachable.
 *
 * Plain data with relative imports only: next.config.ts loads this at build time.
 */
export const SHORTENED_POSTS: [stored: string, short: string][] = [
  ["fedex-freight-jumps-16-in-first-standalone-report-as-fuel-lifts-revenue-to-3-3b-and-outlook-rises", "fedex-freight-jumps-16-in-first-standalone-report"],
  ["nasdaq-slides-as-intel-sinks-29-and-reddit-falls-24-while-onespan-capri-and-regeneron-surge", "nasdaq-slides-as-intel-sinks-29-and-reddit-falls-24"],
  ["sandisk-announces-8-for-1-stock-split-and-sees-data-centers-passing-55-of-nand-demand-in-2027", "sandisk-announces-8-for-1-stock-split"],
  ["regeneron-jumps-over-11-as-revenue-surges-36-to-5-1b-on-dupixent-profits-and-eylea-hd-growth", "regeneron-jumps-over-11-as-revenue-surges-36-to-5-1b-on-dupixent-profits"],
  ["grid-dynamics-surges-over-33-on-record-revenue-and-a-20-ebitda-margin-as-ai-reaches-31-of-sales", "grid-dynamics-surges-over-33-on-record-revenue-and-a-20-ebitda-margin"],
  ["walmart-commits-about-6b-to-symbotic-in-an-expanded-deal-that-could-add-6-92b-to-backlog", "walmart-commits-about-6b-to-symbotic-in-an-expanded-deal-that-could-add-6-92b"],
  ["amazon-discloses-up-to-80b-loan-facility-for-ai-infrastructure-as-free-cash-flow-turns-negative", "amazon-discloses-up-to-80b-loan-facility-for-ai-infrastructure"],
  ["amazon-sees-2027-capex-well-above-220b-as-jassy-targets-40-plus-aws-growth-through-2028", "amazon-sees-2027-capex-well-above-220b"],
  ["why-reddit-is-tanking-after-a-beat-google-ai-traffic-loss-a-soft-q4-guide-and-a-login-wall", "why-reddit-is-tanking-after-a-beat-google-ai-traffic-loss-a-soft-q4-guide"],
  ["alphabet-plunges-13-in-worst-day-ever-erasing-about-500b-as-ai-spending-turns-cash-flow-negative", "alphabet-plunges-13-in-worst-day-ever-erasing-about-500b"],
  ["stocks-moving-premarket-intel-plunges-25-on-a-weak-outlook-amazon-slides-on-cash-burn-and-reddit-craters", "stocks-moving-premarket-intel-plunges-25-on-a-weak-outlook-amazon-slides"],
  ["vertiv-lifts-2026-sales-outlook-650m-as-organic-orders-surge-over-100-led-by-the-americas", "vertiv-lifts-2026-sales-outlook-650m"],
  ["robinhood-falls-7-as-crypto-revenue-drops-55-but-a-0-07-fund-loss-drives-the-eps-miss", "robinhood-falls-7-as-crypto-revenue-drops-55"],
  ["spacex-pulls-back-from-government-launches-as-ai-takes-over-revenue-rattling-nasa-and-space-force", "spacex-pulls-back-from-government-launches"],
  ["fortinet-sprouts-and-servicenow-drop-17-to-22-after-hours-as-earnings-outlooks-disappoint", "fortinet-sprouts-and-servicenow-drop-17-to-22-after-hours"],
  ["t-mobile-plunges-13-as-spacex-s-reported-8-billion-spectrum-deal-rattles-at-t-and-verizon", "t-mobile-plunges-13-as-spacex-s-reported-8-billion-spectrum-deal-rattles-at-t"],
  ["google-gives-gemini-its-own-email-address-and-a-job-what-the-workplace-agent-means-for-alphabet-stock", "google-gives-gemini-its-own-email-address"],
  ["samsung-posts-record-80b-quarterly-profit-on-ai-memory-boom-but-net-profit-misses-by-16", "samsung-posts-record-80b-quarterly-profit-on-ai-memory-boom"],
  ["us-premarket-movers-early-gainers-decliners-and-key-morning-drivers-for-thursday-october-29-2026", "us-premarket-movers-early-gainers-decliners-and-key-morning-drivers"],
  ["sandisk-revenue-soars-to-11-03b-and-adjusted-eps-hits-49-51-as-ai-demand-lifts-pricing-power", "sandisk-revenue-soars-to-11-03b-and-adjusted-eps-hits-49-51"],
  ["wall-street-s-morning-calls-top-upgrades-downgrades-and-price-target-hikes-for-thursday-october-29-2026", "wall-street-s-morning-calls-top-upgrades-downgrades-and-price-target-hikes"],
  ["samsung-s-80-billion-quarter-is-nearly-nine-times-last-year-s-so-why-are-memory-stocks-slipping", "samsung-s-80-billion-quarter-is-nearly-nine-times-last-year-s-so-why-are-memory"],
  ["alphabet-s-cloud-revenue-doubles-to-30-7b-but-51b-capex-pushes-free-cash-flow-negative", "alphabet-s-cloud-revenue-doubles-to-30-7b"],
  ["sofi-jumps-11-as-record-1-4b-quarter-beats-estimates-guidance-rises-and-2027-target-hits-6-4b", "sofi-jumps-11-as-record-1-4b-quarter-beats-estimates-guidance-rises"],
  ["roblox-falls-12-after-hours-as-daily-users-drop-9-to-138m-despite-a-1-7b-bookings-beat", "roblox-falls-12-after-hours-as-daily-users-drop-9-to-138m"],
  ["microsoft-trims-capex-outlook-to-170b-on-gpu-delays-as-alphabet-holds-hitting-neocloud-stocks", "microsoft-trims-capex-outlook-to-170b-on-gpu-delays"],
  ["reddit-falls-17-after-hours-as-weak-q4-guidance-overshadows-a-q3-beat-on-895m-revenue", "reddit-falls-17-after-hours-as-weak-q4-guidance-overshadows-a-q3-beat"],
  ["amazon-falls-after-hours-as-77b-quarterly-capex-sends-free-cash-flow-to-42b-despite-aws-surge", "amazon-falls-after-hours-as-77b-quarterly-capex-sends-free-cash-flow-to-42b"],
  ["caterpillar-falls-9-7-despite-a-q3-beat-as-q4-dealer-destocking-and-tariffs-cloud-the-outlook", "caterpillar-falls-9-7-despite-a-q3-beat"],
  ["cheesecake-factory-posts-record-1-03b-as-flagship-comps-jump-15-2-and-adjusted-eps-rises-50", "cheesecake-factory-posts-record-1-03b"],
  ["cerebras-ceo-says-openai-wanted-a-much-bigger-deployment-but-the-company-lacked-the-data-centers-as-the-stock-sinks-near-record-lows", "cerebras-ceo-says-openai-wanted-a-much-bigger-deployment"],
  ["intel-agrees-to-buy-israeli-quantum-software-maker-classiq-to-build-a-full-stack-platform", "intel-agrees-to-buy-israeli-quantum-software-maker-classiq"],
  ["new-home-sales-slip-only-0-6-to-676-000-as-the-richmond-fed-manufacturing-index-holds-at-2", "new-home-sales-slip-only-0-6-to-676-000"],
  ["why-cerebras-stock-is-trading-far-below-its-ipo-price-openai-chip-doubts-lockup-selling-and-an-ai-sell-off", "why-cerebras-stock-is-trading-far-below-its-ipo-price-openai-chip-doubts-lockup"],
  ["nucor-beats-its-own-q3-guidance-with-5-80-eps-as-higher-steel-prices-lift-earnings-121", "nucor-beats-its-own-q3-guidance-with-5-80-eps"],
  ["boeing-plunges-9-as-737-max-rate-52-goal-slips-to-late-2027-and-core-loss-widens-to-0-34-a-share", "boeing-plunges-9-as-737-max-rate-52-goal-slips-to-late-2027-and-core-loss-widens"],
  ["phillips-edison-posts-record-renewal-rent-spreads-as-core-ffo-rises-9-and-guidance-edges-up", "phillips-edison-posts-record-renewal-rent-spreads"],
  ["palantir-stock-falls-7-despite-winning-army-contract-why-software-stocks-are-sinking-today", "palantir-stock-falls-7-despite-winning-army-contract-why-software-stocks"],
  ["anthropic-s-s-1-warns-of-existential-risks-unauthorized-ai-access-and-a-750b-compute-bill", "anthropic-s-s-1-warns-of-existential-risks-unauthorized-ai-access"],
  ["nasdaq-closes-at-a-record-as-oil-slides-yields-climb-and-ptc-soars-33-on-a-22-6-billion-deal", "nasdaq-closes-at-a-record-as-oil-slides-yields-climb-and-ptc-soars-33"],
  ["penguin-solutions-smashes-records-and-lifts-its-2027-outlook-far-above-wall-street-here-are-4-things-that-matter", "penguin-solutions-smashes-records"],
  ["inflation-winners-and-losers-which-stocks-gain-and-which-get-crushed-when-cpi-runs-hot", "inflation-winners-and-losers-which-stocks-gain"],
  ["intel-sinks-after-hours-as-q4-guidance-misses-and-pc-weakness-offsets-a-78-data-center-surge", "intel-sinks-after-hours-as-q4-guidance-misses"],
  ["microsoft-reportedly-offers-voluntary-buyouts-to-60-000-employees-27-of-its-workforce", "microsoft-reportedly-offers-voluntary-buyouts"],
  ["snap-jumps-as-activists-circle-its-2-200-ar-glasses-here-s-the-1-billion-plan-on-the-table", "snap-jumps-as-activists-circle-its-2-200-ar-glasses-here-s-the-1-billion-plan"],
  ["after-hours-movers-enphase-falls-14-costar-drops-11-and-manhattan-associates-jumps-10", "after-hours-movers-enphase-falls-14-costar-drops-11"],
  ["trump-administration-weighs-lifting-sanctions-on-russia-s-rdif-as-diesel-tankers-head-to-the-u-s", "trump-administration-weighs-lifting-sanctions-on-russia-s-rdif"],
  ["brazil-s-ibovespa-plunges-14-after-lula-s-win-but-the-country-s-volatility-index-is-down-40", "brazil-s-ibovespa-plunges-14-after-lula-s-win"],
  ["bitcoin-miners-plunge-as-1-12-billion-in-crypto-longs-get-wiped-out-and-an-openai-revenue-scare-rattles-ai-bets", "bitcoin-miners-plunge-as-1-12-billion-in-crypto-longs-get-wiped-out"],
  ["bloom-energy-climbs-as-virginia-s-energy-plan-names-fuel-cells-a-preferred-power-source", "bloom-energy-climbs-as-virginia-s-energy-plan-names-fuel-cells-a-preferred-power"],
  ["oracle-is-trucking-in-natural-gas-to-power-its-ai-data-centers-and-the-stock-is-sliding", "oracle-is-trucking-in-natural-gas-to-power-its-ai-data-centers"],
  ["marvell-s-big-test-arrives-tuesday-wall-street-wants-bigger-ai-targets-and-has-already-priced-some-in", "marvell-s-big-test-arrives-tuesday-wall-street-wants-bigger-ai-targets"],
  ["sterling-infrastructure-has-lost-almost-half-its-value-since-june-the-business-hasn-t", "sterling-infrastructure-has-lost-almost-half-its-value"],
  ["mid-morning-movers-by-market-cap-top-gainers-and-losers-across-mega-large-mid-and-small-caps", "mid-morning-movers-by-market-cap-top-gainers-and-losers-across-mega-large-mid"],
  ["4-things-that-could-move-stocks-this-week-from-marvell-s-big-day-to-delta-s-fuel-bill", "4-things-that-could-move-stocks-this-week-from-marvell-s-big-day"],
  ["rambus-posts-record-revenue-of-218-3m-as-product-sales-jump-22-and-q4-guidance-climbs", "rambus-posts-record-revenue-of-218-3m"],
  ["27-wall-street-calls-to-know-thursday-palantir-upgraded-constellation-brands-and-nxp-cut", "27-wall-street-calls-to-know-thursday-palantir-upgraded-constellation-brands"],
  ["apple-sets-welcome-home-event-for-oct-13-as-a-smart-home-hub-and-lg-built-locks-and-doorbells-loom", "apple-sets-welcome-home-event-for-oct-13"],
  ["stocks-moving-premarket-salesforce-jumps-on-a-bofa-upgrade-micron-slips-on-china-s-dram-push-and-oil-climbs-on-hormuz-risks", "stocks-moving-premarket-salesforce-jumps-on-a-bofa-upgrade-micron-slips"],
  ["memory-stocks-slide-as-china-s-cxmt-flags-a-4f2-dram-leap-what-it-means-for-micron-samsung-and-sk-hynix", "memory-stocks-slide-as-china-s-cxmt-flags-a-4f2-dram-leap-what-it-means"],
  ["super-micro-backed-argentum-ai-reportedly-seeks-5b-private-credit-loan-for-poland-chips", "super-micro-backed-argentum-ai-reportedly-seeks-5b-private-credit-loan"],
  ["meta-paused-a-human-assisted-test-of-muse-calls-over-privacy-concerns-even-though-it-was-outperforming-the-ai", "meta-paused-a-human-assisted-test-of-muse-calls-over-privacy-concerns-even"],
  ["muse-sell-off-widens-financials-insurance-travel-telecom-and-gyms-all-feel-the-ai-agent-threat", "muse-sell-off-widens-financials-insurance-travel-telecom"],
  ["micron-maps-memory-through-2030-hbm6-400-layer-nand-and-3d-dram-while-skipping-4f2-chips", "micron-maps-memory-through-2030-hbm6-400-layer-nand-and-3d-dram"],
  ["spacex-reportedly-seeks-80-000-cell-sites-sending-crown-castle-up-10-and-carriers-down-4-6", "spacex-reportedly-seeks-80-000-cell-sites-sending-crown-castle-up-10"],
  ["j-b-hunt-beats-q3-estimates-by-a-penny-and-grows-revenue-20-but-cost-pressures-squeeze-margins-and-send-the-stock-lower", "j-b-hunt-beats-q3-estimates-by-a-penny-and-grows-revenue-20"],
  ["alcoa-beats-q3-earnings-estimates-by-18-and-generates-472-million-of-free-cash-as-alumina-recovers-sending-the-stock-sharply-higher-despite-a-revenue-miss", "alcoa-beats-q3-earnings-estimates-by-18-and-generates-472-million-of-free-cash"],
  ["hotter-than-expected-september-cpi-jumps-to-3-7-core-hits-2-6-and-traders-bet-on-more-fed-hikes", "hotter-than-expected-september-cpi-jumps-to-3-7-core-hits-2-6-and-traders-bet"],
  ["fuelcell-energy-soars-on-fit-energy-s-pennsylvania-data-center-plan-here-s-what-s-actually-firm", "fuelcell-energy-soars-on-fit-energy-s-pennsylvania-data-center-plan-here-s-what"],
  ["understanding-candlestick-charts-a-professional-framework-for-price-action-and-volume", "understanding-candlestick-charts-a-professional-framework-for-price-action"],
  ["sec-clears-the-first-3x-bitcoin-and-ether-funds-but-trading-still-awaits-registration", "sec-clears-the-first-3x-bitcoin-and-ether-funds"],
  ["reddit-keeps-three-claims-alive-against-anthropic-as-a-judge-rejects-its-contract-challenge", "reddit-keeps-three-claims-alive-against-anthropic"],
  ["inflation-cools-growth-surprises-higher-what-wednesday-s-data-dump-means-for-the-fed", "inflation-cools-growth-surprises-higher-what-wednesday-s-data-dump-means"],
  ["bloom-energy-jumps-on-s-p-500-news-fueled-by-an-ai-power-boom-and-a-supply-chain-controversy", "bloom-energy-jumps-on-s-p-500-news-fueled-by-an-ai-power-boom"],
  ["u-s-stocks-soften-post-labor-day-extending-a-ten-year-seasonal-trend-oil-rates-and-a-software-wobble-rattle-stocks", "u-s-stocks-soften-post-labor-day-extending-a-ten-year-seasonal-trend-oil-rates"],
  ["kforce-beats-on-eps-but-a-12-cent-insurance-gain-did-much-of-the-work-and-q4-margins-step-down", "kforce-beats-on-eps-but-a-12-cent-insurance-gain-did-much-of-the-work"],
  ["carpenter-technology-is-down-about-39-from-its-june-high-despite-record-profits-what-bulls-and-bears-are-weighing-before-october-22-earnings", "carpenter-technology-is-down-about-39-from-its-june-high"],
  ["why-dell-stock-fell-23-in-a-week-despite-a-blowout-quarter-a-barclays-downgrade-memory-price-doubts-and-an-ai-sell-off", "why-dell-stock-fell-23-in-a-week"],
  ["the-stealth-bear-market-thesis-fact-checked-what-the-kobeissi-letter-gets-right-on-the-s-p-500-and-where-the-numbers-differ", "the-stealth-bear-market-thesis-fact-checked-what-the-kobeissi-letter-gets-right"],
  ["google-launches-genie-4-world-model-with-native-audio-and-real-time-steering-for-trusted-testers", "google-launches-genie-4-world-model"],
  ["wholesale-inflation-explodes-september-ppi-surges-1-3-the-biggest-jump-since-2022-as-annual-producer-prices-hit-6-3", "wholesale-inflation-explodes-september-ppi-surges-1-3-the-biggest-jump"],
  ["berkshire-hathaway-adds-330-million-to-its-bending-spoons-bet-and-the-stock-soars-nearly-40", "berkshire-hathaway-adds-330-million-to-its-bending-spoons-bet"],
  ["gartner-says-3-5-trillion-of-ai-spending-could-be-written-down-and-most-neoclouds-won-t-survive-on-their-own", "gartner-says-3-5-trillion-of-ai-spending-could-be-written-down"],
  ["broadcom-s-ceo-says-capital-not-chips-may-be-ai-s-biggest-bottleneck-and-cerebras-falls-to-a-record-low", "broadcom-s-ceo-says-capital-not-chips-may-be-ai-s-biggest-bottleneck"],
  ["barclays-calls-time-on-the-enterprise-hardware-rally-dell-hpe-and-netapp-downgraded-with-no-meaningful-ai-inflection-yet", "barclays-calls-time-on-the-enterprise-hardware-rally-dell-hpe"],
  ["chip-selloff-deepens-at-midday-as-hot-cpi-sends-yields-higher-dell-plunges-10-credo-sheds-8-and-soxx-falls-nearly-4", "chip-selloff-deepens-at-midday"],
  ["tsmc-posts-a-sixth-straight-record-profit-and-lifts-its-outlook-but-says-any-texas-fab-making-its-chips-must-be-run-by-tsmc", "tsmc-posts-a-sixth-straight-record-profit-and-lifts-its-outlook"],
  ["openai-launches-gpt-6-1-terra-with-50-lower-api-prices-and-3x-faster-task-completion", "openai-launches-gpt-6-1-terra-with-50-lower-api-prices"],
  ["seagate-beats-with-7-68-eps-and-guides-q2-well-above-estimates-but-shares-slide-after-hours", "seagate-beats-with-7-68-eps-and-guides-q2-well-above-estimates-but-shares-slide"],
  ["robinhood-posts-record-1-42b-revenue-as-event-contracts-top-crypto-but-eps-falls-16-to-0-51", "robinhood-posts-record-1-42b-revenue-as-event-contracts-top-crypto"],
  ["google-launches-universal-cart-in-the-u-s-putting-one-shopping-cart-across-search-and-gemini-just-ahead-of-the-holidays", "google-launches-universal-cart"],
  ["stocks-moving-premarket-ringcentral-jumps-on-a-raised-outlook-crown-castle-climbs-on-spacex-talks-and-deckers-slides", "stocks-moving-premarket-ringcentral-jumps"],
  ["u-s-official-no-iran-deal-without-the-nuclear-issue-but-sanctions-relief-is-on-the-table", "u-s-official-no-iran-deal-without-the-nuclear-issue"],
  ["robinhood-wants-an-ai-agent-trading-your-portfolio-and-a-data-marketplace-to-feed-it", "robinhood-wants-an-ai-agent-trading-your-portfolio-and-a-data-marketplace"],
  ["decagon-hires-a-bank-to-gauge-sale-interest-with-servicenow-reportedly-in-early-talks", "decagon-hires-a-bank-to-gauge-sale-interest"],
  ["equity-lifestyle-meets-q3-ffo-estimate-at-0-79-beats-on-revenue-holds-2026-ffo-outlook", "equity-lifestyle-meets-q3-ffo-estimate-at-0-79-beats"],
  ["visa-finally-gets-a-foot-in-china-s-door-after-a-nine-year-wait-here-s-what-it-can-and-can-t-do-yet", "visa-finally-gets-a-foot-in-china-s-door"],
  ["asia-s-chip-rout-just-wiped-out-803-million-in-crypto-bets-and-sandisk-traders-got-hit-harder-than-xrp", "asia-s-chip-rout-just-wiped-out-803-million-in-crypto-bets"],
  ["pnc-beats-on-profit-lifts-its-2026-outlook-and-raises-the-dividend-18-as-loans-surge-but-revenue-slips-below-estimates", "pnc-beats-on-profit-lifts-its-2026-outlook-and-raises-the-dividend-18"],
  ["schwab-posts-record-revenue-and-a-record-190-billion-in-new-assets-but-the-stock-slips-as-revenue-lands-a-hair-below-estimates", "schwab-posts-record-revenue-and-a-record-190-billion-in-new-assets"],
  ["nasdaq-surges-over-1-as-tech-rally-outpaces-rate-concerns-dow-and-s-p-post-modest-gains", "nasdaq-surges-over-1-as-tech-rally-outpaces-rate-concerns-dow"],
  ["asml-crushes-q3-estimates-raises-its-2026-outlook-and-warns-ai-demand-will-outrun-its-factories-through-2028", "asml-crushes-q3-estimates-raises-its-2026-outlook"],
  ["stocks-moving-premarket-tesla-and-ibm-slide-lam-research-drops-8-and-lockheed-martin-climbs-on-a-higher-outlook", "stocks-moving-premarket-tesla-and-ibm-slide-lam-research-drops-8"],
  ["marketcatalyst-take-the-memory-sell-off-is-pricing-a-long-term-threat-as-if-it-were-today-s-glut", "marketcatalyst-take-the-memory-sell-off-is-pricing-a-long-term-threat"],
  ["us-and-iran-hold-three-hour-talks-at-the-un-as-trump-says-there-s-a-lot-of-momentum-for-a-deal", "us-and-iran-hold-three-hour-talks-at-the-un"],
  ["oracle-sends-force-majeure-notice-over-stalled-new-mexico-data-center-dragging-bloom-energy-down-with-it", "oracle-sends-force-majeure-notice"],
  ["dow-falls-for-third-day-as-hormuz-deal-hopes-and-meta-s-rally-offset-surging-treasury-yields", "dow-falls-for-third-day-as-hormuz-deal-hopes"],
  ["keybanc-says-google-is-discussing-memory-supply-deals-through-2035-as-hp-and-dell-lock-in-contracts-into-2031", "keybanc-says-google-is-discussing-memory-supply-deals-through-2035"],
  ["stocks-moving-premarket-hot-cpi-greets-wall-street-liquidia-soars-on-a-legal-settlement-and-bank-of-america-slides-on-a-1-2-billion-penalty", "stocks-moving-premarket-hot-cpi-greets-wall-street-liquidia-soars"],
  ["coreweave-plunges-14-as-its-bonds-hit-a-record-yield-and-musk-says-yikes-why-a-104-billion-backlog-isn-t-enough", "coreweave-plunges-14-as-its-bonds-hit-a-record-yield"],
  ["airfares-are-up-22-in-a-year-and-airline-stocks-just-paid-the-price-jetblue-leads-a-10-nosedive", "airfares-are-up-22-in-a-year-and-airline-stocks-just-paid-the-price-jetblue"],
  ["ai-cloud-stocks-crater-as-coreweave-plunges-nearly-16-on-debt-fears-its-ceo-says-the-market-is-irrational", "ai-cloud-stocks-crater-as-coreweave-plunges-nearly-16"],
  ["meta-unveils-muse-wonder-ai-models-says-it-has-reached-the-frontier-as-its-stock-jumps-4", "meta-unveils-muse-wonder-ai-models-says-it-has-reached-the-frontier"],
  ["midday-movers-ionq-sinks-on-a-2-billion-raise-coreweave-bonds-slide-bofa-drops-7-and-bending-spoons-soars-40", "midday-movers-ionq-sinks-on-a-2-billion-raise-coreweave-bonds-slide-bofa-drops-7"],
  ["workday-opens-its-hr-and-finance-data-to-claude-gemini-and-copilot-as-outside-ai-agents-threaten-software-s-front-door", "workday-opens-its-hr-and-finance-data-to-claude-gemini-and-copilot"],
  ["applied-materials-bets-5-billion-on-a-shared-chip-r-d-hub-and-on-ai-to-double-revenue-without-doubling-headcount", "applied-materials-bets-5-billion-on-a-shared-chip-r-d-hub-and-on-ai"],
  ["serve-robotics-slides-10-to-a-52-week-low-as-the-uber-reset-keeps-weighing-on-the-stock", "serve-robotics-slides-10-to-a-52-week-low"],
  ["terawulf-s-ceo-says-it-is-an-energy-infrastructure-company-not-a-neocloud-as-morgan-stanley-calls-the-stock-s-october-slide-mispriced", "terawulf-s-ceo-says-it-is-an-energy-infrastructure-company-not-a-neocloud"],
  ["fastly-stock-jumps-17-on-report-that-it-handles-all-of-meta-muse-s-browser-agent-tasks", "fastly-stock-jumps-17-on-report"],
  ["ast-spacemobile-sinks-on-spacex-s-spectrum-deal-but-berenberg-and-roth-say-it-could-become-carriers-best-ally", "ast-spacemobile-sinks-on-spacex-s-spectrum-deal"],
  ["fannie-mae-and-freddie-mac-sink-more-than-12-as-mizuho-slashes-targets-on-fading-privatization-hopes", "fannie-mae-and-freddie-mac-sink-more-than-12"],
  ["large-cap-movers-jfrog-marvell-and-sandisk-rebound-as-telkom-indonesia-hits-a-17-year-low-and-sea-limited-slides", "large-cap-movers-jfrog-marvell-and-sandisk-rebound"],
  ["nasdaq-surges-1-2-as-tech-rallies-dow-dips-slightly-amid-rising-yields-and-a-strong-dollar", "nasdaq-surges-1-2-as-tech-rallies-dow-dips-slightly"],
  ["wall-street-analyst-calls-goldman-upgrades-coreweave-morgan-stanley-names-amazon-a-top-pick-and-bernstein-upgrades-datadog", "wall-street-analyst-calls-goldman-upgrades-coreweave-morgan-stanley-names-amazon"],
  ["stocks-moving-premarket-3m-jumps-on-amazon-deal-rtx-lifts-outlook-and-gm-slides-on-narrowed-guidance", "stocks-moving-premarket-3m-jumps-on-amazon-deal-rtx-lifts-outlook-and-gm-slides"],
  ["analyst-calls-barclays-hits-nuscale-loop-cuts-apple-to-hold-and-blackrock-wins-a-td-cowen-upgrade", "analyst-calls-barclays-hits-nuscale-loop-cuts-apple-to-hold"],
  ["stocks-slip-at-midday-as-chips-slide-bumble-soars-56-on-a-buyout-and-j-j-drops-after-earnings", "stocks-slip-at-midday-as-chips-slide-bumble-soars-56-on-a-buyout-and-j-j-drops"],
  ["cybersecurity-stocks-are-getting-clobbered-hot-inflation-an-openai-deal-report-and-a-valuation-reset-send-cibr-down-5-9-this-week", "cybersecurity-stocks-are-getting-clobbered-hot-inflation-an-openai-deal-report"],
  ["stocks-moving-premarket-tesla-pops-on-roadster-reveal-coreweave-slides-on-ai-debt-worries-and-alcoa-beats-on-profit", "stocks-moving-premarket-tesla-pops-on-roadster-reveal-coreweave-slides"],
  ["wall-street-s-biggest-banks-are-funding-the-ai-boom-and-warning-about-it-at-the-same-time", "wall-street-s-biggest-banks-are-funding-the-ai-boom-and-warning-about-it"],
  ["qualcomm-plans-global-layoffs-starting-in-november-as-ceo-amon-pushes-performance-focus", "qualcomm-plans-global-layoffs-starting-in-november"],
  ["intel-details-its-crescent-island-inference-gpu-now-the-d-series-and-xeon-racks-for-agentic-ai", "intel-details-its-crescent-island-inference-gpu-now-the-d-series-and-xeon-racks"],
  ["intel-s-d-series-gpu-enters-customer-sampling-with-dell-hpe-asus-and-supermicro-in-the-mix-as-the-agentic-ai-push-widens", "intel-s-d-series-gpu-enters-customer-sampling"],
];

const toPublic = new Map<string, string>(SHORTENED_POSTS);
const toStored = new Map<string, string>(SHORTENED_POSTS.map(([stored, short]) => [short, stored]));

/** The slug a post is published under: its short one if it has one, else its own. */
export function publicPostSlug(slug: string): string {
  return toPublic.get(slug) ?? slug;
}

/** The slug a post is stored under, given the slug from a request. */
export function storedPostSlug(slug: string): string {
  return toStored.get(slug) ?? slug;
}

/** The path of a post's page, from its stored slug. */
export function postPath(slug: string): string {
  return `/posts/${encodeURIComponent(publicPostSlug(slug))}`;
}

/** A post URL (absolute or a path) with its slug swapped for the public one; anything else is returned as it came. */
export function publicPostUrl(url: string): string {
  return url.replace(/\/posts\/([^/?#]+)(?=$|[?#])/, (_match, slug: string) => `/posts/${publicPostSlug(slug)}`);
}
