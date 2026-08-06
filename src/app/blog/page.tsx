import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/BlogListing";
import { posts as staticPosts } from "@/data/posts";
import { buildPageMetadata } from "@/lib/seo";
import { fetchPublishedPosts, mergeBlogPosts } from "@/services/blogService";

type Props = Readonly<{ searchParams: Promise<{ tag?: string }> }>;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/blog",
    title: "The GenValue Dispatch | AI Tooling & Workflow Journal",
    description:
      "Deep dives on AI tool selection, prompt engineering, and workflow automation for working professionals.",
    ogTitle: "The GenValue Dispatch | AI Tooling & Workflow Journal",
  });
}

export default async function BlogPage({ searchParams }: Props) {
  const { tag } = await searchParams;

  let apiPosts: Awaited<ReturnType<typeof fetchPublishedPosts>> = [];
  try {
    apiPosts = await fetchPublishedPosts({ limit: 50 });
  } catch {
    // API unavailable — fall back to static posts only
  }

  const allPosts = mergeBlogPosts(apiPosts, staticPosts);

  return <BlogListing posts={allPosts} initialTag={tag} />;
}
