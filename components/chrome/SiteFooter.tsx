import Link from "next/link";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { BrandMark } from "./BrandMark";

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
          <Link href="/" className="mc-brand">
            <BrandMark />
          </Link>
          <p className="mc-footer-tag">Market intelligence, narrated. From ticker to thesis, in one place.</p>
          <div className="mc-clock" id="mc-clock">
            --:--:-- ET
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Product</div>
          <div className="mc-footer-links">
            <a href={APP_SIGNUP_URL}>Sign up</a>
            <a href={APP_LOGIN_URL}>Log in</a>
            {/* Rooted, not a bare #pricing: this footer is also worn by
                /posts, where that anchor does not exist. */}
            <Link href="/#pricing">Pricing</Link>
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Company</div>
          <div className="mc-footer-links">
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/posts">Research</Link>
            <Link href="/faqs">FAQs</Link>
          </div>
        </div>

        <div>
          <div className="mc-footer-h">Legal</div>
          <div className="mc-footer-links">
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

      <div className="mc-footer-bottom">
        <span>© {year} MarketCatalyst. All rights reserved.</span>
        <span>Informational purposes only — not investment advice.</span>
      </div>
    </footer>
  );
}
