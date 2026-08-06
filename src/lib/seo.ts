import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

type PageSeoInput = {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly ogTitle?: string;
};

/**
 * Shared metadata pattern for route segments (canonical, Open Graph, Twitter).
 */
export function buildPageMetadata({
  path,
  title,
  description,
  ogTitle,
}: PageSeoInput): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${SITE_URL}${canonicalPath}`;
  const openGraphTitle = ogTitle ?? title;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      siteName: "GenValue",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
    },
  };
}
