import Link from "next/link";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { BrandMark } from "./BrandMark";

/** MarketCatalyst's social profiles, in the order the footer shows them. `path` is a 24×24 glyph. */
const SOCIAL_LINKS = [
  {
    name: "Substack",
    href: "https://marketcatalyst.substack.com/",
    path: "M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/marketcatalystai/",
    path: "M4.98 3.5A2.5 2.5 0 102.5 6 2.5 2.5 0 004.98 3.5zM3 8.5h4V21H3zM9.5 8.5h3.8v1.7h.05a4.2 4.2 0 013.75-2c4 0 4.75 2.6 4.75 6V21h-4v-5.6c0-1.35 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-4z",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/people/MarketCatalyst/61596395783095/",
    path: "M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z",
  },
  {
    name: "X",
    href: "https://x.com/marketcatalyst_",
    path: "M18.2 2h3.3l-7.2 8.3L23 22h-6.7l-5.2-6.8L5.1 22H1.8l7.7-8.8L1 2h6.8l4.7 6.2L18.2 2zm-1.2 18h1.8L7.1 3.9H5.1L17 20z",
  },
];

/**
 * The site footer, worn by the landing page and the blog alike.
 *
 * Lives here rather than in components/home/Sections.tsx because that module
 * also carries the landing page's dashboard data — importing it from the blog
 * would have shipped every ticker, plan and heatmap tile into the blog's
 * bundle for the sake of five links.
 *
 * Styled by app/chrome.css (.mc-footer*). The ET clock is inert markup: each
 * page's own client component fills #mc-clock once a second.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mc-footer">
      <div className="mc-footer-grid">
        <div>
          {/* Plain <a> for every link to the home page: it is a static document
              (app/route.ts), and <Link> would prefetch it as an app-router page. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="mc-brand">
            <BrandMark />
          </a>
          <p className="mc-footer-tag">Market intelligence, narrated. From ticker to thesis, in one place.</p>
          <div className="mc-footer-social">
            {SOCIAL_LINKS.map(({ name, href, path }) => (
              <a key={name} href={href} target="_blank" rel="noopener" aria-label={`MarketCatalyst on ${name}`} title={name}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
          <div className="mc-clock" id="mc-clock">
            --:--:-- ET
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Product</div>
          <div className="mc-footer-links">
            <Link href="/features">Features</Link>
            <a href={APP_SIGNUP_URL}>Sign up</a>
            <a href={APP_LOGIN_URL}>Log in</a>
            {/* Rooted, not a bare #pricing: this footer is also worn by
                /posts, where that anchor does not exist. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/#pricing">Pricing</a>
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Company</div>
          <div className="mc-footer-links">
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/posts">Resources</Link>
            <Link href="/careers">Careers</Link>
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Legal</div>
          <div className="mc-footer-links">
            <Link href="/faqs">FAQs</Link>
            <Link href="/legal/terms">Terms of service</Link>
            <Link href="/legal/privacy">Privacy policy</Link>
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Get in touch</div>
          <p className="mc-footer-note">Questions about the product, partnerships or press? We read every message.</p>
          <Link href="/contact">Contact us →</Link>
        </div>
      </div>

      {/* Directory badges. Plain <img>: they are third-party, fixed-size
          badges, so next/image's optimizer would add nothing. */}
      <div className="mc-footer-badges">
        <a
          href="https://startupfa.me/s/marketcatalyst?utm_source=marketcatalyst.ai"
          target="_blank"
          rel="noopener"
          className="mc-badge-boxed"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://startupfa.me/badge?t=medium&theme=default"
            alt="MarketCatalyst - Featured on Startup Fame"
            width={171}
            height={54}
            loading="lazy"
          />
        </a>
        <a href="https://nicklaunches.com/" target="_blank" rel="noopener" className="mc-badge-padded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://nicklaunches.com/badges/featured.png"
            alt="Featured on Nick Launches"
            width={244}
            height={56}
            loading="lazy"
          />
        </a>
      </div>

      <div className="mc-footer-bottom">
        <span>© {year} MarketCatalyst. All rights reserved.</span>
        <span>Informational purposes only — not investment advice.</span>
      </div>
    </footer>
  );
}
