// The logged-in trading terminal (MarketCatalystUI) lives on its own app,
// separate from this marketing/blog/admin site. Customer auth (login/signup)
// belongs there, not here — this repo's own Firebase Auth usage is reserved
// for the admin/editor CMS. Marketing CTAs just link out to it.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.marketcatalyst.ai";

export const APP_LOGIN_URL = `${APP_URL}/auth/login`;
export const APP_SIGNUP_URL = `${APP_URL}/auth/signup`;
