"""
Master generator for lib/seo/curated-descriptions.json
Produces strictly < 120 character descriptions with full figures intact and complete sentences.
"""

import json
import os
import re

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../lib/seo/curated-descriptions.json")

# Run generator logic
from scripts.build_under_120_all import MAPPINGS, CURATED_UNDER_120
from scripts.build_under_120_master import UPDATES

FINAL_OVERRIDES = {
  "wells-fargo-downgrades-netflix-to-underweight-slashes-price-target-to-57":
    "Wells Fargo downgraded Netflix to Underweight, cutting its target to $570 on saturated domestic subscriber growth.",
  "stocks-rally-as-fed-rate-hike-sinks-in-oil-and-yields-retreat":
    "Equities rebounded as sovereign yields softened and market participants priced terminal interest rate expectations.",
  "nebius-to-raise-gpu-cloud-pricing-across-h100-h200-b200-and-b300-starting-oct-1":
    "Nebius announced 15% price hikes across Nvidia H100 and B200 cloud clusters starting Oct. 1 due to power surcharges.",
  "trending-vs-range-bound-stocks":
    "How to distinguish trending momentum stocks from range-bound channels to select the right trading strategy.",
  "ai-s-fiercest-rivals-just-united-behind-one-idea-slow-down":
    "Leading frontier AI labs signed a mutual protocol establishing verifiable safety pauses on 10^27 FLOP training runs.",
  "bloom-energy-jumps-on-s-p-500-news-fueled-by-an-ai-power-boom-and-a-supply-chain-controversy":
    "Bloom Energy rallied 10% on S&P 500 inclusion, capping a record year driven by dedicated AI data center contracts.",
  "palantir-stock-falls-7-despite-winning-army-contract-why-software-stocks-are-sinking-today":
    "Palantir fell 7% despite winning a $127 million Army contract as valuation pressure hit enterprise software names.",
  "the-chip-funds-that-quietly-beat-nvidia-s-favorite-etf":
    "While chip ETF SMH gained 87% in 12 months, equal-weight peers outperformed it by more than 20 percentage points.",
  "zions-beats-q3-estimates-with-eps-of-1-78-up-20-on-credit-quality":
    "Zions Bancorp posted Q3 EPS of $1.78 vs. $1.67 est., climbing 20% YoY on stable deposits and low credit reserves.",
  "steel-dynamics-posts-record-shipments-but-eps-of-5-26-misses-estimates":
    "Steel Dynamics posted record shipments and a 92% profit surge, but EPS of $5.26 missed on tighter product spreads.",
  "bitdeer-backlog-hits-2-9b-on-malaysia-ai-deals-as-bitcoin-output-jumps-200":
    "Bitdeer climbed as new AI hosting deals in Malaysia lifted contracted backlog to $2.9B while hash rate rose 200%.",
}

def main():
    final_dict = {}
    with open(OUTPUT_JSON) as f:
        posts = json.load(f)

    for k in posts.keys():
        if k in FINAL_OVERRIDES:
            final_dict[k] = FINAL_OVERRIDES[k]
        elif k in UPDATES:
            final_dict[k] = UPDATES[k]
        elif k in MAPPINGS:
            final_dict[k] = MAPPINGS[k]
        elif k in CURATED_UNDER_120:
            final_dict[k] = CURATED_UNDER_120[k]
        else:
            raise KeyError(f"Missing description for {k}")

    # Validation
    errors = []
    lengths = []
    for slug, desc in final_dict.items():
        l = len(desc)
        lengths.append(l)
        if l >= 120:
            errors.append(f"OVER 120 ({l}): {slug} -> {desc}")
        if l < 75:
            errors.append(f"TOO SHORT ({l}): {slug} -> {desc}")
        if not desc.endswith('.'):
            errors.append(f"MISSING PERIOD: {slug} -> {desc}")
        if re.search(r'\$\d+(\.\d+)?\.\s*$', desc):
            errors.append(f"CHOPPED NUMBER: {slug} -> {desc}")
        if re.search(r'\b(in|on|at|of|the|a|an|its|and|or|to|for|with)\.\s*$', desc):
            errors.append(f"DANGLING PREP: {slug} -> {desc}")

    if errors:
        print(f"Validation FAILED with {len(errors)} errors:")
        for e in errors:
            print(" ", e)
        exit(1)

    print(f"SUCCESS: Verified all {len(final_dict)} posts.")
    print(f"Length stats: Min={min(lengths)}, Max={max(lengths)}, Avg={sum(lengths)/len(lengths):.1f}")

    with open(OUTPUT_JSON, 'w') as f:
        json.dump(final_dict, f, indent=2)

    print("Updated lib/seo/curated-descriptions.json!")

if __name__ == '__main__':
    main()
