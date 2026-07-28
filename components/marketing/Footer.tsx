import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "./app-url";

// New for the marketing site — MarketCatalystUI's landing page had no footer
// of its own. Built in the same `hw-*` / CSS-custom-property visual language
// as the rest of `landing.css` rather than reusing any dashboard chrome.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hw-footer">
      <div className="hw-footer-top">
        <Link href="/" className="hw-brand">
          <span className="hw-logo">
            <LogoMark />
          </span>
          MarketCatalyst
        </Link>
        <p className="hw-footer-tag">Market intelligence, narrated. Ticker to thesis, in one terminal.</p>
      </div>

      <div className="hw-footer-cols">
        <div className="hw-footer-col">
          <div className="hw-footer-h">Product</div>
          <a href={APP_SIGNUP_URL}>Sign up</a>
          <a href={APP_LOGIN_URL}>Log in</a>
          <Link href="/#pricing">Pricing</Link>
        </div>
        <div className="hw-footer-col">
          <div className="hw-footer-h">Company</div>
          <Link href="/contact">Contact us</Link>
          <Link href="/blog">Blog</Link>
        </div>
        <div className="hw-footer-col">
          <div className="hw-footer-h">Legal</div>
          <Link href="/legal/terms">Terms of service</Link>
          <Link href="/legal/privacy">Privacy policy</Link>
        </div>
        <div className="hw-footer-col hw-footer-col-cta">
          <div className="hw-footer-h">Get in touch</div>
          <p className="hw-footer-note">Questions about the product, partnerships or press? We read every message.</p>
          <Link href="/contact" className="hw-footer-contact-btn">
            Contact us →
          </Link>
        </div>
      </div>

      <div className="hw-footer-bottom">
        <span>© {year} MarketCatalyst. All rights reserved.</span>
        <span className="hw-footer-disclaimer">Informational purposes only — not investment advice.</span>
      </div>
    </footer>
  );
}
