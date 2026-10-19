import json
import re

with open('lib/seo/curated-descriptions.json') as f:
    posts = json.load(f)

# Rule-based condenser that trims fluff, ticker symbols, while preserving main subject, verb, numbers and meaning
def condense(slug, text):
    # If text is already < 120, return it
    if len(text) < 120 and text.endswith('.'):
        return text

    # Remove (TICKER) e.g. "TeraWulf (WULF)" -> "TeraWulf"
    t = re.sub(r'\s*\([A-Z]{1,5}\)', '', text)
    
    # Common word compressions
    replacements = [
        ("about ", ""),
        ("nearly ", ""),
        ("roughly ", ""),
        ("adjusted EPS of ", "adjusted EPS "),
        ("earnings expectations", "expectations"),
        ("quarter-over-quarter", "QoQ"),
        ("year-over-year", "YoY"),
        ("from a year earlier", "YoY"),
        ("from a year ago", "YoY"),
        ("free cash flow", "free cash flow"),
        ("infrastructure spending", "spending"),
        ("infrastructure ", ""),
        ("data center ", "data center "),
        ("versus ", "vs. "),
        ("estimated", "est."),
        ("per-share ", "per share "),
        ("Wall Street ", ""),
    ]
    
    # Let's see if splitting by sentence helps if the first sentence has key info and is <= 119 chars
    sentences = re.split(r'(?<=[.!?])\s+', t)
    
    return t

print("Loaded test_compression")
