import type { Metadata } from "next";
import { careersIndexHtml } from "@/content/careers";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Careers | MarketCatalyst",
  description:
    "Open engineering, data and equity research roles at MarketCatalyst Analytics LLC. Remote roles for Texas residents.",
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
