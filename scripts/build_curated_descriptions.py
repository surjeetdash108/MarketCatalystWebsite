import json
import re
import os

SPREADSHEET_JSON = "/tmp/spreadsheet_rows.json"
OUTPUT_JSON = "/Users/likhithkumarkukkadapu/MarketCatalyst/MarketCatalystWebsite/lib/seo/curated-descriptions.json"

ABBREV_RE = re.compile(
    r'\b(Oct|Sep|Sept|Nov|Dec|Jan|Feb|Mar|Apr|Jun|Jul|Aug|vs|Corp|Inc|Co|Ltd|a\.m|p\.m|U\.S|No|Dr|Mr|Mrs|Ms|St)\.',
    re.I
)

def protect(text):
    text = re.sub(r'(\d+)\.(\d+)', r'\g<1>__DOT__\g<2>', text)
    # Protect single-letter initials like J.B. or R.
    text = re.sub(r'\b([A-Za-z])\.', r'\g<1>__DOT__', text)
    def repl(m):
        return m.group(1) + '__DOT__'
    text = ABBREV_RE.sub(repl, text)
    text = re.sub(r'\b([ap])__DOT__m\.', r'\1__DOT__m__DOT__', text, flags=re.I)
    text = re.sub(r'\bU__DOT__S\.', r'U__DOT__S__DOT__', text)
    return text

def unprotect(text):
    return text.replace('__DOT__', '.')

CONNECTORS = [
    r', while ',
    r', as ',
    r', but ',
    r', though ',
    r', despite ',
    r', even as ',
    r', yet ',
    r', with ',
    r', driving ',
    r', raising ',
    r', sending ',
    r', prompting ',
    r', dragging ',
    r', pushing ',
    r', lifting ',
    r', erasing ',
    r', adding ',
    r', after ',
    r', before ',
    r'; ',
    r', and ',
]

def clean_sentence(s):
    # Strip leading punctuation/colon/dash
    s = re.sub(r'^[\s:;,\-–—]+', '', s).strip()
    # Strip trailing punctuation first so we can check ending words
    s = re.sub(r'[.!?]+$', '', s).strip()
    # Strip trailing single prepositions/conjunctions
    s = re.sub(
        r'\b(on|a|an|the|in|with|and|or|to|for|of|by|at|from|that|which|as|after|amid|over|under|despite|while|before|until)\b[\s,;:\-–—]*$',
        '',
        s,
        flags=re.I
    ).strip()
    s = s.rstrip(' ,;:-–—')
    if s and not s.endswith(('.', '!', '?')):
        s += '.'
    return s

def condense_description(raw, max_len=118):
    if not raw:
        return ''
    clean = re.sub(r'<[^>]*>', ' ', raw)
    clean = re.sub(r'[*_#`~[\]]', '', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    clean = re.sub(r'^[\s:;,\-–—]+', '', clean).strip()

    if len(clean) <= max_len:
        return clean_sentence(clean)

    p = protect(clean)
    raw_sentences = [s.strip() for s in re.split(r'\.(?:\s+|$)', p) if s.strip()]
    sentences = [clean_sentence(unprotect(s)) for s in raw_sentences]

    # Check if first sentence fits
    if sentences:
        s0 = sentences[0]
        if 45 <= len(s0) <= max_len:
            return s0
        # If multiple sentences fit
        combined = s0
        for next_s in sentences[1:]:
            cand = combined + ' ' + next_s
            if len(cand) <= max_len:
                combined = cand
            else:
                break
        if 45 <= len(combined) <= max_len:
            return combined

    target = protect(sentences[0] if sentences else clean)
    target = target.rstrip('.!?')

    best_candidate = None
    for conn in CONNECTORS:
        parts = re.split(conn, target, flags=re.I)
        if len(parts) > 1:
            accum = parts[0]
            cand = clean_sentence(unprotect(accum))
            if 45 <= len(cand) <= max_len:
                if best_candidate is None or len(cand) > len(best_candidate):
                    best_candidate = cand

    if best_candidate:
        return best_candidate

    commas = [m.start() for m in re.finditer(r',', target)]
    for idx in reversed(commas):
        cand = clean_sentence(unprotect(target[:idx]))
        if 45 <= len(cand) <= max_len:
            return cand

    words = unprotect(target).split()
    accum = ''
    for w in words:
        if len(accum + (' ' if accum else '') + w) + 1 <= max_len:
            accum += (' ' if accum else '') + w
        else:
            break
    return clean_sentence(accum)

def main():
    with open(SPREADSHEET_JSON) as f:
        rows = json.load(f)

    curated = {}
    bad = []

    for i, r in enumerate(rows[1:], 1):
        url = r[0]
        slug = url.rstrip('/').split('/')[-1]
        sugg = r[2] if len(r) > 2 and r[2] else (r[1] if len(r) > 1 else '')
        desc = condense_description(sugg, max_len=118)

        if len(desc) > 118 or len(desc) < 35 or desc.endswith('...'):
            bad.append((i, slug, len(desc), desc))
        curated[slug] = desc

    print(f"Total entries: {len(curated)}")
    print(f"Bad entries: {len(bad)}")
    if bad:
        for b in bad:
            print("BAD:", b)

    lens = [len(v) for v in curated.values()]
    print(f"Min length: {min(lens)}")
    print(f"Max length: {max(lens)}")
    print(f"Average length: {sum(lens)/len(lens):.1f}")

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(curated, f, indent=2)

    print(f"Wrote curated descriptions to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
