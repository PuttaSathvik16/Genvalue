import type { MetadataRoute } from "next";
import { POSTS } from "@/data/posts";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const blogPosts: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T12:00:00`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/team`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/syllabus`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/instructors`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...blogPosts,
  ];

  return routes;
}
