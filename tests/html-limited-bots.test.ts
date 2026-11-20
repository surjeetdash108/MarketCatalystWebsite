// Metadata (title, description, canonical) must be rendered inside <head> for every
// user agent. Next only does that for user agents matching htmlLimitedBots, so the
// setting must match all of them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldServeStreamingMetadata } from "next/dist/server/lib/streaming-metadata";
import nextConfig from "../next.config";

// next/dist/server/config.js converts the RegExp to its source string before use.
const setting = (nextConfig.htmlLimitedBots as RegExp).source;

test("no real user agent gets streamed metadata", () => {
  for (const ua of [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Screaming Frog SEO Spider/22.0",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "curl/8.5.0",
    "python-requests/2.31",
  ]) {
    assert.equal(shouldServeStreamingMetadata(ua, setting), false, ua);
  }
});
