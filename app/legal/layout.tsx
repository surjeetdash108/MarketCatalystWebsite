import { ReaderShell } from "@/components/chrome/ReaderShell";

// Terms and Privacy used to sit inside their own private shell, borrowed
// from the admin console's stylesheet (BrandLogo header, a bespoke
// light-only palette). That made these the only public pages not drawn
// from app/theme.css. Now they wear the same nav/footer/theme-switch as
// every other reading page (see components/chrome/ReaderShell.tsx and the
// identical rationale in app/posts/article-shell.tsx).
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <ReaderShell>{children}</ReaderShell>;
}
