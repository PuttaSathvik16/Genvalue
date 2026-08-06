/** Blog post shape shared across marketing site and LMS portals. */
export type BlogPostStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  authorRole: string;
  authorId?: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  featured: boolean;
  status?: BlogPostStatus;
  reviewNotes?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  featured?: boolean;
}

export const BLOG_CATEGORIES = [
  "General AI",
  "Marketing",
  "AI Agents",
  "Prompt Engineering",
  "Workflows",
  "Career",
  "Student Stories",
] as const;

export const BLOG_STATUS_LABELS: Record<BlogPostStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending Review",
  PUBLISHED: "Published",
  REJECTED: "Needs Revision",
};

export const BLOG_STATUS_BADGE: Record<BlogPostStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-slate-300",
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};
