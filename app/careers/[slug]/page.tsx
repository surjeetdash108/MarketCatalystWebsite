import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobs } from "@/content/careers";
import { pageMetadata } from "@/lib/seo/og";

export function generateStaticParams() {
  return jobs.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job) return {};

  return pageMetadata({
    title: job.metaTitle,
    description: job.metaDescription,
    path: `/careers/${job.slug}`,
  });
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = jobs.find((j) => j.slug === slug);
  if (!job) return notFound();

  const ld = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(job.jobPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld(job.breadcrumb) }}
      />
      <article
        className="mc-careers mc-role-page"
        aria-labelledby="mc-role-title"
        dangerouslySetInnerHTML={{ __html: job.html }}
      />
    </>
  );
}
