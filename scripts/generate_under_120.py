import json
import re

with open('lib/seo/curated-descriptions.json') as f:
    posts = json.load(f)

# Curated overrides for the trickiest posts / exact samples from the user
EXACT_OVERRIDES = {
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
    "smart-ring-maker-oura-halts-ipo-over-market-uncertainty":
        "Oura shelved its $2.2 billion Nasdaq IPO despite strong demand, the third firm this month to delay a U.S. listing.",
    "sterling-infrastructure-has-lost-almost-half-its-value-since-june-the-business-hasn-t":
        "Sterling Infrastructure fell 46% from its peak despite 90% revenue growth and a $5.6 billion backlog. Here is why.",
    "coreweave-plunges-14-as-its-bonds-hit-a-record-yield-and-musk-says-yikes-why-a-104-billion-backlog-isn-t-enough":
        "CoreWeave fell 14% to $66.70 as bond yields reached 14.5%, raising financing questions for its $104 billion backlog.",
    "asml-crushes-q3-estimates-raises-its-2026-outlook-and-warns-ai-demand-will-outrun-its-factories-through-2028":
        "ASML beat Q3 with EPS of €12.95, raised 2026 sales to €45 billion and warned AI chip demand will outrun supply to 2028.",
    "berkshire-hathaway-adds-330-million-to-its-bending-spoons-bet-and-the-stock-soars-nearly-40":
        "Bending Spoons soared 40% after Berkshire invested another $330 million, lifting its total stake to $930 million.",
    "midday-movers-ionq-sinks-on-a-2-billion-raise-coreweave-bonds-slide-bofa-drops-7-and-bending-spoons-soars-40":
        "Oct 14 movers: IonQ fell on a $2 billion raise, BofA dropped 7% on a penalty, and Bending Spoons soared 40%.",
    "chip-selloff-deepens-at-midday-as-hot-cpi-sends-yields-higher-dell-plunges-10-credo-sheds-8-and-soxx-falls-nearly-4":
        "Chip selloff deepens: Dell fell 10%, Credo dropped 8% and SOXX fell 4% as hot CPI sent 10-year yields above 5.3%.",
    "barclays-calls-time-on-the-enterprise-hardware-rally-dell-hpe-and-netapp-downgraded-with-no-meaningful-ai-inflection-yet":
        "Barclays downgraded Dell, HPE and NetApp to Equal Weight, noting rallies reflect memory prices rather than AI revenue.",
    "inflation-winners-and-losers-which-stocks-gain-and-which-get-crushed-when-cpi-runs-hot":
        "Why does a hot CPI lift some stocks and sink others? A clear framework on which market sectors gain and lose.",
    "stocks-moving-premarket-hot-cpi-greets-wall-street-liquidia-soars-on-a-legal-settlement-and-bank-of-america-slides-on-a-1-2-billion-penalty":
        "Premarket Oct 14: Liquidia jumped 40% on a settlement, while Bank of America slid on a $1.2 billion regulatory penalty.",
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
}

print(f"Defined {len(EXACT_OVERRIDES)} exact overrides")

def clean_sentence(s):
    # normalize spaces
    s = re.sub(r'\s+', ' ', s).strip()
    # fix any double periods or trailing punctuation
    s = re.sub(r'\.\s*\.$', '.', s)
    if not s.endswith('.'):
        s += '.'
    return s

def compress_general(slug, text):
    if slug in EXACT_OVERRIDES:
        return EXACT_OVERRIDES[slug]
        
    orig = text
    # 1. strip (TICKER)
    t = re.sub(r'\s*\([A-Z]{1,5}\)', '', text)
    
    # 2. common fluff removal
    subs = [
        ("about ", ""),
        ("nearly ", ""),
        ("roughly ", ""),
        ("approximately ", ""),
        ("year-over-year", "YoY"),
        ("quarter-over-quarter", "QoQ"),
        ("from a year earlier", "YoY"),
        ("from a year ago", "YoY"),
        ("Wall Street ", ""),
        ("earnings expectations", "expectations"),
        ("free cash flow", "free cash flow"),
        ("per-share ", "per share "),
        ("infrastructure spending", "spending"),
        ("versus ", "vs. "),
        ("estimated", "est."),
    ]
    for old, new in subs:
        t = t.replace(old, new)
        
    t = clean_sentence(t)
    if len(t) < 120:
        return t
        
    # If still >= 120, let's see if there are multiple sentences or clauses
    parts = re.split(r'(?<=[.!?])\s+', t)
    if len(parts) > 1 and len(parts[0]) >= 80 and len(parts[0]) < 120:
        return clean_sentence(parts[0])
        
    # If there is a semicolon or dash or ", but" or ", while"
    # Try splitting at clause boundary if the first clause is meaningful and has >= 80 chars
    for sep in ['; ', ' - ', ' — ', ', while ', ', though ', ', but ']:
        if sep in t:
            prefix = t.split(sep)[0]
            prefix = clean_sentence(prefix)
            if 80 <= len(prefix) < 120:
                return prefix
                
    return t

results = {}
long_posts = []

for slug, text in posts.items():
    condensed = compress_general(slug, text)
    results[slug] = condensed
    if len(condensed) >= 120 or len(condensed) < 70:
        long_posts.append((slug, len(condensed), condensed, text))

print(f"Total processed: {len(results)}")
print(f"Posts still needing adjustment: {len(long_posts)}")
for s, l, c, o in long_posts[:15]:
    print(f"[{l}] {s}\n  Orig: {o}\n  Curr: {c}\n")

