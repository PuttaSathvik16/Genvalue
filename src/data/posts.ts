import type { BlogPost } from "@/types/blog";

/** @deprecated Use BlogPost from @/types/blog */
export type Post = BlogPost;

const PLACEHOLDER_BODY =
  "Full article coming soon. We're drafting the detailed sections, examples, and screenshots - check back shortly.\n\nThis placeholder lets you wire up routing, SEO, and layout before the final copy lands.";

export const posts: Post[] = [
  {
    id: "post-marketer-tools-2026",
    slug: "5-ai-tools-every-marketer-needs-2026",
    title: "The 5 AI Tools Every Marketer Needs in 2026",
    excerpt:
      "Stop guessing which AI tool to use for marketing. Here are the 5 that actually move the needle - and exactly when to use each one.",
    content: PLACEHOLDER_BODY,
    date: "2026-04-15",
    author: "Sathvik Putta",
    authorRole: "Founder, GenValue",
    category: "Marketing",
    tags: ["AI Tools", "Marketing", "Jasper", "Surfer SEO", "ChatGPT"],
    coverImage: "/images/posts/marketer-tools-2026.png",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: "post-chatgpt-claude-gemini-2026",
    slug: "chatgpt-vs-claude-vs-gemini-2026",
    title: "ChatGPT vs Claude vs Gemini in 2026 - Which Should You Use?",
    excerpt:
      "All three are powerful. None of them is best for everything. Here is the honest, practical breakdown of when to use each.",
    content: PLACEHOLDER_BODY,
    date: "2026-04-22",
    author: "Sathvik Putta",
    authorRole: "Founder, GenValue",
    category: "General AI",
    tags: ["ChatGPT", "Claude", "Gemini", "Comparison"],
    coverImage: "/images/posts/chatgpt-claude-gemini-2026.png",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "post-zapier-make-workflow",
    slug: "build-ai-workflow-zapier-make",
    title: "How to Build Your First AI Workflow with Zapier and Make",
    excerpt:
      "Automation does not require code. This step-by-step guide shows you how to build a full AI-powered workflow using Zapier and Make in one afternoon.",
    content: PLACEHOLDER_BODY,
    date: "2026-04-29",
    author: "Sathvik Putta",
    authorRole: "Founder & Lead Instructor, GenValue",
    category: "AI Agents",
    tags: ["Automation", "Zapier", "Make", "Workflows"],
    coverImage: "/images/posts/zapier-make-ai-workflow-2026.png",
    readTime: "10 min read",
    featured: false,
  },
];

/** @deprecated Prefer importing `posts` */
export const POSTS = posts;

export function getFeaturedPosts(): Post[] {
  return posts.filter((p) => p.featured);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 2): Post[] {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}

/** Splits optional markdown-style body into paragraphs for rendering. */
export function getPostParagraphs(post: Post): string[] {
  if (post.content?.trim()) {
    return post.content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [PLACEHOLDER_BODY.split("\n\n")[0] ?? "Coming soon."];
}
