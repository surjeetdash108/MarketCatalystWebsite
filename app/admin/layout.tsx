// The admin console and editor are built on the older iq-* design system.
// Scoped here rather than in the root layout so public pages don't download
// 115KB of styles they never use.
import "../iq.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
