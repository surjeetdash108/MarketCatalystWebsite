"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: React.ReactNode; adminOnly?: boolean };

const posts = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3h14v18H5z" /><path d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);
const media = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5L5 20" />
  </svg>
);
const editors = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 4a3 3 0 0 1 0 6M18 20c0-2.5-1-4.7-2.5-6" />
  </svg>
);
const contact = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" />
  </svg>
);

const ITEMS: NavItem[] = [
  { href: "/admin/posts", label: "Posts", icon: posts },
  { href: "/admin/media", label: "Media", icon: media },
  { href: "/admin/users", label: "Editors", icon: editors, adminOnly: true },
  { href: "/admin/contact-submissions", label: "Contact submissions", icon: contact },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {ITEMS.filter((i) => !i.adminOnly || role === "ADMIN").map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className={`navitem${active ? " active" : ""}`}>
            <span className="nicon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
