/**
 * Helpers for The GenValue Dispatch blog posts.
 */

const DEFAULT_COVER = "/images/posts/marketer-tools-2026.png";

export function normalizeTag(tag) {
  return String(tag).trim().replace(/\s+/g, " ").slice(0, 40);
}

export function normalizeTagsList(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const t = normalizeTag(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(t);
    if (result.length >= 10) break;
  }
  return result;
}

export function slugifyTitle(title) {
  const base = String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return base || "dispatch-post";
}

export async function generateUniqueSlug(prisma, title) {
  const base = slugifyTitle(title);
  let slug = base;
  let attempt = 0;

  while (attempt < 20) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export function estimateReadTime(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function authorRoleLabel(user) {
  if (!user) return "GenValue Community";
  if (user.isSuperAdmin) return "GenValue Admin";
  if (user.role === "ADMIN") return "GenValue Admin";
  if (user.role === "INSTRUCTOR") return "GenValue Instructor";
  return "GenValue Student";
}

export function serializeBlogPost(post) {
  const authorName = post.author?.name ?? "GenValue Author";
  const authorRole = authorRoleLabel(post.author);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    date: (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10),
    author: authorName,
    authorRole,
    authorId: post.authorId,
    category: post.category,
    tags: post.tags ?? [],
    coverImage: post.coverImage || DEFAULT_COVER,
    readTime: post.readTime || estimateReadTime(post.content),
    featured: post.featured,
    status: post.status,
    reviewNotes: post.reviewNotes ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    reviewedBy: post.reviewedBy
      ? { id: post.reviewedBy.id, name: post.reviewedBy.name, email: post.reviewedBy.email }
      : null,
  };
}

export const AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
};

export const BLOG_POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  reviewedBy: { select: AUTHOR_SELECT },
};
