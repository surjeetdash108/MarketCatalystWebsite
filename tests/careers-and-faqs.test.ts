import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const careersSrc = fs.readFileSync(new URL("../content/careers.ts", import.meta.url), "utf8");
const faqsSeedSrc = fs.readFileSync(new URL("../scripts/seed-faqs.ts", import.meta.url), "utf8");

describe("Careers content & FAQs updates", () => {
  it("careers index removes 'built by MarketCatalyst Analytics LLC, '", () => {
    assert.doesNotMatch(
      careersSrc,
      /MarketCatalyst,\s*built by MarketCatalyst Analytics LLC,\s*is an AI-powered/,
      "Must not contain 'built by MarketCatalyst Analytics LLC, '"
    );
    assert.match(
      careersSrc,
      /MarketCatalyst is an AI-powered stock market research terminal for traders and investors\./,
      "Careers lede must start with 'MarketCatalyst is an AI-powered'"
    );
  });

  it("all 4 job postings use the required company description without pricing", () => {
    assert.doesNotMatch(
      careersSrc,
      /We're early-stage and founder-led, with a free tier and Pro \(\$29\) and Elite \(\$79\) plans\./,
      "Must not contain the trailing pricing sentence in job postings"
    );
    assert.doesNotMatch(
      careersSrc,
      /MarketCatalyst \(https:\/\/marketcatalyst\.ai\) is an AI-powered/,
      "Must not contain https://marketcatalyst.ai in company paragraph"
    );
  });

  it("options real-time quotes FAQ is removed from seed-faqs.ts", () => {
    assert.doesNotMatch(
      faqsSeedSrc,
      /Does the Options section show real-time quotes\?/,
      "Options section FAQ must be removed"
    );
    assert.doesNotMatch(
      faqsSeedSrc,
      /The options chain is an educational tool for exploring calls and puts/,
      "Options section answer must be removed"
    );
  });
});
