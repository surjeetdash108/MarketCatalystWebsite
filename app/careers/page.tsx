import type { Metadata } from "next";
import { careersIndexHtml } from "@/content/careers";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Careers | MarketCatalyst",
  description:
    "Join the team building an AI stock research terminal. Open engineering, data and equity research roles at MarketCatalyst Analytics LLC.",
  path: "/careers",
});

export default function CareersIndexPage() {
  return (
    <section
      className="mc-careers"
      id="careers"
      aria-labelledby="mc-careers-title"
      dangerouslySetInnerHTML={{ __html: careersIndexHtml }}
    />
  );
}
