import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "./app-url";

// The original MarketCatalystUI landing page opened a Firebase login/signup
// modal here. This is the marketing/blog/admin site, not the trading app, so
// there is no customer-facing auth to embed — these just link out to the
// terminal app's own login/signup pages.
export function Nav() {
  return (
    <nav className="hw-nav">
      <Link href="/" className="hw-brand">
        <span className="hw-logo">
          <LogoMark />
        </span>
        MarketCatalyst
      </Link>
      <div className="hw-nav-cta">
        <a className="hw-ghost" href={APP_LOGIN_URL}>
          Log in
        </a>
        <a className="hw-solid" href={APP_SIGNUP_URL}>
          Sign up
        </a>
      </div>
    </nav>
  );
}
