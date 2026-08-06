/**
 * Canonical site origin for metadata, sitemap, robots, and JSON-LD.
 * Override with NEXT_PUBLIC_SITE_URL in production (e.g. https://www.genvalue.academy).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://genvalue.academy"
).replace(/\/$/, "");
